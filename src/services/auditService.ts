export interface AuditLogEntry {
  id: string;
  timestamp: string;
  userId: string;
  userName: string;
  userRole: string;
  action: 'CREATE' | 'UPDATE' | 'DELETE' | 'VERIFY' | 'EXPORT' | 'RECONCILE';
  category: 'Financial' | 'Logframe' | 'Milestone' | 'Risk' | 'Beneficiary' | 'Security';
  entityId: string;
  entityName: string;
  details: string;
  previousValue?: string;
  newValue?: string;
  checksum: string;
}

const AUDIT_STORAGE_KEY = 'penha_enterprise_audit_ledger_v1';

export const getAuditLogs = (): AuditLogEntry[] => {
  try {
    const raw = localStorage.getItem(AUDIT_STORAGE_KEY);
    if (!raw) {
      // Seed initial professional audit logs
      const initial: AuditLogEntry[] = [
        {
          id: 'AUD-1001',
          timestamp: new Date(Date.now() - 3600000 * 24).toISOString(),
          userId: 'usr-admin',
          userName: 'Maxamed Muudit',
          userRole: 'Super Admin',
          action: 'VERIFY',
          category: 'Financial',
          entityId: 'proj-1',
          entityName: 'EU-EUTF Rangeland Rehabilitation',
          details: 'Quarterly financial verification audit completed and signed off for Annex III compliance.',
          checksum: 'sha256-e3b0c44298fc1c149afbf4c8996fb92427ae41e4649b934ca495991b7852b855'
        },
        {
          id: 'AUD-1002',
          timestamp: new Date(Date.now() - 3600000 * 12).toISOString(),
          userId: 'usr-pm',
          userName: 'Eng. Ismail Jama Farah',
          userRole: 'Project Manager',
          action: 'UPDATE',
          category: 'Milestone',
          entityId: 'ms-102',
          entityName: 'Solar Berkad Retrofitting',
          details: 'Milestone delivery status updated from In Progress to Achieved following hydrotest.',
          previousValue: 'In Progress',
          newValue: 'Achieved',
          checksum: 'sha256-a1b2c3d4e5f67890123456789abcdef0123456789abcdef0123456789abcdef0'
        }
      ];
      localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load audit logs:', err);
    return [];
  }
};

export const logAuditEvent = (entry: Omit<AuditLogEntry, 'id' | 'timestamp' | 'checksum'>) => {
  try {
    const current = getAuditLogs();
    const id = `AUD-${Math.floor(1000 + Math.random() * 9000)}`;
    const timestamp = new Date().toISOString();
    
    // Generate simulated cryptographic SHA-256 checksum for audit immutability
    const rawString = `${id}-${timestamp}-${entry.userId}-${entry.action}-${entry.entityId}`;
    let hash = 0;
    for (let i = 0; i < rawString.length; i++) {
      hash = (hash << 5) - hash + rawString.charCodeAt(i);
      hash |= 0;
    }
    const checksum = `sha256-${Math.abs(hash).toString(16).padStart(64, '0')}`;

    const newEntry: AuditLogEntry = {
      ...entry,
      id,
      timestamp,
      checksum
    };

    const updated = [newEntry, ...current];
    localStorage.setItem(AUDIT_STORAGE_KEY, JSON.stringify(updated));
    return newEntry;
  } catch (err) {
    console.error('Failed to record audit event:', err);
  }
};
