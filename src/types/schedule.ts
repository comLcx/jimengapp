export type ScheduleItemStatus = "active" | "done";

export type ScheduleItem = {
  id: string;
  title: string;
  dueAt: number | null;
  createdAt: number;
  updatedAt: number;
  status: ScheduleItemStatus;
};
