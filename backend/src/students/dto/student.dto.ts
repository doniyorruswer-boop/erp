import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsEnum,
  IsArray,
  IsEmail,
  IsDateString,
  IsObject,
  IsBoolean,
  ValidateNested,
  MaxLength,
} from 'class-validator';
import { Type } from 'class-transformer';
import { ApiProperty, ApiPropertyOptional, PartialType } from '@nestjs/swagger';
import { StudentStatus } from '@prisma/client';
import { PaginationDto } from '../../common/dto/pagination.dto';

export class StudentParentItemDto {
  @ApiPropertyOptional({ description: 'Ota-ona ismi', example: 'Dilnoza Karimova' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  fullName?: string;

  @ApiPropertyOptional({ description: 'Telefon raqami', example: '+998909876543' })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  phone?: string;

  @ApiPropertyOptional({ description: 'Qarindoshlik darajasi (masalan: Otasi, Onasi, Vasiysi)', example: 'Onasi' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  relationship?: string;

  @ApiPropertyOptional({ description: 'Asosiy ota-onami', default: true })
  @IsBoolean()
  @IsOptional()
  isPrimary?: boolean;
}

export class CreateStudentDto {
  @ApiProperty({ description: 'O\'quvchining ismi', example: 'Azizbek' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(100)
  firstName: string;

  @ApiPropertyOptional({ description: 'O\'quvchining familiyasi', example: 'Karimov' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  lastName?: string;

  @ApiProperty({ description: 'Telefon raqami', example: '+998901234567' })
  @IsString()
  @IsNotEmpty()
  @MaxLength(20)
  phone: string;

  @ApiPropertyOptional({ description: 'Elektron pochta manzili', example: 'aziz@example.com' })
  @IsEmail()
  @IsOptional()
  email?: string;

  @ApiPropertyOptional({ description: 'Pasport yoki metrika seriyasi va raqami', example: 'AA1234567' })
  @IsString()
  @IsOptional()
  @MaxLength(30)
  passportNumber?: string;

  @ApiPropertyOptional({ description: 'JShShIR (PINFL)', example: '12345678901234' })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  pinfl?: string;

  @ApiPropertyOptional({ description: 'Jinsi', example: 'MALE', enum: ['MALE', 'FEMALE'] })
  @IsString()
  @IsOptional()
  gender?: string;

  @ApiPropertyOptional({ description: 'Tug\'ilgan sanasi', example: '2005-04-12' })
  @IsDateString()
  @IsOptional()
  birthDate?: string;

  @ApiPropertyOptional({ description: 'Ro\'yxatdan o\'tgan / qabul qilingan sana', example: '2026-09-01' })
  @IsDateString()
  @IsOptional()
  enrolledDate?: string;

  @ApiPropertyOptional({ description: 'Bilim darajasi (masalan: Beginner, Elementary, B1)', example: 'Elementary' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  level?: string;

  @ApiPropertyOptional({ description: 'O\'qish kunlari', example: ['ODD_DAYS', 'WEEKEND'], type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  studyDays?: string[];

  @ApiPropertyOptional({ description: 'O\'rganish tillari', example: ['ENGLISH', 'RUSSIAN'], type: [String] })
  @IsArray()
  @IsString({ each: true })
  @IsOptional()
  studyLanguages?: string[];

  @ApiPropertyOptional({ description: 'Qulay bog\'lanish vaqti', example: '14:00 - 18:00' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  contactTime?: string;

  @ApiPropertyOptional({ description: 'Shartnoma raqami', example: 'SH-2026-0042' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  contractNumber?: string;

  @ApiPropertyOptional({ description: 'Viloyat', example: 'Toshkent shahri' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  region?: string;

  @ApiPropertyOptional({ description: 'Shahar / Tuman', example: 'Yunusobod' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  city?: string;

  @ApiPropertyOptional({ description: 'To\'liq yashash manzili', example: '12-mavze, 4-uy, 15-xonadon' })
  @IsString()
  @IsOptional()
  @MaxLength(255)
  address?: string;

  @ApiPropertyOptional({ description: 'Ish joyi yoki maktabi', example: '154-umumiy o\'rta ta\'lim maktabi' })
  @IsString()
  @IsOptional()
  @MaxLength(150)
  workplace?: string;

  @ApiPropertyOptional({ description: 'Kelish manbasi (masalan: Instagram, Telegram, Banner)', example: 'Instagram' })
  @IsString()
  @IsOptional()
  @MaxLength(50)
  source?: string;

  @ApiPropertyOptional({ description: 'Ota-onasi ismi (birlamchi kontakt)', example: 'Dilnoza Karimova' })
  @IsString()
  @IsOptional()
  @MaxLength(100)
  parentName?: string;

  @ApiPropertyOptional({ description: 'Ota-onasi telefon raqami', example: '+998909876543' })
  @IsString()
  @IsOptional()
  @MaxLength(20)
  parentPhone?: string;

  @ApiPropertyOptional({ description: 'Ota-onasi emaili', example: 'dilnoza@example.com' })
  @IsEmail()
  @IsOptional()
  parentEmail?: string;

  @ApiPropertyOptional({ description: 'Ko\'p ota-onalar ro\'yxati', type: [StudentParentItemDto] })
  @IsArray()
  @ValidateNested({ each: true })
  @Type(() => StudentParentItemDto)
  @IsOptional()
  parents?: StudentParentItemDto[];

  @ApiPropertyOptional({ description: 'Qo\'shimcha izohlar', example: 'Ingliz tili IELTS guruhiga yozilmoqchi' })
  @IsString()
  @IsOptional()
  notes?: string;

  @ApiPropertyOptional({ description: 'Boshlang\'ich guruh IDsi (birinchi guruhga darhol a\'zo qilish uchun)' })
  @IsString()
  @IsOptional()
  initialGroupId?: string;

  @ApiPropertyOptional({ description: 'Filial IDsi' })
  @IsString()
  @IsOptional()
  branchId?: string;

  @ApiPropertyOptional({ description: 'O\'quvchi holati', enum: StudentStatus, default: StudentStatus.ACTIVE })
  @IsEnum(StudentStatus)
  @IsOptional()
  status?: StudentStatus = StudentStatus.ACTIVE;

  @ApiPropertyOptional({ description: 'Qo\'shimcha dinamik maydonlar', type: Object })
  @IsObject()
  @IsOptional()
  customFields?: Record<string, any>;
}

export class UpdateStudentDto extends PartialType(CreateStudentDto) {}

export class QueryStudentDto extends PaginationDto {
  @ApiPropertyOptional({ description: 'Holati bo\'yicha filter', enum: StudentStatus })
  @IsEnum(StudentStatus)
  @IsOptional()
  status?: StudentStatus;

  @ApiPropertyOptional({ description: 'Guruh IDsi bo\'yicha filter' })
  @IsString()
  @IsOptional()
  groupId?: string;

  @ApiPropertyOptional({ description: 'Filial IDsi bo\'yicha filter' })
  @IsString()
  @IsOptional()
  branchId?: string;

  @ApiPropertyOptional({ description: 'Bilim darajasi bo\'yicha filter' })
  @IsString()
  @IsOptional()
  level?: string;
}
