export type UrgencyLevel = 'High' | 'Medium' | 'Low';

export interface MilestoneNotification {
  id: string;
  projectId: string;
  projectCode: string;
  projectTitle: string;
  milestoneId: string;
  milestoneTitle: string;
  milestoneCategory: string;
  dueDate: string;
  status: string;
  daysOverdue: number;
  daysRemaining: number;
  urgency: UrgencyLevel;
  isUrgent?: boolean;
  managerName: string;
  managerEmail: string;
  managerRole: string;
  isCriticalCheckpoint: boolean;
  detectedAt: string;
  read: boolean;
  acknowledged: boolean;
  acknowledgedBy?: string;
  acknowledgedAt?: string;
}
