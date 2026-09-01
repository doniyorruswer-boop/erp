import { Injectable, BadRequestException, Logger } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { AuditService } from '../audit/audit.service';
import { AuditAction, PaymentMethod, PaymentStatus, StudentStatus } from '@prisma/client';
import { ImportEntityType, PreviewImportDto, ConfirmImportDto, ExportQueryDto } from './dto/import-export.dto';
import { BranchContext, buildBranchWhere } from '../auth/branch-access';

@Injectable()
export class ImportExportService {
  private readonly logger = new Logger(ImportExportService.name);

  constructor(
    private prisma: PrismaService,
    private auditService: AuditService,
  ) {}

  // Parse CSV string into array of objects
  parseCsv(csvContent: string): Record<string, any>[] {
    if (!csvContent || typeof csvContent !== 'string') return [];

    // Remove BOM if present
    const cleanContent = csvContent.replace(/^\uFEFF/, '').trim();
    const lines = cleanContent.split(/\r\n|\n|\r/);
    if (lines.length < 2) return [];

    // Detect delimiter (, or ;)
    const headerLine = lines[0];
    const delimiter = headerLine.includes(';') && !headerLine.includes(',') ? ';' : ',';

    const parseLine = (line: string): string[] => {
      const result: string[] = [];
      let current = '';
      let inQuotes = false;

      for (let i = 0; i < line.length; i++) {
        const char = line[i];
        if (char === '"') {
          if (inQuotes && line[i + 1] === '"') {
            current += '"';
            i++;
          } else {
            inQuotes = !inQuotes;
          }
        } else if (char === delimiter && !inQuotes) {
          result.push(current.trim());
          current = '';
        } else {
          current += char;
        }
      }
      result.push(current.trim());
      return result;
    };

    const headers = parseLine(lines[0]).map(h => h.replace(/^["']|["']$/g, '').trim());

    const rows: Record<string, any>[] = [];
    for (let i = 1; i < lines.length; i++) {
      const line = lines[i].trim();
      if (!line) continue;

      const values = parseLine(line);
      const row: Record<string, any> = {};

      headers.forEach((header, idx) => {
        let val = values[idx] !== undefined ? values[idx] : '';
        val = val.replace(/^["']|["']$/g, '').trim();
        row[header] = val;
      });

      rows.push(row);
    }

    return rows;
  }

  // Convert array of objects to CSV string
  toCsv(headers: { key: string; label: string }[], data: Record<string, any>[]): string {
    const headerRow = headers.map(h => `"${h.label.replace(/"/g, '""')}"`).join(',');
    const dataRows = data.map(item =>
      headers
        .map(h => {
          const val = item[h.key] !== undefined && item[h.key] !== null ? String(item[h.key]) : '';
          return `"${val.replace(/"/g, '""')}"`;
        })
        .join(','),
    );

    return '\uFEFF' + [headerRow, ...dataRows].join('\r\n');
  }

  async preview(data: PreviewImportDto, orgId: string) {
    let rows = data.rows || [];

    if (data.csvContent) {
      rows = this.parseCsv(data.csvContent);
    }

    if (rows.length === 0) {
      throw new BadRequestException('Import qilish uchun hech qanday ma\'lumot topilmadi');
    }

    const validRows: Record<string, any>[] = [];
    const errors: { row: number; field: string; error: string; data: any }[] = [];

    // Pre-fetch existing phones for duplicate checks
    const existingPhones = new Set<string>();
    if (data.entityType === ImportEntityType.STUDENT) {
      const students = await this.prisma.student.findMany({
        where: { organizationId: orgId, deletedAt: null },
        select: { phone: true },
      });
      students.forEach(s => existingPhones.add(s.phone));
    } else if (data.entityType === ImportEntityType.CUSTOMER) {
      const customers = await this.prisma.customer.findMany({
        where: { organizationId: orgId, deletedAt: null },
        select: { phone: true },
      });
      customers.forEach(c => existingPhones.add(c.phone));
    }

    rows.forEach((rawRow, idx) => {
      const rowNum = idx + 1;
      const row: Record<string, any> = {};

      // Normalize keys to lowercase/camelCase
      Object.entries(rawRow).forEach(([k, v]) => {
        const key = k.toLowerCase().replace(/[\s_-]+/g, '');
        row[key] = v;
      });

      if (data.entityType === ImportEntityType.STUDENT) {
        const firstName = row.firstname || row.ism || row.name?.split(' ')[0];
        const lastName = row.lastname || row.familiya || row.name?.split(' ')[1] || '';
        const phone = row.phone || row.telefon || row.tel;

        if (!firstName) {
          errors.push({ row: rowNum, field: 'firstName', error: 'Ism kiritilmagan', data: rawRow });
          return;
        }
        if (!phone) {
          errors.push({ row: rowNum, field: 'phone', error: 'Telefon raqami kiritilmagan', data: rawRow });
          return;
        }

        const formattedPhone = String(phone).replace(/\s+/g, '');
        if (existingPhones.has(formattedPhone)) {
          errors.push({ row: rowNum, field: 'phone', error: 'Ushbu telefon raqami bilan talaba allaqachon mavjud', data: rawRow });
          return;
        }

        validRows.push({
          firstName,
          lastName,
          phone: formattedPhone,
          level: row.level || row.daraja || null,
          source: row.source || row.manba || 'IMPORT',
        });
      } else if (data.entityType === ImportEntityType.CUSTOMER) {
        const firstName = row.firstname || row.ism || row.name?.split(' ')[0];
        const lastName = row.lastname || row.familiya || row.name?.split(' ')[1] || '';
        const phone = row.phone || row.telefon || row.tel;

        if (!firstName) {
          errors.push({ row: rowNum, field: 'firstName', error: 'Ism kiritilmagan', data: rawRow });
          return;
        }
        if (!phone) {
          errors.push({ row: rowNum, field: 'phone', error: 'Telefon raqami kiritilmagan', data: rawRow });
          return;
        }

        const formattedPhone = String(phone).replace(/\s+/g, '');
        validRows.push({
          firstName,
          lastName,
          phone: formattedPhone,
          company: row.company || row.kompaniya || null,
          email: row.email || null,
        });
      } else if (data.entityType === ImportEntityType.LEAD) {
        const fullName = row.fullname || row.ism || row.name || (row.firstname ? `${row.firstname} ${row.lastname || ''}` : null);
        const phone = row.phone || row.telefon || row.tel;

        if (!fullName) {
          errors.push({ row: rowNum, field: 'fullName', error: 'F.I.SH kiritilmagan', data: rawRow });
          return;
        }
        if (!phone) {
          errors.push({ row: rowNum, field: 'phone', error: 'Telefon raqami kiritilmagan', data: rawRow });
          return;
        }

        validRows.push({
          fullName,
          phone: String(phone).replace(/\s+/g, ''),
          source: row.source || row.manba || 'IMPORT',
          notes: row.notes || row.izoh || null,
        });
      } else if (data.entityType === ImportEntityType.PAYMENT) {
        const amount = Number(row.amount || row.summa || row.narx);
        const studentId = row.studentid || row.talabaid;
        const customerId = row.customerid || row.mijozid;

        if (!amount || isNaN(amount) || amount <= 0) {
          errors.push({ row: rowNum, field: 'amount', error: 'To\'lov summasi noto\'g\'ri', data: rawRow });
          return;
        }

        validRows.push({
          studentId: studentId || null,
          customerId: customerId || null,
          amount,
          method: (row.method || row.usul || 'CASH').toUpperCase(),
          notes: row.notes || row.izoh || 'Import to\'lovi',
        });
      }
    });

    return {
      entityType: data.entityType,
      totalRows: rows.length,
      validCount: validRows.length,
      invalidCount: errors.length,
      errors,
      preview: validRows.slice(0, 10),
      validRows,
    };
  }

  async confirm(data: ConfirmImportDto, orgId: string, userId?: string) {
    const rows = data.rows || [];

    if (rows.length === 0) {
      throw new BadRequestException('Import qilish uchun tasdiqlangan qatorlar mavjud emas');
    }

    const inserted = [];

    if (data.entityType === ImportEntityType.STUDENT) {
      for (const row of rows) {
        const student = await this.prisma.student.create({
          data: {
            organizationId: orgId,
            firstName: row.firstName,
            lastName: row.lastName,
            phone: row.phone,
            level: row.level,
            source: row.source || 'IMPORT',
            status: StudentStatus.ACTIVE,
          },
        });
        inserted.push(student);
      }
    } else if (data.entityType === ImportEntityType.CUSTOMER) {
      for (const row of rows) {
        const customer = await this.prisma.customer.create({
          data: {
            organizationId: orgId,
            firstName: row.firstName,
            lastName: row.lastName,
            phone: row.phone,
            company: row.company,
            email: row.email,
          },
        });
        inserted.push(customer);
      }
    } else if (data.entityType === ImportEntityType.LEAD) {
      for (const row of rows) {
        const lead = await this.prisma.lead.create({
          data: {
            organizationId: orgId,
            fullName: row.fullName,
            phone: row.phone,
            source: row.source || 'IMPORT',
            notes: row.notes,
          },
        });
        inserted.push(lead);
      }
    } else if (data.entityType === ImportEntityType.PAYMENT) {
      for (const row of rows) {
        if (row.studentId) {
          const student = await this.prisma.student.findFirst({
            where: { id: row.studentId, organizationId: orgId, deletedAt: null },
          });
          if (!student) throw new BadRequestException(`Talaba ID (${row.studentId}) ushbu tashkilotga tegishli emas`);
        }
        if (row.customerId) {
          const customer = await this.prisma.customer.findFirst({
            where: { id: row.customerId, organizationId: orgId, deletedAt: null },
          });
          if (!customer) throw new BadRequestException(`Mijoz ID (${row.customerId}) ushbu tashkilotga tegishli emas`);
        }

        const payment = await this.prisma.payment.create({
          data: {
            organizationId: orgId,
            studentId: row.studentId,
            customerId: row.customerId,
            amount: Number(row.amount),
            method: (row.method as PaymentMethod) || PaymentMethod.CASH,
            notes: row.notes,
            receiptNumber: 'REC-' + Date.now().toString().slice(-8),
            status: PaymentStatus.PAID,
          },
        });
        inserted.push(payment);
      }
    }

    await this.auditService.log({
      organizationId: orgId,
      userId,
      action: AuditAction.CREATE,
      entityType: `BulkImport_${data.entityType}`,
      entityId: `imported_${inserted.length}_records`,
      after: { count: inserted.length, entityType: data.entityType },
    });

    return {
      success: true,
      entityType: data.entityType,
      importedCount: inserted.length,
    };
  }

  async export(entityType: ImportEntityType, query: ExportQueryDto, orgId: string, userId?: string, branchCtx?: BranchContext) {
    let data: any[] = [];
    let headers: { key: string; label: string }[] = [];
    const branchFilter = branchCtx ? buildBranchWhere(branchCtx) : {};

    if (entityType === ImportEntityType.STUDENT) {
      headers = [
        { key: 'id', label: 'ID' },
        { key: 'firstName', label: 'Ism' },
        { key: 'lastName', label: 'Familiya' },
        { key: 'phone', label: 'Telefon' },
        { key: 'balance', label: 'Balans (UZS)' },
        { key: 'status', label: 'Holati' },
        { key: 'source', label: 'Manba' },
        { key: 'createdAt', label: 'Ro\'yxatdan o\'tgan sana' },
      ];
      data = await this.prisma.student.findMany({
        where: { organizationId: orgId, deletedAt: null, ...branchFilter },
        orderBy: { createdAt: 'desc' },
      });
    } else if (entityType === ImportEntityType.CUSTOMER) {
      headers = [
        { key: 'id', label: 'ID' },
        { key: 'firstName', label: 'Ism' },
        { key: 'lastName', label: 'Familiya' },
        { key: 'phone', label: 'Telefon' },
        { key: 'email', label: 'Email' },
        { key: 'company', label: 'Kompaniya' },
        { key: 'createdAt', label: 'Yaratilgan sana' },
      ];
      data = await this.prisma.customer.findMany({
        where: { organizationId: orgId, deletedAt: null, ...branchFilter },
        orderBy: { createdAt: 'desc' },
      });
    } else if (entityType === ImportEntityType.LEAD) {
      headers = [
        { key: 'id', label: 'ID' },
        { key: 'fullName', label: 'F.I.SH' },
        { key: 'phone', label: 'Telefon' },
        { key: 'status', label: 'Holati' },
        { key: 'source', label: 'Manba' },
        { key: 'createdAt', label: 'Tushgan sana' },
      ];
      data = await this.prisma.lead.findMany({
        where: { organizationId: orgId, deletedAt: null, ...branchFilter },
        orderBy: { createdAt: 'desc' },
      });
    } else if (entityType === ImportEntityType.PAYMENT) {
      headers = [
        { key: 'receiptNumber', label: 'Chek №' },
        { key: 'amount', label: 'Summa (UZS)' },
        { key: 'method', label: 'To\'lov usuli' },
        { key: 'status', label: 'Holati' },
        { key: 'paymentDate', label: 'Sana' },
        { key: 'notes', label: 'Izoh' },
      ];
      data = await this.prisma.payment.findMany({
        where: { organizationId: orgId, deletedAt: null, ...branchFilter },
        orderBy: { paymentDate: 'desc' },
      });
    }

    await this.auditService.log({
      organizationId: orgId,
      userId,
      action: AuditAction.LOGIN, // Export audit marker
      entityType: `Export_${entityType}`,
      entityId: `exported_${data.length}_records`,
      after: { count: data.length, format: query.format || 'csv' },
    });

    if (query.format === 'json') {
      return { format: 'json', data };
    }

    const csvString = this.toCsv(headers, data);
    return {
      format: 'csv',
      filename: `${entityType.toLowerCase()}_export_${new Date().toISOString().split('T')[0]}.csv`,
      data: csvString,
      count: data.length,
    };
  }
}
