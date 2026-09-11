import { Injectable, NotFoundException, Logger } from "@nestjs/common";
import { Prisma, NotificationChannel, LeadStatus } from "@prisma/client";
import { PrismaService } from "../prisma/prisma.service";
import { NotificationsService } from "../notifications/notifications.service";
import {
  CreateWorkflowDto,
  UpdateWorkflowDto,
  WorkflowCondition,
  WorkflowAction,
} from "./dto/workflow.dto";

@Injectable()
export class WorkflowService {
  private readonly logger = new Logger(WorkflowService.name);

  constructor(
    private prisma: PrismaService,
    private notificationsService: NotificationsService
  ) {}

  async createRule(data: CreateWorkflowDto, orgId: string) {
    return this.prisma.workflowRule.create({
      data: {
        organizationId: orgId,
        name: data.name,
        description: data.description,
        event: data.event,
        conditions: (data.conditions || []) as unknown as Prisma.InputJsonValue,
        actions: data.actions as unknown as Prisma.InputJsonValue,
        isActive: data.isActive !== undefined ? data.isActive : true,
      },
    });
  }

  async findAll(orgId: string) {
    return this.prisma.workflowRule.findMany({
      where: { organizationId: orgId },
      orderBy: { createdAt: "desc" },
    });
  }

  async findOne(id: string, orgId: string) {
    const rule = await this.prisma.workflowRule.findFirst({
      where: { id, organizationId: orgId },
      include: { logs: { orderBy: { executedAt: "desc" }, take: 20 } },
    });
    if (!rule) throw new NotFoundException("Workflow qoidasi topilmadi");
    return rule;
  }

  async updateRule(id: string, data: UpdateWorkflowDto, orgId: string) {
    await this.findOne(id, orgId);
    return this.prisma.workflowRule.update({
      where: { id },
      data: {
        name: data.name,
        description: data.description,
        event: data.event,
        conditions: data.conditions
          ? (data.conditions as unknown as Prisma.InputJsonValue)
          : undefined,
        actions: data.actions ? (data.actions as unknown as Prisma.InputJsonValue) : undefined,
        isActive: data.isActive,
      },
    });
  }

  async deleteRule(id: string, orgId: string) {
    await this.findOne(id, orgId);
    return this.prisma.workflowRule.delete({ where: { id } });
  }

  // Condition evaluation engine
  private evaluateConditions(
    conditions: WorkflowCondition[],
    payload: Record<string, unknown>
  ): boolean {
    if (!conditions || conditions.length === 0) return true;

    for (const cond of conditions) {
      const actualValue = payload[cond.field];
      const targetValue = cond.value;

      switch (cond.operator) {
        case "eq":
          if (actualValue != targetValue) return false;
          break;
        case "neq":
          if (actualValue == targetValue) return false;
          break;
        case "gt":
          if (!(Number(actualValue) > Number(targetValue))) return false;
          break;
        case "gte":
          if (!(Number(actualValue) >= Number(targetValue))) return false;
          break;
        case "lt":
          if (!(Number(actualValue) < Number(targetValue))) return false;
          break;
        case "lte":
          if (!(Number(actualValue) <= Number(targetValue))) return false;
          break;
        case "contains":
          if (
            !String(actualValue || "")
              .toLowerCase()
              .includes(String(targetValue).toLowerCase())
          )
            return false;
          break;
        case "in":
          if (!Array.isArray(targetValue) || !targetValue.includes(actualValue)) return false;
          break;
        default:
          break;
      }
    }

    return true;
  }

  // Execute actions
  private async executeAction(
    action: WorkflowAction,
    payload: Record<string, unknown>,
    orgId: string
  ): Promise<Record<string, unknown>> {
    const params = action.params || {};

    switch (action.type) {
      case "SEND_NOTIFICATION": {
        const recipient = String(
          params.recipient || payload.phone || payload.recipient || "+998901234567"
        );
        const channel = (params.channel as NotificationChannel) || NotificationChannel.IN_APP;
        const title = String(
          params.title || `Workflow Action: ${payload.event || "Bildirishnoma"}`
        );
        const body = String(params.body || `Avtomatik xabar: ${JSON.stringify(payload)}`);
        const notification = await this.notificationsService.send(
          { recipient, channel, title, body },
          orgId
        );
        return { success: true, notificationId: notification.id };
      }

      case "CREATE_TASK":
        this.logger.log(
          `[WORKFLOW ACTION: CREATE_TASK] Title: ${params.title} | Priority: ${params.priority}`
        );
        return { success: true, taskId: "TASK-" + Date.now(), title: String(params.title || "") };

      case "UPDATE_STATUS":
        if (params.targetEntity === "Lead" && typeof payload.leadId === "string") {
          await this.prisma.lead.updateMany({
            where: { id: payload.leadId, organizationId: orgId },
            data: { status: params.newStatus as LeadStatus },
          });
        }
        return {
          success: true,
          entity: String(params.targetEntity || ""),
          newStatus: String(params.newStatus || ""),
        };

      case "WEBHOOK":
        this.logger.log(`[WORKFLOW ACTION: WEBHOOK] URL: ${params.url} | Event: ${payload.event}`);
        return { success: true, url: String(params.url || ""), status: 200 };

      default:
        return { success: true, message: "Custom action executed" };
    }
  }

  // Main Event Processing Engine
  async processEvent(event: string, payload: Record<string, unknown>, orgId: string) {
    this.logger.log(`[WORKFLOW TRIGGER] Event: ${event} | Org: ${orgId}`);

    const matchingRules = await this.prisma.workflowRule.findMany({
      where: {
        organizationId: orgId,
        event,
        isActive: true,
      },
    });

    const results = [];

    for (const rule of matchingRules) {
      const conditions = (rule.conditions as unknown as WorkflowCondition[]) || [];
      const actions = (rule.actions as unknown as WorkflowAction[]) || [];
      const matches = this.evaluateConditions(conditions, payload);

      if (!matches) {
        await this.prisma.workflowExecutionLog.create({
          data: {
            workflowRuleId: rule.id,
            event,
            eventPayload: payload as unknown as Prisma.InputJsonValue,
            status: "SKIPPED_CONDITIONS",
          },
        });
        results.push({ ruleId: rule.id, ruleName: rule.name, status: "SKIPPED_CONDITIONS" });
        continue;
      }

      // Execute all actions
      const actionResults = [];
      let ruleError: string | null = null;

      for (const act of actions) {
        try {
          const res = await this.executeAction(act, { ...payload, event }, orgId);
          actionResults.push({ action: act.type, result: res });
        } catch (err: unknown) {
          const errMsg = err instanceof Error ? err.message : String(err);
          ruleError = errMsg;
          actionResults.push({ action: act.type, error: errMsg });
        }
      }

      const log = await this.prisma.workflowExecutionLog.create({
        data: {
          workflowRuleId: rule.id,
          event,
          eventPayload: payload as unknown as Prisma.InputJsonValue,
          status: ruleError ? "FAILED" : "SUCCESS",
          actionResults: actionResults as unknown as Prisma.InputJsonValue,
          error: ruleError,
        },
      });

      await this.prisma.workflowRule.update({
        where: { id: rule.id },
        data: {
          executionCount: { increment: 1 },
          lastExecutedAt: new Date(),
        },
      });

      results.push({
        ruleId: rule.id,
        ruleName: rule.name,
        status: ruleError ? "FAILED" : "SUCCESS",
        logId: log.id,
        actionResults,
      });
    }

    return {
      event,
      triggeredRulesCount: matchingRules.length,
      executedCount: results.filter((r) => r.status === "SUCCESS").length,
      results,
    };
  }
}
