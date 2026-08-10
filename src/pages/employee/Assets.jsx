import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import {
  LayoutDashboard, CheckSquare, Calendar, FileText, Settings,
  Bell, User, Search, MessageSquare, ChevronDown, LogOut, ListTodo,
  Ticket, Plus, X, Laptop, Monitor, Smartphone, Headphones, Inbox,
  AlertTriangle, CheckCircle2, Clock, MapPin, Tag, ShieldAlert,
  ChevronLeft, ChevronRight, Download, PackageOpen, File, FileText as FilePdf, Image as FileImage, RotateCcw
} from 'lucide-react';
import {
  EnterpriseModal,
  FormHeader,
  FormBody,
  FormSection,
  FormField,
  SelectInput,
  TextArea,
  FileUpload,
  FormFooter
} from '../../components/employee/EnterpriseForm';
import DashboardLayout from '../../components/employee/DashboardLayout';
import '../../styles/employee/dashboard.css';
import '../../styles/employee/assets.css';
import { useAuth } from '../../contexts/AuthContext';
import { getMyAssets } from '../../services/employeeService';

// ─── Constants ────────────────────────────────────────────────────────────
const ASSET_CATEGORIES = ['Laptop', 'Desktop', 'Monitor', 'Mobile', 'Headset', 'Accessory', 'Furniture'];

const TAB_FILTERS = {
  my: t => t.status === 'assigned',
  all: () => true,
  repair: t => t.status === 'repair'
};

const CATEGORY_ICON_MAP = {
  Laptop: <Laptop size={16} />,
  Desktop: <Monitor size={16} />,
  Monitor: <Monitor size={16} />,
  Mobile: <Smartphone size={16} />,
  Headset: <Headphones size={16} />,
  Accessory: <Tag size={16} />,
  Furniture: <Inbox size={16} />,
};

function statusLabel(s) {
  return {
    available: 'Available', assigned: 'Assigned', repair: 'In Repair',
    damaged: 'Damaged', lost: 'Lost', returned: 'Returned', disposed: 'Disposed'
  }[s] || s;
}

