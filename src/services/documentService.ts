export type DocumentCategory =
  | 'Contract & Grant Agreement'
  | 'Field Photo & Evidence'
  | 'Meeting Minutes & MoM'
  | 'Financial Voucher & Receipt'
  | 'M&E Evaluation Report'
  | 'Technical Engineering Blueprint';

export type FileType = 'PDF' | 'JPG' | 'PNG' | 'DOCX' | 'XLSX';

export type ConfidentialityLevel = 'Public' | 'Internal Staff' | 'Donor Restricted' | 'Super Admin Only';

export interface DocumentItem {
  id: string;
  title: string;
  category: DocumentCategory;
  fileType: FileType;
  fileSize: string;
  uploadDate: string;
  uploadedBy: string;
  linkedEntityType: 'Project' | 'Expense' | 'Milestone' | 'General';
  linkedEntityId: string;
  linkedEntityName: string;
  tags: string[];
  url: string;
  confidentiality: ConfidentialityLevel;
}

const DOCUMENT_STORAGE_KEY = 'penha_enterprise_documents_v1';

export const getStoredDocuments = (): DocumentItem[] => {
  try {
    const raw = localStorage.getItem(DOCUMENT_STORAGE_KEY);
    if (!raw) {
      const initial: DocumentItem[] = [
        {
          id: 'DOC-501',
          title: 'EU-EUTF Signed Grant Agreement & Special Conditions',
          category: 'Contract & Grant Agreement',
          fileType: 'PDF',
          fileSize: '4.8 MB',
          uploadDate: '2024-02-15',
          uploadedBy: 'Maxamed Muudit (Super Admin)',
          linkedEntityType: 'Project',
          linkedEntityId: 'proj-1',
          linkedEntityName: 'EU-EUTF Rangeland Rehabilitation',
          tags: ['EU', 'Grant', 'Contract', 'Signed'],
          url: '#',
          confidentiality: 'Donor Restricted'
        },
        {
          id: 'DOC-502',
          title: 'Oodweyne Earthen Bunds Construction Field Photos (Batch 3)',
          category: 'Field Photo & Evidence',
          fileType: 'JPG',
          fileSize: '12.4 MB',
          uploadDate: '2026-06-10',
          uploadedBy: 'Eng. Ismail Jama Farah',
          linkedEntityType: 'Milestone',
          linkedEntityId: 'ms-102',
          linkedEntityName: 'Earthen bunds & check-dams completion',
          tags: ['Field Evidence', 'Togdheer', 'Check-dams', 'Pastoralist'],
          url: '#',
          confidentiality: 'Internal Staff'
        },
        {
          id: 'DOC-503',
          title: 'Danida Bi-Annual RBM Steering Committee Meeting Minutes (MoM)',
          category: 'Meeting Minutes & MoM',
          fileType: 'PDF',
          fileSize: '1.9 MB',
          uploadDate: '2026-03-22',
          uploadedBy: 'Lars Møller',
          linkedEntityType: 'Project',
          linkedEntityId: 'proj-2',
          linkedEntityName: 'Danida Pastoralist Women Livelihoods',
          tags: ['MoM', 'Steering Committee', 'Danida', 'Hargeisa'],
          url: '#',
          confidentiality: 'Internal Staff'
        },
        {
          id: 'DOC-504',
          title: 'Solar Submersible Pump Procurement Invoice & Customs Clearance',
          category: 'Financial Voucher & Receipt',
          fileType: 'PDF',
          fileSize: '3.1 MB',
          uploadDate: '2025-11-04',
          uploadedBy: 'Ahmed Guleid',
          linkedEntityType: 'Expense',
          linkedEntityId: 'exp-101',
          linkedEntityName: 'BL-102 Operational Logistics & Transport',
          tags: ['Invoice', 'Procurement', 'Solar', 'Berbera'],
          url: '#',
          confidentiality: 'Super Admin Only'
        },
        {
          id: 'DOC-505',
          title: 'Hydrogeological Water Quality Test & Borehole Handover Deed',
          category: 'Technical Engineering Blueprint',
          fileType: 'PDF',
          fileSize: '6.5 MB',
          uploadDate: '2026-01-18',
          uploadedBy: 'Dr. Mukhtar Aden',
          linkedEntityType: 'Project',
          linkedEntityId: 'proj-1',
          linkedEntityName: 'EU-EUTF Rangeland Rehabilitation',
          tags: ['Water', 'Engineering', 'Borehole', 'Ministry'],
          url: '#',
          confidentiality: 'Public'
        }
      ];
      localStorage.setItem(DOCUMENT_STORAGE_KEY, JSON.stringify(initial));
      return initial;
    }
    return JSON.parse(raw);
  } catch (err) {
    console.error('Failed to load documents:', err);
    return [];
  }
};

export const saveStoredDocuments = (docs: DocumentItem[]) => {
  try {
    localStorage.setItem(DOCUMENT_STORAGE_KEY, JSON.stringify(docs));
  } catch (err) {
    console.error('Failed to save documents:', err);
  }
};
