import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Plus, Filter, Edit, Trash2, ShieldCheck, SearchX, Box, CheckCircle, Wrench, X, UserPlus } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useForm } from 'react-hook-form';
import '../../../styles/admin/assets/asset-inventory.css';
import EmptyState from '../../../components/admin/EmptyState';
import CustomDropdown from '../../../components/admin/CustomDropdown';

const MOCK_ASSETS = [
  { id: 'AST-001', name: 'MacBook Pro 16"', category: 'Laptop', assignedTo: 'Rahul Sharma', status: 'Assigned', purchaseDate: '15 Jan 2024', warranty: '14 Jan 2027' },
  { id: 'AST-002', name: 'Dell UltraSharp 27"', category: 'Monitor', assignedTo: 'Unassigned', status: 'Available', purchaseDate: '10 Feb 2024', warranty: '09 Feb 2027' },
  { id: 'AST-003', name: 'Logitech MX Master 3', category: 'Mouse', assignedTo: 'Priya Patel', status: 'Assigned', purchaseDate: '20 Mar 2024', warranty: '19 Mar 2025' },
  { id: 'AST-004', name: 'Herman Miller Aeron', category: 'Chair', assignedTo: 'Unassigned', status: 'In Repair', purchaseDate: '01 Jun 2023', warranty: '31 May 2035' },
  { id: 'AST-005', name: 'iPhone 13 Pro', category: 'Phone', assignedTo: 'Amit Kumar', status: 'Assigned', purchaseDate: '15 Oct 2022', warranty: 'Expired' },
  { id: 'AST-006', name: 'Lenovo ThinkPad X1', category: 'Laptop', assignedTo: 'Unassigned', status: 'Available', purchaseDate: '05 May 2024', warranty: '04 May 2027' },
  { id: 'AST-007', name: 'Keychron K8 Pro', category: 'Keyboard', assignedTo: 'Neha Gupta', status: 'Assigned', purchaseDate: '12 Aug 2023', warranty: '11 Aug 2024' },
  { id: 'AST-008', name: 'Jabra Evolve2 65', category: 'Headset', assignedTo: 'Vikram Singh', status: 'Assigned', purchaseDate: '22 Nov 2023', warranty: '21 Nov 2025' },
  { id: 'AST-009', name: 'Old Dell Desktop', category: 'Desktop', assignedTo: 'Unassigned', status: 'Retired', purchaseDate: '10 Jan 2019', warranty: 'Expired' },
  { id: 'AST-010', name: 'Access ID Card', category: 'ID Card', assignedTo: 'Anjali Desai', status: 'Assigned', purchaseDate: '01 Jul 2024', warranty: 'N/A' },
];

