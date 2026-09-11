export type LeadStatus =
  | "NEW"
  | "CONTACTED"
  | "NO_ANSWER"
  | "TRIAL_BOOKED"
  | "TRIAL_ATTENDED"
  | "NEGOTIATION"
  | "ENROLLED"
  | "LOST";

export interface LeadFilterOptions {
  search?: string;
  status?: LeadStatus;
  source?: string;
  managerId?: string;
  courseId?: string;
  startDate?: Date | string;
  endDate?: Date | string;
}

export interface PipelineStageDefinition {
  id: string;
  title: string;
  badgeColor?: string;
  order?: number;
}
