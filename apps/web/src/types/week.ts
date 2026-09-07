export type WeekStatus = 'DRAFT' | 'ACTIVE' | 'CLOSED';

export interface Week {
  id: string;
  startDate: string;
  endDate: string;
  status: WeekStatus;
  closedAt: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateWeekInput {
  startDate: string;
}