const AssetInventory = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [catFilter, setCatFilter] = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [assignFilter, setAssignFilter] = useState('');

  const [assets, setAssets] = useState(MOCK_ASSETS);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const filteredAssets = assets.filter(a => {
    const matchesSearch = a.name.toLowerCase().includes(searchTerm.toLowerCase()) || 
                          a.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesCat = catFilter ? a.category === catFilter : true;
    const matchesStatus = statusFilter ? a.status === statusFilter : true;
    const matchesAssign = assignFilter === 'Assigned' ? a.assignedTo !== 'Unassigned' : 
                          assignFilter === 'Unassigned' ? a.assignedTo === 'Unassigned' : true;
    return matchesSearch && matchesCat && matchesStatus && matchesAssign;
  });

  const onSubmit = (data) => {
    const newAsset = {
      id: `AST-0${assets.length + 1}`,
      name: data.name,
      category: data.category,
      assignedTo: 'Unassigned',
      status: 'Available',
      purchaseDate: data.purchaseDate || 'N/A',
      warranty: data.warranty || 'N/A'
    };
    setAssets([newAsset, ...assets]);
    setIsModalOpen(false);
    reset();
  };

  const closeModal = () => {
    setIsModalOpen(false);
    reset();
  };

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
        <button className="btn-primary" onClick={() => setIsModalOpen(true)}>
          <Plus size={18} /> Add Asset
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
            onChange={() => {}}
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
            onChange={() => {}}
            options={[
              { value: '', label: 'All Statuses' },
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
            onChange={() => {}}
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
        {filteredAssets.length === 0 ? (
          <EmptyState 
            icon={<SearchX size={32} />}
            title="No assets found"
            message="No assets match your current filters"
          />
        ) : (
          <table>
            <thead>
            <tr>
              <th>Asset Details</th>
              <th>Category</th>
              <th>Assigned To</th>
              <th>Status</th>
              <th>Purchase Date</th>
              <th>Warranty</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredAssets.map(asset => (
              <tr key={asset.id}>
                <td>
                  <div className="asset-name">{asset.name}</div>
                  <div className="asset-id">{asset.id}</div>
                </td>
                <td>{asset.category}</td>
                <td>{asset.assignedTo}</td>
                <td>
                  <span className={`badge status-${asset.status.toLowerCase().replace(' ', '')}`}>
                    {asset.status}
                  </span>
                </td>
                <td>{asset.purchaseDate}</td>
                <td>{asset.warranty}</td>
                <td>
                  <div className="lr-action-group">
                    <Link to="/admin/assets/assign" className="lr-btn-assign">
                      <UserPlus size={13} /> Assign
                    </Link>
                    <button className="lr-btn-edit">
                      <Edit size={13} /> Edit
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {filteredAssets.length === 0 && (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center', padding: '40px', color: 'var(--text-tertiary)' }}>
                  No assets found matching your criteria.
                </td>
              </tr>
            )}
          </tbody>
        </table>
        )}
      </div>

      <AnimatePresence>
        {isModalOpen && (
          <div className="modal-overlay" onClick={closeModal}>
            <motion.div 
              className="modal-content"
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ duration: 0.2 }}
              onClick={e => e.stopPropagation()}
            >
              <div className="modal-header">
                <h3>Add New Asset</h3>
                <button className="close-btn" onClick={closeModal}><X size={24} /></button>
              </div>
              <form onSubmit={handleSubmit(onSubmit)}>
                <div className="form-group">
                  <label>Asset Name <span>*</span></label>
                  <input 
                    type="text" 
                    className={`form-control ${errors.name ? 'error' : ''}`}
                    placeholder="e.g., MacBook Pro 14"
                    {...register('name', { required: 'Name is required' })}
                  />
                  {errors.name && <span className="error-message">{errors.name.message}</span>}
                </div>
                
                <div className="form-row">
                  <div className="form-group">
                    <label>Category <span>*</span></label>
                    <div style={{ width: '180px' }}>
          <CustomDropdown
            value=""
            onChange={() => {}}
            options={[
              { value: '', label: 'Select' },
              { value: 'Laptop', label: 'Laptop' },
              { value: 'Desktop', label: 'Desktop' },
              { value: 'Monitor', label: 'Monitor' },
              { value: 'Mouse', label: 'Mouse' },
              { value: 'Keyboard', label: 'Keyboard' },
              { value: 'Phone', label: 'Phone' }
            ]}
            fullWidth
          />
        </div>
                    {errors.category && <span className="error-message">{errors.category.message}</span>}
                  </div>
                  <div className="form-group">
                    <label>Serial Number</label>
                    <input type="text" className="form-control" {...register('serial')} />
                  </div>
                </div>

                <div className="form-row">
                  <div className="form-group">
                    <label>Purchase Date</label>
                    <input type="date" className="form-control" {...register('purchaseDate')} />
                  </div>
                  <div className="form-group">
                    <label>Warranty Expiry</label>
                    <input type="date" className="form-control" {...register('warranty')} />
                  </div>
                </div>
                
                <div className="form-group">
                  <label>Notes</label>
                  <input type="text" className="form-control" {...register('notes')} />
                </div>

                <div className="modal-footer">
                  <button type="button" className="btn-cancel" onClick={closeModal}>Cancel</button>
                  <button type="submit" className="btn-submit">Add Asset</button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default AssetInventory;
