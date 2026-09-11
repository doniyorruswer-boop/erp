import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsBoolean,
  IsArray,
  IsObject,
  ValidateNested,
} from "class-validator";
import { Type } from "class-transformer";

export class WorkflowConditionDto {
  @IsString()
  @IsNotEmpty()
  field: string;

  @IsString()
  @IsNotEmpty()
  operator: "eq" | "neq" | "gt" | "gte" | "lt" | "lte" | "contains" | "in";

  @IsNotEmpty()
  value: unknown;
}

export type WorkflowCondition = WorkflowConditionDto;

export class WorkflowActionDto {
  @IsString()
  @IsNotEmpty()
  type: "CREATE_TASK" | "SEND_NOTIFICATION" | "UPDATE_STATUS" | "WEBHOOK";

  @IsObject()
  @IsOptional()
  params?: Record<string, unknown>;
}

export type WorkflowAction = WorkflowActionDto;

export class CreateWorkflowDto {
  @IsString()
  @IsNotEmpty()
  name: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsNotEmpty()
  event: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => WorkflowConditionDto)
  conditions?: WorkflowConditionDto[];

  @IsArray()
  @IsNotEmpty()
  @ValidateNested({ each: true })
  @Type(() => WorkflowActionDto)
  actions: WorkflowActionDto[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class UpdateWorkflowDto {
  @IsString()
  @IsOptional()
  name?: string;

  @IsString()
  @IsOptional()
  description?: string;

  @IsString()
  @IsOptional()
  event?: string;

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => WorkflowConditionDto)
  conditions?: WorkflowConditionDto[];

  @IsArray()
  @IsOptional()
  @ValidateNested({ each: true })
  @Type(() => WorkflowActionDto)
  actions?: WorkflowActionDto[];

  @IsBoolean()
  @IsOptional()
  isActive?: boolean;
}

export class TriggerEventDto {
  @IsString()
  @IsNotEmpty()
  event: string;

  @IsObject()
  payload: Record<string, unknown>;
}