export default function Assets() {
  const { user } = useAuth();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);

  const [activeTab, setActiveTab] = useState('my');
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('all');
  const [statusFilter, setStatusFilter] = useState('all');
  const [selectedId, setSelectedId] = useState(null);
  const [showIssueModal, setShowIssueModal] = useState(false);

  // Form state
  const [issueForm, setIssueForm] = useState({ type: 'Damaged', description: '' });

  useEffect(() => {
    if (!user?.id) return;
    const fetchAssets = async () => {
      setLoading(true);
      const { data } = await getMyAssets(user.id);
      if (data) {
        const formatted = data.map(a => ({
          id: a.assets?.asset_tag || a.assets?.id || a.id,
          name: a.assets?.name || 'Unknown Asset',
          category: a.assets?.category || 'Accessory',
          brand: a.assets?.brand || '-',
          model: a.assets?.model || '-',
          serialNumber: a.assets?.serial_number || '-',
          purchaseDate: a.assets?.purchase_date || '-',
          warrantyExpiry: a.assets?.warranty_expiry || '-',
          status: a.status === 'active' ? 'assigned' : a.status,
          assignedTo: 'Me',
          assignmentDate: a.assigned_date,
          conditionOnAssign: a.condition_on_assign
        }));
        setAssets(formatted);
      }
      setLoading(false);
    };
    fetchAssets();
  }, [user]);

  const filtered = assets.filter(t => {
    const tabOk = TAB_FILTERS[activeTab] ? TAB_FILTERS[activeTab](t) : true;
    const searchOk = !search || t.name.toLowerCase().includes(search.toLowerCase()) || t.id.toLowerCase().includes(search.toLowerCase());
    const catOk = categoryFilter === 'all' || t.category === categoryFilter;
    const statOk = statusFilter === 'all' || t.status === statusFilter;
    return tabOk && searchOk && catOk && statOk;
  });

  const selected = assets.find(t => t.id === selectedId);

  const handleReportIssue = (e) => {
    e?.preventDefault();
    if (!issueForm.description.trim()) return;
    alert(`Issue Reported for ${selected.id}: ${issueForm.type}`);
    setShowIssueModal(false);
    setIssueForm({ type: 'Damaged', description: '' });
  };

  const tabCount = (key) => assets.filter(TAB_FILTERS[key]).length;

  const TABS = [
    { key: 'my', label: 'My Assets' },
    { key: 'repair', label: 'In Repair' },
    { key: 'all', label: 'All Assignments' },
  ];

  return (
    <DashboardLayout>

        {/* Assets Split Layout */}
        <div className="assets-layout">
          {/* ── LEFT PANEL ── */}
          <div className="assets-left">
            <div className="assets-left-header">
              <div className="assets-title-row">
                <div>
                  <div className="assets-title">My Assets</div>
                  <div className="assets-subtitle">{assets.length} total assets</div>
                </div>
              </div>

              {/* Tabs */}
              <div className="assets-tabs">
                {TABS.map(tab => (
                  <button
                    key={tab.key}
                    className={`assets-tab ${activeTab === tab.key ? 'active' : ''}`}
                    onClick={() => setActiveTab(tab.key)}
                  >
                    {tab.label}
                    {tabCount(tab.key) > 0 && (
                      <span style={{
                        marginLeft: 5, fontSize: 10, fontWeight: 700,
                        background: activeTab === tab.key ? '#3b82f6' : '#e5e7eb',
                        color: activeTab === tab.key ? '#fff' : '#6b7280',
                        borderRadius: 10, padding: '1px 6px',
                      }}>{tabCount(tab.key)}</span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Filters */}
            <div className="assets-filters">
              <div className="asset-search-box">
                <Search size={13} color="#9ca3af" />
                <input
                  type="text"
                  placeholder="Search asset..."
                  value={search}
                  onChange={e => setSearch(e.target.value)}
                />
              </div>
              <select className="asset-filter-sel" value={categoryFilter} onChange={e => setCategoryFilter(e.target.value)}>
                <option value="all">All Categories</option>
                {ASSET_CATEGORIES.map(c => <option key={c} value={c}>{c}</option>)}
              </select>
              <select className="asset-filter-sel" value={statusFilter} onChange={e => setStatusFilter(e.target.value)}>
                <option value="all">All Status</option>
                <option value="available">Available</option>
                <option value="assigned">Assigned</option>
                <option value="repair">In Repair</option>
              </select>
            </div>

            {/* List */}
            <div className="assets-list-scroll">
              {loading ? (
                <div className="ast-empty"><p>Loading assets...</p></div>
              ) : filtered.length === 0 ? (
                <div className="ast-empty"><PackageOpen size={36} /><p>No assets found.</p></div>
              ) : (
                filtered.map(t => (
                <div
                  key={t.id}
                  className={`asset-card ${selectedId === t.id ? 'active' : ''}`}
                  onClick={() => setSelectedId(t.id)}
                >
                  <div className="asset-icon-box">
                    {CATEGORY_ICON_MAP[t.category] || <Inbox size={16} />}
                  </div>
                  <div className="asset-card-content">
                    <div className="asset-card-top">
                      <div className="asset-card-name">{t.name}</div>
                      <div className="asset-id">{t.id}</div>
                    </div>
                    <div className="asset-card-meta">
                      {t.category} • {t.brand}
                    </div>
                    <div className="asset-card-footer">
                      <span className={`ast-status ${t.status}`}>{statusLabel(t.status)}</span>
                      {t.status === 'assigned' && <span style={{ fontSize: 11, color: '#6b7280', display: 'flex', alignItems: 'center', gap: 4 }}><User size={12} /> {t.assignedTo}</span>}
                    </div>
                  </div>
                </div>
              )))}
            </div>

            {/* Pagination */}
            <div className="assets-pagination">
              <span>Showing {filtered.length} assets</span>
              <div className="ast-pg-btns">
                <button className="ast-pg-btn"><ChevronLeft size={13} /></button>
                <button className="ast-pg-btn active-pg">1</button>
                <button className="ast-pg-btn"><ChevronRight size={13} /></button>
              </div>
            </div>
          </div>

          {/* ── RIGHT PANEL ── */}
          <div className="assets-right">
            {!selected ? (
              <div className="assets-right-empty">
                <PackageOpen size={48} strokeWidth={1.2} />
                <h3>Select an asset to view details</h3>
                <p>Click any asset from the list to open it here.</p>
              </div>
            ) : (
              <div className="asset-detail-scroll">
                {/* ── Overview Card ── */}
                <div className="ast-detail-card">
                  <div className="ast-detail-header">
                    <div>
                      <div style={{ fontSize: 12, color: '#9ca3af', marginBottom: 4 }}>{selected.id}</div>
                      <div className="ast-detail-title">{selected.name}</div>
                    </div>
                    <button className="ast-detail-close-btn" onClick={() => setSelectedId(null)}>
                      <X size={18} />
                    </button>
                  </div>

                  <div className="ast-detail-badges">
                    <span className={`ast-status ${selected.status}`}>{statusLabel(selected.status)}</span>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 4, padding: '3px 8px', borderRadius: 5, fontSize: 11, fontWeight: 600, background: '#f3f4f6', color: '#374151', border: '1px solid #e5e7eb' }}>
                      SN: {selected.serialNumber}
                    </span>
                  </div>

                  <div className="ast-detail-meta-grid">
                    <div className="ast-meta-item">
                      <label>Category</label>
                      <div className="ast-meta-value">{selected.category}</div>
                    </div>
                    <div className="ast-meta-item">
                      <label>Brand & Model</label>
                      <div className="ast-meta-value">{selected.brand} - {selected.model}</div>
                    </div>
                    <div className="ast-meta-item">
                      <label>Purchase Date</label>
                      <div className="ast-meta-value"><Calendar size={12} /> {selected.purchaseDate}</div>
                    </div>
                    <div className="ast-meta-item">
                      <label>Warranty Expiry</label>
                      <div className="ast-meta-value"><ShieldAlert size={12} /> {selected.warrantyExpiry}</div>
                    </div>
                  </div>
                </div>

                {/* ── Assignment Details ── */}
                <div className="ast-detail-card">
                  <div className="ast-section-title"><User size={14} /> Assignment Details</div>
                  {selected.status === 'assigned' || selected.status === 'repair' ? (
                    <div className="ast-detail-meta-grid" style={{ paddingTop: 0, borderTop: 'none' }}>
                      <div className="ast-meta-item">
                        <label>Assigned To</label>
                        <div className="ast-meta-value">
                          <div style={{ width: 20, height: 20, borderRadius: '50%', background: '#6366f1', color: '#fff', fontSize: 10, display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700 }}>{selected.assignedTo[0]}</div>
                          {selected.assignedTo}
                        </div>
                      </div>
                      <div className="ast-meta-item">
                        <label>Issued Date</label>
                        <div className="ast-meta-value"><Clock size={12} /> {selected.issueDate}</div>
                      </div>
                      <div className="ast-meta-item">
                        <label>Expected Return</label>
                        <div className="ast-meta-value"><RotateCcw size={12} /> {selected.expectedReturn || 'Indefinite'}</div>
                      </div>
                    </div>
                  ) : (
                    <p style={{ fontSize: 13, color: '#6b7280' }}>This asset is currently not assigned to anyone.</p>
                  )}
                </div>

                {/* ── Timeline ── */}
                <div className="ast-detail-card">
                  <div className="ast-section-title">
                    <Clock size={14} /> Asset Lifecycle
                  </div>
                  <div className="ast-timeline">
                    {selected.timeline.map((item, i) => (
                      <div key={i} className="ast-timeline-item">
                        <div className="ast-tl-left">
                          <div className={`ast-tl-dot ${item.type}`}>
                            {item.type === 'purchased'  && <Tag size={12} />}
                            {item.type === 'assigned'   && <User size={12} />}
                            {item.type === 'repair'     && <AlertTriangle size={12} />}
                            {item.type === 'returned'   && <CheckCircle2 size={12} />}
                          </div>
                          {i < selected.timeline.length - 1 && <div className="ast-tl-line" />}
                        </div>
                        <div className="ast-tl-content">
                          <div className="ast-tl-action">{item.action}</div>
                          <div className="ast-tl-time">{item.time}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* ── Attachments & Docs ── */}
                {selected.attachments && selected.attachments.length > 0 && (
                  <div className="ast-detail-card">
                    <div className="ast-section-title">
                      <File size={14} /> Documents
                    </div>
                    <div className="ast-attach-grid">
                      {selected.attachments.map((a, i) => (
                        <div key={i} className="ast-attach-row">
                          <div className={`ast-attach-icon ${a.type}`}>
                            {a.type === 'img' && <FileImage size={18} />}
                            {a.type === 'pdf' && <FilePdf size={18} />}
                          </div>
                          <div className="ast-attach-info">
                            <div className="ast-attach-name">{a.name}</div>
                            <div className="ast-attach-size">{a.size}</div>
                          </div>
                          <button className="ast-attach-dl"><Download size={13} /></button>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* ── Actions ── */}
                {selected.assignedTo === 'Balaji Kumar' && (
                  <div className="ast-detail-card">
                    <div className="ast-section-title"><AlertTriangle size={14} /> Issue Management</div>
                    <div className="ast-action-bar">
                      <button className="ast-action-btn report" onClick={() => setShowIssueModal(true)}>
                        <AlertTriangle size={14} /> Raise Asset Issue
                      </button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      {/* RAISE ISSUE ENTERPRISE MODAL */}
      <EnterpriseModal isOpen={showIssueModal} onClose={() => setShowIssueModal(false)}>
        <FormHeader 
          icon={AlertTriangle} 
          title="Report Asset Issue" 
          description={`Reporting issue for ${selected?.name} (${selected?.id}).`}
        />
        
        <form onSubmit={handleReportIssue}>
          <FormBody>
            <FormSection title="Issue Details" description="Describe the problem you are facing with this asset." singleColumn>
              <FormField label="Issue Type" required>
                <SelectInput 
                  options={['Damaged', 'Not Working', 'Lost', 'Upgrade Request', 'Repair Required']}
                  value={issueForm.type}
                  onChange={e => setIssueForm(f => ({ ...f, type: e.target.value }))}
                  required
                />
              </FormField>

              <FormField label="Description" required>
                <TextArea 
                  placeholder="Please describe the issue in detail..."
                  value={issueForm.description}
                  onChange={e => setIssueForm(f => ({ ...f, description: e.target.value }))}
                  required
                />
              </FormField>

              <FormField label="Attachments" optional>
                <FileUpload hint="Upload photos of the damage (Max 5MB JPG/PNG)" />
              </FormField>
            </FormSection>
          </FormBody>
          
          <FormFooter 
            onCancel={() => setShowIssueModal(false)} 
            submitText="Submit Issue" 
          />
        </form>
      </EnterpriseModal>
    </DashboardLayout>
  );
}
