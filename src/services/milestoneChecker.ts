import { Project, Milestone } from '../types/ngo';
import { MilestoneNotification, UrgencyLevel } from '../types/notification';

const NOTIFICATIONS_STORAGE_KEY = 'penha_milestone_notifications_v1';
const LAST_CHECK_DATE_KEY = 'penha_last_milestone_check_date';

export const getStoredNotifications = (): MilestoneNotification[] => {
  try {
    const raw = localStorage.getItem(NOTIFICATIONS_STORAGE_KEY);
    if (!raw) return [];
    return JSON.parse(raw);
  } catch (e) {
    console.error('Error reading milestone notifications from storage:', e);
    return [];
  }
};

export const saveStoredNotifications = (notifications: MilestoneNotification[]): void => {
  try {
    localStorage.setItem(NOTIFICATIONS_STORAGE_KEY, JSON.stringify(notifications));
  } catch (e) {
    console.error('Error saving milestone notifications to storage:', e);
  }
};

export const getLastCheckDate = (): string | null => {
  return localStorage.getItem(LAST_CHECK_DATE_KEY);
};

export interface CheckResult {
  updatedProjects: Project[];
  notifications: MilestoneNotification[];
  newlyDetectedCount: number;
  checkDate: string;
}

/**
 * Daily Background Check Evaluator & Urgency Classifier
 * Evaluates all project milestone dates against reference date.
 * Identifies overdue or upcoming milestones within 30 days, computes urgency labels (High, Medium, Low),
 * updates status, and generates notifications targeted at Project Managers.
 */
export const runDailyMilestoneCheck = (
  projects: Project[],
  referenceDateStr?: string
): CheckResult => {
  const checkDateStr = referenceDateStr || new Date().toISOString().split('T')[0];
  const checkTime = new Date(checkDateStr).getTime();

  const existingNotifications = getStoredNotifications();
  const existingMap = new Map<string, MilestoneNotification>();
  existingNotifications.forEach((n) => existingMap.set(n.id, n));

  let newlyDetectedCount = 0;
  const newNotificationsList: MilestoneNotification[] = [];

  let projectsChanged = false;

  const updatedProjects = projects.map((project) => {
    const milestones = project.milestones || [];
    let msChanged = false;

    const updatedMilestones = milestones.map((ms) => {
      if (ms.status === 'Achieved') return ms;

      const dueTime = new Date(ms.dueDate).getTime();
      const diffMs = dueTime - checkTime;
      const daysRemaining = Math.ceil(diffMs / (1000 * 60 * 60 * 24)); // negative if overdue
      const isOverdue = daysRemaining < 0;
      const daysOverdue = isOverdue ? Math.abs(daysRemaining) : 0;

      // Include overdue milestones or upcoming milestones within 30 days
      if (isOverdue || daysRemaining <= 30) {
        // Automatically update milestone status to Delayed/Critical if overdue and currently Pending or In Progress
        let nextStatus = ms.status;
        if (isOverdue && (ms.status === 'Pending' || ms.status === 'In Progress')) {
          nextStatus = ms.isCriticalCheckpoint ? 'Critical' : 'Delayed';
          msChanged = true;
        }

        // Determine Urgency Label based on days remaining / overdue & critical checkpoint
        let urgency: UrgencyLevel = 'Low';
        if (isOverdue || daysRemaining <= 3 || ms.isCriticalCheckpoint) {
          urgency = 'High';
        } else if (daysRemaining > 3 && daysRemaining <= 14) {
          urgency = 'Medium';
        } else {
          urgency = 'Low';
        }

        const notifId = `notif-${project.id}-${ms.id}`;
        const prevNotif = existingMap.get(notifId);

        if (!prevNotif) {
          newlyDetectedCount++;
        }

        const notif: MilestoneNotification = {
          id: notifId,
          projectId: project.id,
          projectCode: project.code,
          projectTitle: project.shortTitle || project.title,
          milestoneId: ms.id,
          milestoneTitle: ms.title,
          milestoneCategory: ms.category,
          dueDate: ms.dueDate,
          status: nextStatus,
          daysOverdue,
          daysRemaining,
          urgency,
          isUrgent: prevNotif ? prevNotif.isUrgent : false,
          managerName: project.leadProjectManager.name,
          managerEmail: project.leadProjectManager.email,
          managerRole: project.leadProjectManager.role,
          isCriticalCheckpoint: ms.isCriticalCheckpoint,
          detectedAt: prevNotif ? prevNotif.detectedAt : new Date().toISOString(),
          read: prevNotif ? prevNotif.read : false,
          acknowledged: prevNotif ? prevNotif.acknowledged : false,
          acknowledgedBy: prevNotif?.acknowledgedBy,
          acknowledgedAt: prevNotif?.acknowledgedAt
        };

        newNotificationsList.push(notif);

        return msChanged ? { ...ms, status: nextStatus } : ms;
      }

      return ms;
    });

    if (msChanged) projectsChanged = true;

    return msChanged ? { ...project, milestones: updatedMilestones } : project;
  });

  // Save state
  saveStoredNotifications(newNotificationsList);
  localStorage.setItem(LAST_CHECK_DATE_KEY, checkDateStr);

  return {
    updatedProjects: projectsChanged ? updatedProjects : projects,
    notifications: newNotificationsList,
    newlyDetectedCount,
    checkDate: checkDateStr
  };
};

export const toggleNotificationUrgent = (notificationId: string): MilestoneNotification[] => {
  const notifications = getStoredNotifications();
  const updated = notifications.map((n) => {
    if (n.id === notificationId) {
      return { ...n, isUrgent: !n.isUrgent };
    }
    return n;
  });
  saveStoredNotifications(updated);
  return updated;
};
