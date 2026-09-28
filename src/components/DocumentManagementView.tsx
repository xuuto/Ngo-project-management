import React, { useState, useMemo } from 'react';
import {
  FileText,
  FolderOpen,
  Search,
  Filter,
  Plus,
  Download,
  Trash2,
  Lock,
  Tag,
  Building,
  Layers,
  Calendar,
  User,
  CheckCircle2,
  AlertCircle,
  X,
  FileCheck,
  Image,
  FileSpreadsheet,
  FileCode,
  Sparkles,
  Link as LinkIcon
} from 'lucide-react';
import {
  DocumentItem,
  DocumentCategory,
  FileType,
  ConfidentialityLevel,
  getStoredDocuments,
  saveStoredDocuments
} from '../services/documentService';
import { Project } from '../types/ngo';
import { logAuditEvent } from '../services/auditService';

interface DocumentManagementViewProps {
  projects: Project[];
  currentUser: { name: string; role: string; id: string };
  onSelectProject?: (projectId: string) => void;
}

export const DocumentManagementView: React.FC<DocumentManagementViewProps> = ({
  projects,
  currentUser,
  onSelectProject
}) => {
  const [documents, setDocuments] = useState<DocumentItem[]>(() => getStoredDocuments());
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [categoryFilter, setCategoryFilter] = useState<string>('all');
  const [typeFilter, setTypeFilter] = useState<string>('all');
  const [confidentialityFilter, setConfidentialityFilter] = useState<string>('all');

  // Upload / Add Modal State
  const [isUploadModalOpen, setIsUploadModalOpen] = useState<boolean>(false);
  const [newTitle, setNewTitle] = useState<string>('');
  const [newCategory, setNewCategory] = useState<DocumentCategory>('Field Photo & Evidence');
  const [newFileType, setNewFileType] = useState<FileType>('PDF');
  const [newConfidentiality, setNewConfidentiality] = useState<ConfidentialityLevel>('Internal Staff');
  const [newLinkedType, setNewLinkedType] = useState<'Project' | 'Expense' | 'Milestone' | 'General'>('Project');
  const [newLinkedId, setNewLinkedId] = useState<string>(projects[0]?.id || '');
  const [newLinkedName, setNewLinkedName] = useState<string>(projects[0]?.title || 'General Repository');
  const [newTagsString, setNewTagsString] = useState<string>('Field, Report, Verified');

  // Preview Modal State
  const [previewDoc, setPreviewDoc] = useState<DocumentItem | null>(null);

  const categoriesList: DocumentCategory[] = [
    'Contract & Grant Agreement',
    'Field Photo & Evidence',
    'Meeting Minutes & MoM',
    'Financial Voucher & Receipt',
    'M&E Evaluation Report',
    'Technical Engineering Blueprint'
  ];

  const filteredDocuments = useMemo(() => {
    return documents.filter((doc) => {
      if (searchQuery.trim() !== '') {
        const q = searchQuery.toLowerCase();
        const matchesTitle = doc.title.toLowerCase().includes(q);
        const matchesTags = doc.tags.some((t) => t.toLowerCase().includes(q));
        const matchesEntity = doc.linkedEntityName.toLowerCase().includes(q);
        const matchesUploader = doc.uploadedBy.toLowerCase().includes(q);
        if (!matchesTitle && !matchesTags && !matchesEntity && !matchesUploader) return false;
      }

      if (categoryFilter !== 'all' && doc.category !== categoryFilter) return false;
      if (typeFilter !== 'all' && doc.fileType !== typeFilter) return false;
      if (confidentialityFilter !== 'all' && doc.confidentiality !== confidentialityFilter) return false;

      return true;
    });
  }, [documents, searchQuery, categoryFilter, typeFilter, confidentialityFilter]);

  const handleUploadDocument = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newTitle.trim()) return;

    const tags = newTagsString
      .split(',')
      .map((t) => t.trim())
      .filter(Boolean);

    // Resolve entity name if linked to project
    let entityName = newLinkedName;
    if (newLinkedType === 'Project') {
      const foundProj = projects.find((p) => p.id === newLinkedId);
      if (foundProj) entityName = foundProj.title;
    }

    const newDoc: DocumentItem = {
      id: `DOC-${Math.floor(100 + Math.random() * 900)}`,
      title: newTitle.trim(),
      category: newCategory,
      fileType: newFileType,
      fileSize: `${(Math.random() * 8 + 0.5).toFixed(1)} MB`,
      uploadDate: new Date().toISOString().split('T')[0],
      uploadedBy: `${currentUser.name} (${currentUser.role})`,
      linkedEntityType: newLinkedType,
      linkedEntityId: newLinkedId,
      linkedEntityName: entityName,
      tags,
      url: '#',
      confidentiality: newConfidentiality
    };

    const updated = [newDoc, ...documents];
    setDocuments(updated);
    saveStoredDocuments(updated);

    logAuditEvent({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'CREATE',
      category: 'Logframe',
      entityId: newDoc.id,
      entityName: newDoc.title,
      details: `Uploaded centralized document "${newDoc.title}" under category ${newDoc.category}.`
    });

    setIsUploadModalOpen(false);
    setNewTitle('');
    setNewTagsString('Field, Report, Verified');
  };

  const handleDeleteDocument = (id: string, title: string) => {
    if (!confirm(`Are you sure you want to delete document "${title}"?`)) return;
    const updated = documents.filter((d) => d.id !== id);
    setDocuments(updated);
    saveStoredDocuments(updated);

    logAuditEvent({
      userId: currentUser.id,
      userName: currentUser.name,
      userRole: currentUser.role,
      action: 'DELETE',
      category: 'Logframe',
      entityId: id,
      entityName: title,
      details: `Deleted centralized document "${title}".`
    });
  };

  const getFileIcon = (type: FileType) => {
    switch (type) {
      case 'PDF':
        return <FileText className="w-5 h-5 text-rose-600" />;
      case 'JPG':
      case 'PNG':
        return <Image className="w-5 h-5 text-emerald-600" />;
      case 'XLSX':
        return <FileSpreadsheet className="w-5 h-5 text-amber-600" />;
      case 'DOCX':
      default:
        return <FileCode className="w-5 h-5 text-blue-600" />;
    }
  };

  const getConfidentialityBadge = (level: ConfidentialityLevel) => {
    switch (level) {
      case 'Super Admin Only':
        return 'bg-rose-100 text-rose-800 border-rose-300';
      case 'Donor Restricted':
        return 'bg-purple-100 text-purple-900 border-purple-300';
      case 'Internal Staff':
        return 'bg-amber-100 text-amber-900 border-amber-300';
      case 'Public':
      default:
        return 'bg-emerald-100 text-emerald-800 border-emerald-300';
    }
  };

  return (
    <div className="space-y-6">
      {/* Header Banner */}
      <div className="bg-white p-6 rounded-xl border border-slate-200 shadow-2xs space-y-4">
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 text-xs font-semibold text-emerald-800">
              <FolderOpen className="w-4 h-4" />
              <span>Centralized Enterprise Repository &amp; Asset Vault</span>
            </div>
            <h2 className="text-xl font-bold text-slate-900 mt-1">
              Document Management &amp; Entity Linking
            </h2>
            <p className="text-xs text-slate-500 mt-1">
              Categorize, search, and securely link project contracts, field verification photos, engineering blueprints, and financial meeting minutes across all operational grants.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <button
              onClick={() => setIsUploadModalOpen(true)}
              className="flex items-center gap-1.5 px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white rounded-lg text-xs font-semibold shadow-xs transition-colors cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              <span>Upload &amp; Link Document</span>
            </button>
          </div>
        </div>

        {/* Storage Metrics Strip */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 pt-4 border-t border-slate-100">
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Total Files</p>
            <p className="text-lg font-bold font-mono text-slate-900 mt-0.5">{documents.length} Items</p>
            <p className="text-[10px] text-emerald-800 font-semibold mt-0.5">Centralized Vault</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Contracts &amp; Grants</p>
            <p className="text-lg font-bold font-mono text-emerald-800 mt-0.5">
              {documents.filter((d) => d.category === 'Contract & Grant Agreement').length} Files
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">Signed donor agreements</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Field Evidence Photos</p>
            <p className="text-lg font-bold font-mono text-slate-900 mt-0.5">
              {documents.filter((d) => d.category === 'Field Photo & Evidence').length} Files
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">GIS &amp; site verifications</p>
          </div>
          <div className="p-3 bg-slate-50 rounded-xl border border-slate-200">
            <p className="text-[10px] font-bold text-slate-500 uppercase tracking-wider">Donor Restricted</p>
            <p className="text-lg font-bold font-mono text-purple-800 mt-0.5">
              {documents.filter((d) => d.confidentiality === 'Donor Restricted' || d.confidentiality === 'Super Admin Only').length} Files
            </p>
            <p className="text-[10px] text-slate-500 mt-0.5">Encrypted access control</p>
          </div>
        </div>
      </div>

      {/* Filter & Search Bar */}
      <div className="bg-white p-4 rounded-xl border border-slate-200 shadow-2xs flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-2.5 flex-1">
          <div className="relative min-w-[240px] max-w-sm flex-1">
            <Search className="w-3.5 h-3.5 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search documents by title, tags, entity..."
              className="w-full pl-9 pr-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-emerald-500"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            )}
          </div>

          <div className="flex items-center gap-1.5">
            <Filter className="w-3.5 h-3.5 text-slate-400" />
            <select
              value={categoryFilter}
              onChange={(e) => setCategoryFilter(e.target.value)}
              className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="all">All Categories</option>
              {categoriesList.map((cat) => (
                <option key={cat} value={cat}>
                  {cat}
                </option>
              ))}
            </select>
          </div>

          <select
            value={typeFilter}
            onChange={(e) => setTypeFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All File Types</option>
            <option value="PDF">PDF</option>
            <option value="JPG">JPG</option>
            <option value="PNG">PNG</option>
            <option value="DOCX">DOCX</option>
            <option value="XLSX">XLSX</option>
          </select>

          <select
            value={confidentialityFilter}
            onChange={(e) => setConfidentialityFilter(e.target.value)}
            className="px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg text-xs font-semibold text-slate-700 focus:ring-2 focus:ring-emerald-500"
          >
            <option value="all">All Confidentiality Levels</option>
            <option value="Public">Public</option>
            <option value="Internal Staff">Internal Staff</option>
            <option value="Donor Restricted">Donor Restricted</option>
            <option value="Super Admin Only">Super Admin Only</option>
          </select>
        </div>

        <div className="text-xs text-slate-500 font-mono">
          Showing {filteredDocuments.length} of {documents.length} documents
        </div>
      </div>

      {/* Documents Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredDocuments.length === 0 ? (
          <div className="col-span-full bg-white p-12 rounded-xl border border-slate-200 text-center space-y-2">
            <FolderOpen className="w-10 h-10 text-slate-300 mx-auto" />
            <p className="text-sm font-semibold text-slate-700">No documents match your filters</p>
            <p className="text-xs text-slate-400">Try adjusting your search query or uploading a new file.</p>
          </div>
        ) : (
          filteredDocuments.map((doc) => {
            const confClass = getConfidentialityBadge(doc.confidentiality);

            return (
              <div
                key={doc.id}
                className="bg-white rounded-xl border border-slate-200 shadow-2xl hover:shadow-md transition-all p-5 space-y-4 flex flex-col justify-between"
              >
                <div className="space-y-3">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex items-center gap-2.5">
                      <div className="p-2.5 bg-slate-50 rounded-xl border border-slate-200 shrink-0">
                        {getFileIcon(doc.fileType)}
                      </div>
                      <div>
                        <span className="text-[10px] font-mono font-bold text-emerald-800 uppercase tracking-wider block">
                          {doc.fileType} · {doc.fileSize}
                        </span>
                        <h3 className="text-sm font-bold text-slate-900 leading-snug line-clamp-2 mt-0.5">
                          {doc.title}
                        </h3>
                      </div>
                    </div>
                  </div>

                  <div className="flex flex-wrap items-center gap-1.5">
                    <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-slate-100 text-slate-700 border border-slate-200">
                      {doc.category}
                    </span>
                    <span className={`px-2 py-0.5 rounded text-[10px] font-bold border ${confClass}`}>
                      {doc.confidentiality}
                    </span>
                  </div>

                  {/* Linked Entity Chip */}
                  <div className="p-2.5 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-wider flex items-center gap-1">
                      <LinkIcon className="w-2.5 h-2.5 text-emerald-700" />
                      Linked {doc.linkedEntityType}
                    </span>
                    <p className="text-xs font-bold text-slate-800 truncate">
                      {doc.linkedEntityName}
                    </p>
                  </div>

                  {/* Tags */}
                  {doc.tags.length > 0 && (
                    <div className="flex flex-wrap items-center gap-1 pt-1">
                      {doc.tags.map((tag) => (
                        <span
                          key={tag}
                          className="px-1.5 py-0.5 bg-slate-100 text-slate-600 rounded text-[9.5px] font-medium"
                        >
                          #{tag}
                        </span>
                      ))}
                    </div>
                  )}
                </div>

                {/* Footer Actions */}
                <div className="pt-3 border-t border-slate-100 flex items-center justify-between text-xs">
                  <span className="text-[10px] text-slate-400 font-mono">
                    {doc.uploadDate}
                  </span>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setPreviewDoc(doc)}
                      className="px-2.5 py-1 bg-slate-100 hover:bg-slate-200 text-slate-800 rounded text-xs font-semibold transition-colors cursor-pointer"
                    >
                      Preview
                    </button>
                    <button
                      onClick={() => handleDeleteDocument(doc.id, doc.title)}
                      className="p-1 text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded transition-colors cursor-pointer"
                      title="Delete Document"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
            );
          })
        )}
      </div>

      {/* UPLOAD & LINK DOCUMENT MODAL */}
      {isUploadModalOpen && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <h3 className="text-sm font-bold flex items-center gap-2">
                <Plus className="w-4 h-4 text-emerald-400" />
                Upload &amp; Link Centralized Document
              </h3>
              <button
                onClick={() => setIsUploadModalOpen(false)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleUploadDocument} className="p-6 space-y-4 text-xs">
              <div className="space-y-1">
                <label className="font-bold text-slate-700">Document Title *</label>
                <input
                  type="text"
                  required
                  value={newTitle}
                  onChange={(e) => setNewTitle(e.target.value)}
                  placeholder="e.g. Q3 Field Monitoring & Evaluation Report"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Category</label>
                  <select
                    value={newCategory}
                    onChange={(e) => setNewCategory(e.target.value as DocumentCategory)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  >
                    {categoriesList.map((cat) => (
                      <option key={cat} value={cat}>
                        {cat}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">File Type</label>
                  <select
                    value={newFileType}
                    onChange={(e) => setNewFileType(e.target.value as FileType)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="PDF">PDF</option>
                    <option value="JPG">JPG</option>
                    <option value="PNG">PNG</option>
                    <option value="DOCX">DOCX</option>
                    <option value="XLSX">XLSX</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Linked Entity Type</label>
                  <select
                    value={newLinkedType}
                    onChange={(e) => {
                      const val = e.target.value as any;
                      setNewLinkedType(val);
                      if (val === 'Project' && projects.length > 0) {
                        setNewLinkedId(projects[0].id);
                        setNewLinkedName(projects[0].title);
                      }
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Project">Project</option>
                    <option value="Milestone">Milestone</option>
                    <option value="Expense">Expense / Voucher</option>
                    <option value="General">General Repository</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Confidentiality Level</label>
                  <select
                    value={newConfidentiality}
                    onChange={(e) => setNewConfidentiality(e.target.value as ConfidentialityLevel)}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  >
                    <option value="Public">Public</option>
                    <option value="Internal Staff">Internal Staff</option>
                    <option value="Donor Restricted">Donor Restricted</option>
                    <option value="Super Admin Only">Super Admin Only</option>
                  </select>
                </div>
              </div>

              {newLinkedType === 'Project' && (
                <div className="space-y-1">
                  <label className="font-bold text-slate-700">Select Project</label>
                  <select
                    value={newLinkedId}
                    onChange={(e) => {
                      const id = e.target.value;
                      setNewLinkedId(id);
                      const p = projects.find((item) => item.id === id);
                      if (p) setNewLinkedName(p.title);
                    }}
                    className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500"
                  >
                    {projects.map((p) => (
                      <option key={p.id} value={p.id}>
                        {p.code} — {p.title}
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div className="space-y-1">
                <label className="font-bold text-slate-700">Tags (comma separated)</label>
                <input
                  type="text"
                  value={newTagsString}
                  onChange={(e) => setNewTagsString(e.target.value)}
                  placeholder="e.g. EU, Rangeland, Field, Report"
                  className="w-full px-3 py-2 bg-slate-50 border border-slate-200 rounded-lg font-medium text-slate-900 focus:ring-2 focus:ring-emerald-500"
                />
              </div>

              <div className="pt-3 border-t border-slate-200 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={() => setIsUploadModalOpen(false)}
                  className="px-4 py-2 bg-slate-100 hover:bg-slate-200 text-slate-700 font-semibold rounded-lg transition-colors cursor-pointer"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white font-semibold rounded-lg transition-colors cursor-pointer shadow-xs"
                >
                  Upload &amp; Save Document
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* DOCUMENT PREVIEW MODAL */}
      {previewDoc && (
        <div className="fixed inset-0 z-50 bg-slate-900/60 backdrop-blur-xs flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-white rounded-xl max-w-lg w-full border border-slate-200 shadow-xl overflow-hidden animate-in fade-in zoom-in-95 duration-150">
            <div className="p-5 bg-slate-900 text-white flex items-center justify-between">
              <div className="flex items-center gap-2">
                {getFileIcon(previewDoc.fileType)}
                <div>
                  <h3 className="text-sm font-bold">{previewDoc.title}</h3>
                  <p className="text-[10px] text-slate-400 font-mono">
                    {previewDoc.fileType} · {previewDoc.fileSize} · Uploaded {previewDoc.uploadDate}
                  </p>
                </div>
              </div>
              <button
                onClick={() => setPreviewDoc(null)}
                className="p-1 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4 text-xs">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Category</span>
                  <p className="font-semibold text-slate-800 mt-0.5">{previewDoc.category}</p>
                </div>
                <div className="p-3 bg-slate-50 rounded-lg border border-slate-200">
                  <span className="text-[10px] font-bold text-slate-400 uppercase">Confidentiality</span>
                  <p className={`font-semibold mt-0.5 ${getConfidentialityBadge(previewDoc.confidentiality)} inline-block px-2 py-0.5 rounded text-[10px]`}>
                    {previewDoc.confidentiality}
                  </p>
                </div>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Linked Entity Reference</span>
                <p className="font-bold text-slate-900">
                  {previewDoc.linkedEntityType}: {previewDoc.linkedEntityName}
                </p>
              </div>

              <div className="p-3 bg-slate-50 rounded-lg border border-slate-200 space-y-1">
                <span className="text-[10px] font-bold text-slate-400 uppercase">Uploader / Author</span>
                <p className="font-semibold text-slate-800">{previewDoc.uploadedBy}</p>
              </div>

              <div className="p-8 bg-slate-100 rounded-xl border border-dashed border-slate-300 text-center space-y-2">
                <FileCheck className="w-8 h-8 text-emerald-600 mx-auto" />
                <p className="text-sm font-bold text-slate-800">Simulated Secure Document Preview</p>
                <p className="text-xs text-slate-500">
                  This document is securely indexed in the PENHA institutional vault.
                </p>
                <button
                  onClick={() => alert(`Downloading simulated file: ${previewDoc.title}`)}
                  className="px-3 py-1.5 bg-slate-900 text-white rounded-lg text-xs font-semibold hover:bg-slate-800 transition-colors cursor-pointer"
                >
                  Download File ({previewDoc.fileSize})
                </button>
              </div>
            </div>

            <div className="p-4 bg-slate-50 border-t border-slate-200 flex justify-end">
              <button
                onClick={() => setPreviewDoc(null)}
                className="px-4 py-2 bg-slate-900 hover:bg-slate-800 text-white text-xs font-semibold rounded-lg transition-colors cursor-pointer"
              >
                Close Preview
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
