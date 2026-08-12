import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Filter, Edit, Trash2, ShieldCheck, SearchX, Box, CheckCircle, Wrench, X, UserPlus, Loader2, PackageOpen, Eye } from 'lucide-react';
import { Link } from 'react-router-dom';
import '../../../styles/admin/assets/asset-inventory.css';
import EmptyState from '../../../components/admin/EmptyState';
import CustomDropdown from '../../../components/admin/CustomDropdown';
import { getAllAssets, createAsset, getAllEmployees } from '../../../services/adminService';
import {
  EnterpriseModal,
  FormHeader,
  FormBody,
  FormSection,
  FormField,
  SelectInput,
  DateInput,
  TextArea,
  TextInput,
  FileUpload,
  FormFooter
} from '../../../components/employee/EnterpriseForm';

const AssetInventory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [assignFilter, setAssignFilter] = useState('');

  const [assets, setAssets] = useState([]);
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState(null);
  const [submitting, setSubmitting] = useState(false);

  const initialForm = {
    name: '',
    type: 'Laptop',
    assetId: 'AST-' + Math.floor(1000 + Math.random() * 9000),
    serial: '',
    brandModel: '',
    assignedTo: 'Unassigned',
    assignmentDate: new Date().toISOString().split('T')[0],
    condition: 'Good / Working',
    location: 'Headquarters (HQ)',
    fileName: '',
    fileData: '',
    remarks: ''
  };

  const [assetForm, setAssetForm] = useState(initialForm);

  const fetchAssets = async () => {
    setLoading(true);
    const { data } = await getAllAssets();
    if (data) {
      const parsed = data.map(a => {
        let rawStatus = a.status ? String(a.status).toLowerCase() : 'available';
        let formattedStatus = 'Available';
        if (rawStatus.includes('assign')) formattedStatus = 'Assigned';
        else if (rawStatus.includes('repair')) formattedStatus = 'In Repair';
        else if (rawStatus.includes('retir')) formattedStatus = 'Retired';
        else if (rawStatus.includes('avail')) formattedStatus = 'Available';

        return {
          id: a.asset_code || a.asset_id || a.id || ('AST-' + Math.floor(1000 + Math.random() * 9000)),
          name: a.name || a.asset_name || 'Hardware Asset',
          category: a.category || a.type || 'Laptop',
          assignedTo: a.assigned_to || a.assignedTo || 'Unassigned',
          status: formattedStatus,
          purchaseDate: a.assignment_date || a.purchase_date || new Date().toISOString().split('T')[0],
          warranty: a.condition || a.warranty || 'Good'
        };
      });
      setAssets(parsed);
    }
    setLoading(false);
  };

  useEffect(() => {
    const loadData = async () => {
      fetchAssets();
      const { data: empData } = await getAllEmployees();
      if (empData) {
        setEmployees(empData);
      }
    };
    loadData();
  }, []);

  const employeeOptions = [
    { value: 'Unassigned', label: 'Unassigned (In Stock)' },
    ...employees.map(emp => {
      const name = `${emp.firstName || emp.first_name || ''} ${emp.lastName || emp.last_name || ''}`.trim() || emp.email || 'Employee';
      const code = emp.empCode || emp.emp_id || emp.empId || emp.id || 'N/A';
      return {
        value: `${name} (${code})`,
        label: `${name} (${code})`
      };
    })
  ];

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (ev) => {
        setAssetForm(prev => ({
          ...prev,
          fileName: file.name,
          fileData: ev.target.result
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmitAsset = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    const isUnassigned = !assetForm.assignedTo || assetForm.assignedTo === 'Unassigned' || assetForm.assignedTo.includes('Unassigned');
    const assetCode = assetForm.assetId || ('AST-' + Math.floor(1000 + Math.random() * 9000));
    const statusVal = isUnassigned ? 'available' : 'assigned';
    const formattedStatusText = isUnassigned ? 'Available' : 'Assigned';

    // 1. Optimistic UI update so added asset appears instantly
    const newUiAsset = {
      id: assetCode,
      name: assetForm.name,
      category: assetForm.type,
      assignedTo: isUnassigned ? 'Unassigned' : assetForm.assignedTo,
      status: formattedStatusText,
      purchaseDate: assetForm.assignmentDate,
      warranty: assetForm.condition
    };

    setAssets(prev => [newUiAsset, ...prev]);

    // 2. Insert into Supabase DB
    const payload = {
      asset_id: assetCode,
      name: assetForm.name,
      category: assetForm.type,
      serial_number: assetForm.serial,
      brand_model: assetForm.brandModel,
      assigned_to: isUnassigned ? 'Unassigned' : assetForm.assignedTo,
      assignment_date: assetForm.assignmentDate,
      condition: assetForm.condition,
      location: assetForm.location,
      asset_image: assetForm.fileName,
      remarks: assetForm.remarks,
      status: statusVal
    };

    await createAsset(payload);

    setSubmitting(false);
    setIsModalOpen(false);
    setAssetForm(initialForm);
    fetchAssets();
  };

  const filteredAssets = assets.filter(a => {
    const matchesSearch = (a.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (a.id || '').toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = catFilter ? (a.category || '').toLowerCase() === catFilter.toLowerCase() : true;
    const matchesStatus = statusFilter ? (a.status || '').toLowerCase() === statusFilter.toLowerCase() : true;
    const matchesAssign = assignFilter === 'Assigned' ? a.assignedTo !== 'Unassigned' :
      assignFilter === 'Unassigned' ? a.assignedTo === 'Unassigned' : true;
    return matchesSearch && matchesCat && matchesStatus && matchesAssign;
  });

  return (
    <motion.div
      className="asset-inventory-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="page-header">
        <div className="page-title">
          <h1>Asset Inventory</h1>
          <p>Manage and track all company hardware and resources</p>
        </div>
        <button className="btn-primary" onClick={() => { setAssetForm(initialForm); setIsModalOpen(true); }}>
          <Plus size={18} /> Add New Asset
        </button>
      </div>

      <div className="stats-container">
        <div className="stat-pill"><Box size={18} color="#6b7280" /> <span className="label">Total:</span> <span className="value">{assets.length}</span></div>
        <div className="stat-pill"><CheckCircle size={18} color="#3b82f6" /> <span className="label">Assigned:</span> <span className="value">{assets.filter(a => a.status === 'Assigned').length}</span></div>
        <div className="stat-pill"><CheckCircle size={18} color="#10b981" /> <span className="label">Available:</span> <span className="value">{assets.filter(a => a.status === 'Available').length}</span></div>
        <div className="stat-pill"><Wrench size={18} color="#f59e0b" /> <span className="label">In Repair:</span> <span className="value">{assets.filter(a => a.status === 'In Repair').length}</span></div>
        <div className="stat-pill"><Trash2 size={18} color="#6b7280" /> <span className="label">Retired:</span> <span className="value">{assets.filter(a => a.status === 'Retired').length}</span></div>
      </div>

      <div className="filter-bar">
        <div className="search-box">
          <Search size={18} className="search-icon" />
          <input
            type="text"
            placeholder="Search assets..."
            value={searchTerm}
            onChange={e => setSearchTerm(e.target.value)}
          />
        </div>
        <div style={{ width: '180px' }}>
          <CustomDropdown
            value={catFilter}
            onChange={(val) => setCatFilter(val)}
            options={[
              { value: '', label: 'All Categories' },
              { value: 'Laptop', label: 'Laptop' },
              { value: 'Desktop', label: 'Desktop' },
              { value: 'Monitor', label: 'Monitor' },
              { value: 'Mouse', label: 'Mouse' },
              { value: 'Keyboard', label: 'Keyboard' },
              { value: 'Headset', label: 'Headset' },
              { value: 'Phone', label: 'Phone' },
              { value: 'Chair', label: 'Chair' }
            ]}
            fullWidth
          />
        </div>
        <div style={{ width: '180px' }}>
          <CustomDropdown
            value={statusFilter}
            onChange={(val) => setStatusFilter(val)}
            options={[
              { value: '', label: 'All Status' },
              { value: 'Available', label: 'Available' },
              { value: 'Assigned', label: 'Assigned' },
              { value: 'In Repair', label: 'In Repair' },
              { value: 'Retired', label: 'Retired' }
            ]}
            fullWidth
          />
        </div>
        <div style={{ width: '180px' }}>
          <CustomDropdown
            value={assignFilter}
            onChange={(val) => setAssignFilter(val)}
            options={[
              { value: '', label: 'All Assignment' },
              { value: 'Assigned', label: 'Assigned' },
              { value: 'Unassigned', label: 'Unassigned' }
            ]}
            fullWidth
          />
        </div>
      </div>

      <div className="table-container">
        {loading ? (
          <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-tertiary)' }}>
            <Loader2 className="animate-spin" size={24} style={{ margin: '0 auto 8px' }} />
            <p>Loading asset inventory...</p>
          </div>
        ) : filteredAssets.length === 0 ? (
          <EmptyState
            icon={<SearchX size={32} />}
            title="No assets found"
            message="No assets match your current filters"
          />
        ) : (
          <table>
            <thead>
              <tr>
                <th>Asset ID</th>
                <th>Asset Name</th>
                <th>Asset Type</th>
                <th>Assigned To</th>
                <th>Status</th>
                <th>Assignment Date</th>
                <th>Condition</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredAssets.map(a => (
                <tr key={a.id}>
                  <td style={{ fontWeight: '600', color: 'var(--brand-primary)' }}>{String(a.id).slice(0, 10).toUpperCase()}</td>
                  <td style={{ fontWeight: '500' }}>{a.name}</td>
                  <td>{a.category}</td>
                  <td>
                    {a.assignedTo !== 'Unassigned' ? (
                      <span className="user-badge">{a.assignedTo}</span>
                    ) : (
                      <span style={{ color: 'var(--text-tertiary)' }}>Unassigned</span>
                    )}
                  </td>
                  <td>
                    <span className={`badge ${a.status.toLowerCase().replace(' ', '-')}`}>{a.status}</span>
                  </td>
                  <td>{a.purchaseDate}</td>
                  <td>{a.warranty}</td>
                  <td>
                    <div style={{ display: 'flex', gap: '8px' }}>
                      <button className="btn-icon" title="View Details" onClick={() => setSelectedAsset(a)}><Eye size={16} /></button>
                      <button className="btn-icon" title="Edit"><Edit size={16} /></button>
                      <button className="btn-icon danger" title="Delete"><Trash2 size={16} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <EnterpriseModal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)}>
        <FormHeader
          icon={PackageOpen}
          title="Add New Asset"
          description="Register company hardware equipment and assign items to employees."
        />

        <form onSubmit={handleSubmitAsset}>
          <FormBody>
            <FormSection title="1. Asset Information" description="Hardware identity and specification details.">
              <FormField label="Asset Name" required>
                <TextInput
                  placeholder="e.g. MacBook Pro 14 M3"
                  value={assetForm.name}
                  onChange={e => setAssetForm({ ...assetForm, name: e.target.value })}
                  required
                />
              </FormField>

              <FormField label="Asset Type" required>
                <SelectInput
                  options={['Laptop', 'Desktop', 'Monitor', 'Mobile / Phone', 'Keyboard', 'Mouse', 'Headset', 'Accessories', 'Furniture']}
                  value={assetForm.type}
                  onChange={e => setAssetForm({ ...assetForm, type: e.target.value })}
                  required
                />
              </FormField>

              <FormField label="Asset ID" required>
                <TextInput
                  placeholder="e.g. AST-2026-001"
                  value={assetForm.assetId}
                  onChange={e => setAssetForm({ ...assetForm, assetId: e.target.value })}
                  required
                />
              </FormField>

              <FormField label="Serial Number" required>
                <TextInput
                  placeholder="e.g. C02G1234MD6R"
                  value={assetForm.serial}
                  onChange={e => setAssetForm({ ...assetForm, serial: e.target.value })}
                  required
                />
              </FormField>

              <FormField label="Brand / Model" fullWidth optional>
                <TextInput
                  placeholder="e.g. Apple MacBook Pro A2992"
                  value={assetForm.brandModel}
                  onChange={e => setAssetForm({ ...assetForm, brandModel: e.target.value })}
                />
              </FormField>
            </FormSection>

            <FormSection title="2. Assignment & Allocation" description="Employee assignment, condition, and location details.">
              <FormField label="Assign To Employee" optional>
                <SelectInput
                  options={employeeOptions}
                  value={assetForm.assignedTo}
                  onChange={e => setAssetForm({ ...assetForm, assignedTo: e.target.value })}
                />
              </FormField>

              <FormField label="Assignment Date" optional>
                <DateInput
                  value={assetForm.assignmentDate}
                  onChange={e => setAssetForm({ ...assetForm, assignmentDate: e.target.value })}
                />
              </FormField>

              <FormField label="Asset Condition" required>
                <SelectInput
                  options={['New', 'Good / Working', 'Fair / Used', 'Damaged / Repair Needed']}
                  value={assetForm.condition}
                  onChange={e => setAssetForm({ ...assetForm, condition: e.target.value })}
                  required
                />
              </FormField>

              <FormField label="Asset Location" required>
                <SelectInput
                  options={['Headquarters (HQ)', 'Branch Office', 'Remote / WFH', 'In Transit']}
                  value={assetForm.location}
                  onChange={e => setAssetForm({ ...assetForm, location: e.target.value })}
                  required
                />
              </FormField>

              <FormField label="Asset Image" fullWidth optional>
                <FileUpload
                  fileName={assetForm.fileName}
                  onChange={handleFileChange}
                  hint="Upload asset photo, invoice, or receipt image (JPG/PNG max 10MB)"
                />
              </FormField>

              <FormField label="Remarks" fullWidth optional>
                <TextArea
                  placeholder="Any additional remarks, warranty terms, or specifications..."
                  value={assetForm.remarks}
                  onChange={e => setAssetForm({ ...assetForm, remarks: e.target.value })}
                />
              </FormField>
            </FormSection>
          </FormBody>

          <FormFooter
            onCancel={() => setIsModalOpen(false)}
            submitText={submitting ? "Saving Asset..." : "Add Asset"}
          />
        </form>
      </EnterpriseModal>

      {/* ASSET DETAILS VIEW MODAL */}
      <AnimatePresence>
        {selectedAsset && (
          <div className="modal-overlay" onClick={() => setSelectedAsset(null)} style={{ zIndex: 1200 }}>
            <motion.div 
              className="modal-content"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              onClick={e => e.stopPropagation()}
              style={{ width: '600px', maxWidth: '95vw', padding: '0', borderRadius: '16px', overflow: 'hidden', boxShadow: '0 20px 25px -5px rgba(0,0,0,0.25)' }}
            >
              <div style={{ background: 'linear-gradient(135deg, #1e293b 0%, #0f172a 100%)', color: '#ffffff', padding: '20px 24px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                  <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: 'rgba(255,255,255,0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                    <PackageOpen size={22} color="#38bdf8" />
                  </div>
                  <div>
                    <h3 style={{ margin: 0, fontSize: '18px', fontWeight: '700', color: '#f8fafc' }}>{selectedAsset.name}</h3>
                    <span style={{ fontSize: '12px', color: '#94a3b8', fontWeight: '500' }}>ID: {selectedAsset.id}</span>
                  </div>
                </div>
                <button 
                  onClick={() => setSelectedAsset(null)}
                  style={{ background: 'rgba(255,255,255,0.1)', border: 'none', color: '#94a3b8', borderRadius: '50%', width: '32px', height: '32px', display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                  <X size={18} />
                </button>
              </div>

              <div style={{ padding: '24px', display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', background: '#ffffff' }}>
                <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500', display: 'block' }}>Asset Type</span>
                  <span style={{ fontSize: '14px', color: '#0f172a', fontWeight: '600' }}>{selectedAsset.category}</span>
                </div>

                <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500', display: 'block' }}>Current Status</span>
                  <span className={`badge ${selectedAsset.status.toLowerCase().replace(' ', '-')}`} style={{ marginTop: '4px' }}>
                    {selectedAsset.status}
                  </span>
                </div>

                <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500', display: 'block' }}>Assigned Employee</span>
                  <span style={{ fontSize: '14px', color: '#2563eb', fontWeight: '600' }}>{selectedAsset.assignedTo}</span>
                </div>

                <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0' }}>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500', display: 'block' }}>Assignment Date</span>
                  <span style={{ fontSize: '14px', color: '#0f172a', fontWeight: '600' }}>{selectedAsset.purchaseDate}</span>
                </div>

                <div style={{ background: '#f8fafc', padding: '12px 16px', borderRadius: '10px', border: '1px solid #e2e8f0', gridColumn: 'span 2' }}>
                  <span style={{ fontSize: '12px', color: '#64748b', fontWeight: '500', display: 'block' }}>Condition</span>
                  <span style={{ fontSize: '14px', color: '#0f172a', fontWeight: '600' }}>{selectedAsset.warranty}</span>
                </div>
              </div>

              <div style={{ padding: '16px 24px', background: '#f1f5f9', borderTop: '1px solid #e2e8f0', textAlign: 'right' }}>
                <button 
                  onClick={() => setSelectedAsset(null)}
                  style={{ padding: '8px 20px', borderRadius: '8px', background: '#0f172a', color: '#ffffff', border: 'none', fontWeight: '600', cursor: 'pointer' }}
                >
                  Close Details
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AssetInventory;
