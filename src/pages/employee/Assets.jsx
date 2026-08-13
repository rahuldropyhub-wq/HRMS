import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Search, PackageOpen, Laptop, Monitor, Smartphone, Headphones,
  AlertTriangle, CheckCircle2, Clock, Calendar, Tag, ShieldCheck,
  Building, Wrench, X, Box, Loader2, LayoutGrid, List, Eye
} from 'lucide-react';
import DashboardLayout from '../../components/employee/DashboardLayout';
import CustomDropdown from '../../components/admin/CustomDropdown';
import EmptyState from '../../components/admin/EmptyState';
import { getMyAssets } from '../../services/employeeService';
import { useAuth } from '../../contexts/AuthContext';
import '../../styles/employee/assets.css';
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

const EmployeeAssets = () => {
  const { user } = useAuth();
  const [assets, setAssets] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [viewMode, setViewMode] = useState('table');
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [showViewModal, setShowViewModal] = useState(false);
  const [showIssueModal, setShowIssueModal] = useState(false);
  const [issueForm, setIssueForm] = useState({ type: 'Damaged', description: '' });

  useEffect(() => {
    if (!user?.id) return;
    const fetchAssets = async () => {
      setLoading(true);
      const { data } = await getMyAssets(user.id);
      if (data) {
        const formatted = data.map(a => {
          const item = a.assets || a;
          let rawStatus = item.status ? String(item.status).toLowerCase() : 'assigned';
          let formattedStatus = 'Assigned';
          if (rawStatus.includes('repair')) formattedStatus = 'In Repair';

          return {
            id: item.asset_code || item.asset_id || item.asset_tag || item.id,
            name: item.name || item.asset_name || 'Assigned Asset',
            category: item.category || item.type || 'Laptop',
            brandModel: item.brand_model || item.brand || item.model || 'Standard Issue',
            serialNumber: item.serial_number || 'N/A',
            purchaseDate: item.assignment_date || item.purchase_date || new Date().toISOString().split('T')[0],
            condition: item.condition || item.warranty || 'Good / Working',
            status: formattedStatus,
            location: item.location || 'Headquarters (HQ)',
            remarks: item.remarks || 'Issued by Company IT'
          };
        });
        setAssets(formatted);
      }
      setLoading(false);
    };
    fetchAssets();
  }, [user]);

  const filteredAssets = assets.filter(a => {
    const matchesSearch = !search || 
      a.name.toLowerCase().includes(search.toLowerCase()) || 
      a.id.toLowerCase().includes(search.toLowerCase()) ||
      a.category.toLowerCase().includes(search.toLowerCase());
    const matchesCat = !categoryFilter || a.category.toLowerCase() === categoryFilter.toLowerCase();
    const matchesStatus = !statusFilter || a.status.toLowerCase() === statusFilter.toLowerCase();
    return matchesSearch && matchesCat && matchesStatus;
  });

  const getAssetIcon = (category) => {
    const cat = String(category).toLowerCase();
    if (cat.includes('lap') || cat.includes('desk')) return <Laptop size={24} color="#2563eb" />;
    if (cat.includes('monit') || cat.includes('screen')) return <Monitor size={24} color="#0284c7" />;
    if (cat.includes('phone') || cat.includes('mobil')) return <Smartphone size={24} color="#7c3aed" />;
    if (cat.includes('head') || cat.includes('audio')) return <Headphones size={24} color="#db2777" />;
    return <PackageOpen size={24} color="#2563eb" />;
  };

  const handleReportIssue = (e) => {
    e.preventDefault();
    alert(`Issue reported for ${selectedAsset?.name} (${selectedAsset?.id}). IT support will contact you shortly.`);
    setShowIssueModal(false);
    setIssueForm({ type: 'Damaged', description: '' });
  };

  return (
    <DashboardLayout>
      <div className="emp-assets-container">
        {/* Page Header */}
        <div className="emp-assets-header">
          <div>
            <h1>My Assigned Assets</h1>
            <p>View hardware equipment, monitors, and devices allocated to you</p>
          </div>
        </div>

        {/* KPI Summary Grid */}
        <div className="emp-assets-kpi-grid">
          <div className="emp-kpi-card">
            <div className="emp-kpi-icon total">
              <Box size={20} />
            </div>
            <div>
              <p>Total Allocated</p>
              <h4>{assets.length}</h4>
            </div>
          </div>

          <div className="emp-kpi-card">
            <div className="emp-kpi-icon assigned">
              <CheckCircle2 size={20} />
            </div>
            <div>
              <p>Active / In Use</p>
              <h4>{assets.filter(a => a.status === 'Assigned').length}</h4>
            </div>
          </div>

          <div className="emp-kpi-card">
            <div className="emp-kpi-icon repair">
              <Wrench size={20} />
            </div>
            <div>
              <p>Under Maintenance</p>
              <h4>{assets.filter(a => a.status === 'In Repair').length}</h4>
            </div>
          </div>
        </div>

        {/* Filter Bar */}
        <div className="emp-assets-filter-bar">
          <div className="emp-assets-search">
            <Search size={18} className="search-icon" />
            <input 
              type="text"
              placeholder="Search by asset name, tag, or category..."
              value={search}
              onChange={e => setSearch(e.target.value)}
            />
          </div>

          <div className="emp-assets-select-wrap" style={{ width: '180px' }}>
            <CustomDropdown 
              value={categoryFilter}
              onChange={val => setCategoryFilter(val)}
              options={[
                { value: '', label: 'All Categories' },
                { value: 'Laptop', label: 'Laptop' },
                { value: 'Desktop', label: 'Desktop' },
                { value: 'Monitor', label: 'Monitor' },
                { value: 'Mouse', label: 'Mouse' },
                { value: 'Keyboard', label: 'Keyboard' },
                { value: 'Mobile / Phone', label: 'Phone' }
              ]}
              fullWidth
            />
          </div>

          <div className="emp-assets-select-wrap" style={{ width: '180px' }}>
            <CustomDropdown 
              value={statusFilter}
              onChange={val => setStatusFilter(val)}
              options={[
                { value: '', label: 'All Statuses' },
                { value: 'Assigned', label: 'Assigned' },
                { value: 'In Repair', label: 'In Repair' }
              ]}
              fullWidth
            />
          </div>

          {/* View Toggle (Grid vs Table) */}
          <div className="view-mode-toggle">
            <button 
              className={`view-toggle-btn ${viewMode === 'grid' ? 'active' : ''}`}
              onClick={() => setViewMode('grid')}
              title="Grid View"
            >
              <LayoutGrid size={18} />
              <span>Grid</span>
            </button>
            <button 
              className={`view-toggle-btn ${viewMode === 'table' ? 'active' : ''}`}
              onClick={() => setViewMode('table')}
              title="Table View"
            >
              <List size={18} />
              <span>Table</span>
            </button>
          </div>
        </div>

        {/* Assets List Content */}
        {loading ? (
          <div className="emp-assets-loading">
            <Loader2 className="animate-spin" size={28} color="#2563eb" />
            <p>Loading assigned assets...</p>
          </div>
        ) : filteredAssets.length === 0 ? (
          <div className="emp-assets-empty">
            <EmptyState 
              icon={<PackageOpen size={36} color="#94a3b8" />}
              title="No assets assigned"
              message="You currently have no hardware assets allocated to your account."
            />
          </div>
        ) : viewMode === 'grid' ? (
          <div className="emp-assets-grid">
            {filteredAssets.map(asset => (
              <motion.div 
                key={asset.id} 
                className="emp-asset-card"
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.2 }}
              >
                <div className="emp-asset-card-top">
                  <div className="emp-asset-icon-box">
                    {getAssetIcon(asset.category)}
                  </div>
                  <span className={`emp-asset-badge ${asset.status.toLowerCase().replace(' ', '-')}`}>
                    {asset.status}
                  </span>
                </div>

                <div className="emp-asset-info">
                  <span className="emp-asset-code">{asset.id}</span>
                  <h3>{asset.name}</h3>
                  <p className="emp-asset-brand">{asset.brandModel}</p>
                </div>

                <div className="emp-asset-specs-list">
                  <div className="emp-spec-row">
                    <span className="label">Category:</span>
                    <span className="value">{asset.category}</span>
                  </div>
                  <div className="emp-spec-row">
                    <span className="label">Serial No:</span>
                    <span className="value">{asset.serialNumber}</span>
                  </div>
                  <div className="emp-spec-row">
                    <span className="label">Assigned On:</span>
                    <span className="value">{asset.purchaseDate}</span>
                  </div>
                  <div className="emp-spec-row">
                    <span className="label">Condition:</span>
                    <span className="value tag">{asset.condition}</span>
                  </div>
                </div>

                <div className="emp-asset-card-footer">
                  <button 
                    className="btn-report-issue"
                    onClick={() => { setSelectedAsset(asset); setShowIssueModal(true); }}
                  >
                    <AlertTriangle size={14} /> Report Issue
                  </button>
                </div>
              </motion.div>
            ))}
          </div>
        ) : (
          <div className="table-container" style={{ background: '#ffffff', borderRadius: '14px', border: '1px solid #e2e8f0', overflowX: 'auto', WebkitOverflowScrolling: 'touch', boxShadow: '0 1px 3px rgba(0,0,0,0.03)' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
              <thead>
                <tr style={{ background: '#f8fafc', borderBottom: '1px solid #e2e8f0' }}>
                  <th style={{ padding: '14px 16px', fontSize: '12px', color: '#64748b', textAlign: 'left', fontWeight: '600' }}>Asset ID</th>
                  <th style={{ padding: '14px 16px', fontSize: '12px', color: '#64748b', textAlign: 'left', fontWeight: '600' }}>Asset Name</th>
                  <th style={{ padding: '14px 16px', fontSize: '12px', color: '#64748b', textAlign: 'left', fontWeight: '600' }}>Category</th>
                  <th style={{ padding: '14px 16px', fontSize: '12px', color: '#64748b', textAlign: 'left', fontWeight: '600' }}>Serial Number</th>
                  <th style={{ padding: '14px 16px', fontSize: '12px', color: '#64748b', textAlign: 'left', fontWeight: '600' }}>Assigned Date</th>
                  <th style={{ padding: '14px 16px', fontSize: '12px', color: '#64748b', textAlign: 'left', fontWeight: '600' }}>Condition</th>
                  <th style={{ padding: '14px 16px', fontSize: '12px', color: '#64748b', textAlign: 'left', fontWeight: '600' }}>Status</th>
                  <th style={{ padding: '14px 16px', fontSize: '12px', color: '#64748b', textAlign: 'right', fontWeight: '600' }}>Action</th>
                </tr>
              </thead>
              <tbody>
                {filteredAssets.map(asset => (
                  <tr key={asset.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                    <td style={{ padding: '14px 16px', fontWeight: '700', color: '#2563eb', fontSize: '13px' }}>{asset.id}</td>
                    <td style={{ padding: '14px 16px', fontWeight: '600', color: '#0f172a' }}>{asset.name}</td>
                    <td style={{ padding: '14px 16px', color: '#475569' }}>{asset.category}</td>
                    <td style={{ padding: '14px 16px', color: '#64748b', fontSize: '13px' }}>{asset.serialNumber}</td>
                    <td style={{ padding: '14px 16px', color: '#475569', fontSize: '13px' }}>{asset.purchaseDate}</td>
                    <td style={{ padding: '14px 16px' }}><span style={{ background: '#e2e8f0', padding: '2px 8px', borderRadius: '6px', fontSize: '12px', fontWeight: '500' }}>{asset.condition}</span></td>
                    <td style={{ padding: '14px 16px' }}><span className={`emp-asset-badge ${asset.status.toLowerCase().replace(' ', '-')}`}>{asset.status}</span></td>
                    <td style={{ padding: '14px 16px', textAlign: 'right' }}>
                      <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
                        <button 
                          className="btn-view-asset"
                          style={{ display: 'inline-flex', alignItems: 'center', gap: '5px', padding: '6px 12px', background: '#eff6ff', border: '1px solid #bfdbfe', color: '#2563eb', borderRadius: '8px', fontSize: '13px', fontWeight: '600', cursor: 'pointer' }}
                          onClick={() => { setSelectedAsset(asset); setShowViewModal(true); }}
                        >
                          <Eye size={14} /> View
                        </button>
                        <button 
                          className="btn-report-issue"
                          style={{ width: 'auto', display: 'inline-flex', padding: '6px 12px' }}
                          onClick={() => { setSelectedAsset(asset); setShowIssueModal(true); }}
                        >
                          <AlertTriangle size={13} /> Report Issue
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* VIEW ASSET DETAILS MODAL */}
      <AnimatePresence>
        {showViewModal && selectedAsset && (
          <div className="modal-overlay" onClick={() => setShowViewModal(false)} style={{ zIndex: 1200 }}>
            <motion.div 
              className="modal-content"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              style={{ width: '560px', maxWidth: '95vw', padding: '0', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.25)' }}
            >
              <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: '#ffffff', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <PackageOpen size={22} color="#38bdf8" />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#f8fafc' }}>{selectedAsset.name}</h3>
                    <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '500' }}>Asset ID: {selectedAsset.id}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setShowViewModal(false)}
                  style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#94a3b8', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>

              <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '14px', background: '#ffffff' }}>
                <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500', display: 'block' }}>Category</span>
                  <span style={{ fontSize: '14px', color: '#0f172a', fontWeight: '600' }}>{selectedAsset.category}</span>
                </div>

                <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500', display: 'block' }}>Current Status</span>
                  <span className={`emp-asset-badge ${selectedAsset.status.toLowerCase().replace(' ', '-')}`} style={{ marginTop: '4px' }}>
                    {selectedAsset.status}
                  </span>
                </div>

                <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500', display: 'block' }}>Brand / Model</span>
                  <span style={{ fontSize: '14px', color: '#0f172a', fontWeight: '600' }}>{selectedAsset.brandModel}</span>
                </div>

                <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500', display: 'block' }}>Serial Number</span>
                  <span style={{ fontSize: '14px', color: '#0f172a', fontWeight: '600' }}>{selectedAsset.serialNumber}</span>
                </div>

                <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500', display: 'block' }}>Assigned Date</span>
                  <span style={{ fontSize: '14px', color: '#0f172a', fontWeight: '600' }}>{selectedAsset.purchaseDate}</span>
                </div>

                <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500', display: 'block' }}>Condition</span>
                  <span style={{ fontSize: '14px', color: '#0f172a', fontWeight: '600' }}>{selectedAsset.condition}</span>
                </div>

                <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', gridColumn: 'span 2' }}>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500', display: 'block' }}>Location / Remarks</span>
                  <span style={{ fontSize: '13px', color: '#334155', fontWeight: '500' }}>{selectedAsset.location} • {selectedAsset.remarks}</span>
                </div>
              </div>

              <div style={{ padding: '16px 24px', background: '#f1f5f9', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button 
                  onClick={() => { setShowViewModal(false); setShowIssueModal(true); }}
                  style={{ padding: '8px 16px', borderRadius: '8px', background: '#fff', border: '1px solid #fed7aa', color: '#c2410c', fontWeight: '600', fontSize: '13px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                >
                  <AlertTriangle size={14} /> Report Issue
                </button>
                <button 
                  onClick={() => setShowViewModal(false)}
                  style={{ padding: '8px 20px', borderRadius: '8px', background: '#0f172a', color: '#ffffff', border: 'none', fontWeight: '600', fontSize: '13px', cursor: 'pointer' }}
                >
                  Close Details
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* REPORT ISSUE ENTERPRISE MODAL */}
      <EnterpriseModal isOpen={showIssueModal} onClose={() => setShowIssueModal(false)}>
        <FormHeader 
          icon={AlertTriangle} 
          title="Report Asset Issue" 
          description={`Submit a maintenance request for ${selectedAsset?.name} (${selectedAsset?.id}).`}
        />
        
        <form onSubmit={handleReportIssue}>
          <FormBody>
            <FormSection title="Issue Details" description="Describe the problem or hardware fault." singleColumn>
              <FormField label="Issue Category" required>
                <SelectInput 
                  options={['Hardware Fault', 'Display / Screen Problem', 'Battery / Charging Issue', 'Physical Damage', 'Software / OS Crash', 'Accessories Missing']}
                  value={issueForm.type}
                  onChange={e => setIssueForm({ ...issueForm, type: e.target.value })}
                  required
                />
              </FormField>

              <FormField label="Detailed Description" required>
                <TextArea 
                  placeholder="Explain when the issue started and what problems you are experiencing..."
                  value={issueForm.description}
                  onChange={e => setIssueForm({ ...issueForm, description: e.target.value })}
                  required
                />
              </FormField>

              <FormField label="Photo / Attachment" optional>
                <FileUpload hint="Upload photo of the damaged hardware or error screenshot (JPG/PNG max 5MB)" />
              </FormField>
            </FormSection>
          </FormBody>
          
          <FormFooter 
            onCancel={() => setShowIssueModal(false)} 
            submitText="Submit Support Ticket" 
          />
        </form>
      </EnterpriseModal>
    </DashboardLayout>
  );
};

export default EmployeeAssets;
