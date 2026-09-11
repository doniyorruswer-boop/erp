export interface ScheduleConflictResult {
  hasConflict: boolean;
  conflicts: {
    scheduleId: string;
    roomId?: string;
    teacherId?: string;
    groupId?: string;
    dayOfWeek: number;
    startTime: string;
    endTime: string;
    description: string;
  }[];
}

export interface RecurrenceRuleDefinition {
  frequency: "DAILY" | "WEEKLY" | "MONTHLY";
  interval?: number;
  daysOfWeek?: number[];
  until?: Date | string;
  count?: number;
}

export interface ResourceAvailabilityResult {
  resourceId: string;
  isAvailable: boolean;
  bookedSlots: {
    startTime: string;
    endTime: string;
    bookingId: string;
  }[];
}
