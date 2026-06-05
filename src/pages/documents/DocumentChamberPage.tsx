import React, { useState, useRef } from 'react';
import {
  Upload, FileText, Eye, Download, Trash2, Edit2, Check, X, Search,
  PenTool, Clock, CheckCircle, AlertCircle, Filter
} from 'lucide-react';
import { Card, CardBody, CardHeader } from '../../components/ui/Card';
import { Button } from '../../components/ui/Button';
import { Badge } from '../../components/ui/Badge';
import { Input } from '../../components/ui/Input';
import { useAuth } from '../../context/AuthContext';

type DocStatus = 'draft' | 'in-review' | 'signed';

interface ChamberDocument {
  id: string;
  name: string;
  type: string;
  size: string;
  status: DocStatus;
  uploadedAt: string;
  uploadedBy: string;
  parties: string[];
  signedBy: string[];
}

const INITIAL_DOCS: ChamberDocument[] = [
  { id: 'd1', name: 'Series A Term Sheet', type: 'PDF', size: '2.4 MB', status: 'in-review', uploadedAt: '2026-06-01', uploadedBy: 'Sarah Johnson', parties: ['Sarah Johnson', 'Michael Rodriguez'], signedBy: [] },
  { id: 'd2', name: 'Non-Disclosure Agreement', type: 'PDF', size: '890 KB', status: 'signed', uploadedAt: '2026-05-28', uploadedBy: 'Michael Rodriguez', parties: ['Sarah Johnson', 'Michael Rodriguez'], signedBy: ['Sarah Johnson', 'Michael Rodriguez'] },
  { id: 'd3', name: 'Investment Proposal Q2', type: 'DOCX', size: '1.8 MB', status: 'draft', uploadedAt: '2026-06-03', uploadedBy: 'Sarah Johnson', parties: ['Sarah Johnson'], signedBy: [] },
  { id: 'd4', name: 'Partnership Agreement', type: 'PDF', size: '3.1 MB', status: 'in-review', uploadedAt: '2026-05-25', uploadedBy: 'Jennifer Lee', parties: ['David Chen', 'Jennifer Lee'], signedBy: ['Jennifer Lee'] },
  { id: 'd5', name: 'Equity Distribution Plan', type: 'PDF', size: '1.2 MB', status: 'draft', uploadedAt: '2026-06-04', uploadedBy: 'Maya Patel', parties: ['Maya Patel', 'Robert Torres'], signedBy: [] },
];

export const DocumentChamberPage: React.FC = () => {
  const { user } = useAuth();
  const [documents, setDocuments] = useState<ChamberDocument[]>(INITIAL_DOCS);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState<DocStatus | 'all'>('all');
  const [selectedDoc, setSelectedDoc] = useState<ChamberDocument | null>(null);
  const [showSignModal, setShowSignModal] = useState(false);
  const [showUploadModal, setShowUploadModal] = useState(false);
  const [showPreview, setShowPreview] = useState(false);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [hasSignature, setHasSignature] = useState(false);
  const [uploadForm, setUploadForm] = useState({ name: '', parties: '' });
  const [dragActive, setDragActive] = useState(false);

  if (!user) return null;

  const filteredDocs = documents.filter(doc => {
    const matchesSearch = searchQuery === '' || doc.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStatus = statusFilter === 'all' || doc.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const statusIcon = (status: DocStatus) => {
    switch (status) {
      case 'draft': return <Edit2 size={14} className="text-gray-500" />;
      case 'in-review': return <Clock size={14} className="text-amber-500" />;
      case 'signed': return <CheckCircle size={14} className="text-green-500" />;
    }
  };

  const statusBadge = (status: DocStatus) => {
    const variants: Record<DocStatus, 'gray' | 'warning' | 'success'> = { draft: 'gray', 'in-review': 'warning', signed: 'success' };
    const labels: Record<DocStatus, string> = { draft: 'Draft', 'in-review': 'In Review', signed: 'Signed' };
    return <Badge variant={variants[status]}>{labels[status]}</Badge>;
  };

  // Signature pad handlers
  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    setIsDrawing(true);
    const rect = canvas.getBoundingClientRect();
    ctx.beginPath();
    ctx.moveTo(e.clientX - rect.left, e.clientY - rect.top);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    const rect = canvas.getBoundingClientRect();
    ctx.lineWidth = 2;
    ctx.lineCap = 'round';
    ctx.strokeStyle = '#1D4ED8';
    ctx.lineTo(e.clientX - rect.left, e.clientY - rect.top);
    ctx.stroke();
    setHasSignature(true);
  };

  const stopDrawing = () => setIsDrawing(false);

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    setHasSignature(false);
  };

  const applySignature = () => {
    if (!selectedDoc || !hasSignature) return;
    setDocuments(prev => prev.map(doc => {
      if (doc.id !== selectedDoc.id) return doc;
      const newSignedBy = [...doc.signedBy, user.name];
      const allSigned = doc.parties.every(p => newSignedBy.includes(p));
      return { ...doc, signedBy: newSignedBy, status: allSigned ? 'signed' as DocStatus : 'in-review' as DocStatus };
    }));
    setShowSignModal(false);
    clearSignature();
  };

  const handleUpload = () => {
    if (!uploadForm.name) return;
    const newDoc: ChamberDocument = {
      id: `d${Date.now()}`,
      name: uploadForm.name,
      type: 'PDF',
      size: `${(Math.random() * 5 + 0.5).toFixed(1)} MB`,
      status: 'draft',
      uploadedAt: new Date().toISOString().split('T')[0],
      uploadedBy: user.name,
      parties: uploadForm.parties ? uploadForm.parties.split(',').map(p => p.trim()) : [user.name],
      signedBy: [],
    };
    setDocuments(prev => [newDoc, ...prev]);
    setUploadForm({ name: '', parties: '' });
    setShowUploadModal(false);
  };

  const deleteDoc = (id: string) => {
    setDocuments(prev => prev.filter(d => d.id !== id));
    if (selectedDoc?.id === id) setSelectedDoc(null);
  };

  const updateStatus = (id: string, status: DocStatus) => {
    setDocuments(prev => prev.map(d => d.id === id ? { ...d, status } : d));
  };

  const stats = {
    total: documents.length,
    draft: documents.filter(d => d.status === 'draft').length,
    inReview: documents.filter(d => d.status === 'in-review').length,
    signed: documents.filter(d => d.status === 'signed').length,
  };

  return (
    <div className="space-y-6 animate-fade-in">
      <div className="flex flex-col sm:flex-row justify-between sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Document Chamber</h1>
          <p className="text-gray-600">Upload, review, and sign deals & contracts</p>
        </div>
        <Button onClick={() => setShowUploadModal(true)} leftIcon={<Upload size={18} />}>Upload Document</Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gray-50 border border-gray-100"><CardBody>
          <div className="flex items-center gap-3"><div className="p-2.5 bg-gray-200 rounded-lg"><FileText size={18} className="text-gray-600" /></div>
          <div><p className="text-xs text-gray-500">Total</p><p className="text-xl font-bold text-gray-900">{stats.total}</p></div></div>
        </CardBody></Card>
        <Card className="bg-gray-50 border border-gray-100"><CardBody>
          <div className="flex items-center gap-3"><div className="p-2.5 bg-gray-200 rounded-lg"><Edit2 size={18} className="text-gray-500" /></div>
          <div><p className="text-xs text-gray-500">Draft</p><p className="text-xl font-bold text-gray-700">{stats.draft}</p></div></div>
        </CardBody></Card>
        <Card className="bg-amber-50 border border-amber-100"><CardBody>
          <div className="flex items-center gap-3"><div className="p-2.5 bg-amber-200 rounded-lg"><Clock size={18} className="text-amber-600" /></div>
          <div><p className="text-xs text-amber-600">In Review</p><p className="text-xl font-bold text-amber-700">{stats.inReview}</p></div></div>
        </CardBody></Card>
        <Card className="bg-green-50 border border-green-100"><CardBody>
          <div className="flex items-center gap-3"><div className="p-2.5 bg-green-200 rounded-lg"><CheckCircle size={18} className="text-green-600" /></div>
          <div><p className="text-xs text-green-600">Signed</p><p className="text-xl font-bold text-green-700">{stats.signed}</p></div></div>
        </CardBody></Card>
      </div>

      {/* Search & Filter */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="flex-1">
          <Input placeholder="Search documents..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} fullWidth startAdornment={<Search size={18} />} />
        </div>
        <div className="flex gap-2">
          {(['all', 'draft', 'in-review', 'signed'] as const).map(s => (
            <button key={s} onClick={() => setStatusFilter(s)}
              className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${statusFilter === s ? 'bg-primary-100 text-primary-700' : 'text-gray-500 hover:bg-gray-100'}`}>
              {s === 'all' ? 'All' : s === 'in-review' ? 'In Review' : s.charAt(0).toUpperCase() + s.slice(1)}
            </button>
          ))}
        </div>
      </div>

      {/* Documents Table */}
      <Card>
        <CardBody className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead><tr className="border-b border-gray-200 bg-gray-50">
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Document</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Status</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase hidden md:table-cell">Parties</th>
                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-500 uppercase hidden sm:table-cell">Uploaded</th>
                <th className="text-right px-6 py-3 text-xs font-semibold text-gray-500 uppercase">Actions</th>
              </tr></thead>
              <tbody>
                {filteredDocs.map(doc => (
                  <tr key={doc.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 bg-primary-50 rounded-lg flex items-center justify-center">
                          <FileText size={18} className="text-primary-600" />
                        </div>
                        <div>
                          <p className="text-sm font-medium text-gray-900">{doc.name}</p>
                          <p className="text-xs text-gray-500">{doc.type} · {doc.size}</p>
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">{statusBadge(doc.status)}</td>
                    <td className="px-6 py-4 hidden md:table-cell">
                      <div className="flex flex-wrap gap-1">
                        {doc.parties.map((p, i) => (
                          <span key={i} className="text-xs bg-gray-100 text-gray-600 px-2 py-0.5 rounded-full">
                            {p} {doc.signedBy.includes(p) && <Check size={10} className="inline text-green-500" />}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-500 hidden sm:table-cell">{doc.uploadedAt}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-1">
                        <button onClick={() => { setSelectedDoc(doc); setShowPreview(true); }} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-primary-600" title="Preview">
                          <Eye size={16} />
                        </button>
                        {doc.status !== 'signed' && (
                          <button onClick={() => { setSelectedDoc(doc); setShowSignModal(true); }} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-primary-600" title="Sign">
                            <PenTool size={16} />
                          </button>
                        )}
                        {doc.status === 'draft' && (
                          <button onClick={() => updateStatus(doc.id, 'in-review')} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-amber-600" title="Send for Review">
                            <AlertCircle size={16} />
                          </button>
                        )}
                        <button onClick={() => deleteDoc(doc.id)} className="p-2 hover:bg-gray-100 rounded-lg text-gray-500 hover:text-red-600" title="Delete">
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            {filteredDocs.length === 0 && (
              <div className="text-center py-12 text-gray-500">
                <FileText size={48} className="mx-auto mb-4 text-gray-300" />
                <p>No documents found</p>
              </div>
            )}
          </div>
        </CardBody>
      </Card>

      {/* Preview Modal */}
      {showPreview && selectedDoc && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowPreview(false)}>
          <div className="bg-white rounded-xl w-full max-w-2xl shadow-xl max-h-[80vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
            <div className="p-6 border-b flex items-center justify-between">
              <div>
                <h3 className="text-lg font-semibold">{selectedDoc.name}</h3>
                <p className="text-sm text-gray-500">{selectedDoc.type} · {selectedDoc.size}</p>
              </div>
              <button onClick={() => setShowPreview(false)} className="text-gray-400 hover:text-gray-600"><X size={20} /></button>
            </div>
            <div className="p-6">
              <div className="bg-gray-50 rounded-lg p-8 min-h-[300px] border-2 border-dashed border-gray-200">
                <div className="text-center mb-6">
                  <h2 className="text-xl font-bold text-gray-900">{selectedDoc.name}</h2>
                  <p className="text-sm text-gray-500 mt-1">Document Preview</p>
                </div>
                <div className="space-y-3 max-w-md mx-auto">
                  <div className="h-3 bg-gray-300 rounded w-full" />
                  <div className="h-3 bg-gray-300 rounded w-5/6" />
                  <div className="h-3 bg-gray-300 rounded w-4/5" />
                  <div className="h-3 bg-gray-200 rounded w-full mt-6" />
                  <div className="h-3 bg-gray-200 rounded w-3/4" />
                  <div className="h-3 bg-gray-200 rounded w-5/6" />
                  <div className="h-3 bg-gray-200 rounded w-2/3" />
                </div>
                {selectedDoc.signedBy.length > 0 && (
                  <div className="mt-8 pt-6 border-t border-gray-300">
                    <p className="text-xs text-gray-500 mb-2">Signatures:</p>
                    {selectedDoc.signedBy.map((s, i) => (
                      <div key={i} className="flex items-center gap-2 mb-1">
                        <CheckCircle size={14} className="text-green-500" />
                        <span className="text-sm text-gray-700 italic font-serif">{s}</span>
                        <span className="text-xs text-gray-400">✓ Signed</span>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <div className="mt-4 flex items-center justify-between text-sm text-gray-500">
                <span>Uploaded by {selectedDoc.uploadedBy} on {selectedDoc.uploadedAt}</span>
                {statusBadge(selectedDoc.status)}
              </div>
            </div>
          </div>
        </div>
      )}

      {/* E-Signature Modal */}
      {showSignModal && selectedDoc && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => { setShowSignModal(false); clearSignature(); }}>
          <div className="bg-white rounded-xl p-6 w-full max-w-lg shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Sign Document</h3>
            <p className="text-sm text-gray-500 mb-4">Signing: {selectedDoc.name}</p>
            <div className="border-2 border-dashed border-gray-300 rounded-lg overflow-hidden bg-white mb-4">
              <canvas
                ref={canvasRef}
                width={460} height={180}
                className="w-full cursor-crosshair"
                onMouseDown={startDrawing}
                onMouseMove={draw}
                onMouseUp={stopDrawing}
                onMouseLeave={stopDrawing}
              />
            </div>
            <p className="text-xs text-gray-400 text-center mb-4">Draw your signature above</p>
            <div className="flex gap-2">
              <Button onClick={applySignature} fullWidth disabled={!hasSignature} leftIcon={<PenTool size={16} />}>
                Apply Signature
              </Button>
              <Button variant="outline" onClick={clearSignature} fullWidth>Clear</Button>
              <Button variant="ghost" onClick={() => { setShowSignModal(false); clearSignature(); }}>Cancel</Button>
            </div>
          </div>
        </div>
      )}

      {/* Upload Modal */}
      {showUploadModal && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50" onClick={() => setShowUploadModal(false)}>
          <div className="bg-white rounded-xl p-6 w-full max-w-md shadow-xl" onClick={e => e.stopPropagation()}>
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Upload Document</h3>
            <div
              className={`border-2 border-dashed rounded-lg p-8 text-center mb-4 transition-colors ${dragActive ? 'border-primary-500 bg-primary-50' : 'border-gray-300'}`}
              onDragOver={e => { e.preventDefault(); setDragActive(true); }}
              onDragLeave={() => setDragActive(false)}
              onDrop={e => { e.preventDefault(); setDragActive(false); setUploadForm({ ...uploadForm, name: 'Uploaded Document.pdf' }); }}
            >
              <Upload size={40} className="mx-auto text-gray-400 mb-3" />
              <p className="text-sm text-gray-600">Drag & drop files here, or click to browse</p>
              <p className="text-xs text-gray-400 mt-1">PDF, DOCX up to 10MB</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Document Name</label>
                <input type="text" value={uploadForm.name} onChange={e => setUploadForm({ ...uploadForm, name: e.target.value })}
                  placeholder="e.g., Investment Agreement" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Parties (comma separated)</label>
                <input type="text" value={uploadForm.parties} onChange={e => setUploadForm({ ...uploadForm, parties: e.target.value })}
                  placeholder="e.g., Sarah Johnson, Michael Rodriguez" className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-primary-500 focus:border-primary-500" />
              </div>
              <div className="flex gap-2 pt-2">
                <Button onClick={handleUpload} fullWidth disabled={!uploadForm.name}>Upload</Button>
                <Button variant="outline" onClick={() => setShowUploadModal(false)} fullWidth>Cancel</Button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
