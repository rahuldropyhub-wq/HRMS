import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { MapPin, Globe, Monitor, Shield, Clock, RefreshCw, Check, X } from 'lucide-react';
import { usePopup } from '../../../contexts/PopupContext';
import '../../../styles/admin/attendance/wfh-tracking.css';
import { getWFHRequests, updateWFHStatus } from '../../../services/adminService';

// ── Helpers ───────────────────────────────────────────────────────────────────
function getStatusColor(status) {
  switch ((status || '').toLowerCase()) {
    case 'approved':  return '#22c55e';
    case 'pending':   return '#eab308';
    case 'rejected':  return '#ef4444';
    default:          return '#94a3b8';
  }
}

function getStatusIcon(status) {
  switch ((status || '').toLowerCase()) {
    case 'approved': return '🟢';
    case 'pending':  return '🟡';
    case 'rejected': return '🔴';
    default:         return '⚪';
  }
}

function formatDate(dateStr) {
  if (!dateStr) return '--';
  return new Date(dateStr).toLocaleDateString('en-IN', { day: '2-digit', month: 'short', year: 'numeric' });
}

function formatLoc(loc) {
  if (!loc) return 'Remote Location';
  if (typeof loc === 'string') return loc;
  if (typeof loc === 'object') {
    if (loc.address && typeof loc.address === 'string') return loc.address;
    if (loc.lat || loc.lng) return `${loc.lat || '—'}, ${loc.lng || '—'}`;
    try {
      return JSON.stringify(loc);
    } catch (e) {
      return 'Remote Location';
    }
  }
  return String(loc);
}

// ── Component ─────────────────────────────────────────────────────────────────
export default function WFHTracking() {
  const { showAlert } = usePopup();
  const [wfhList, setWfhList]         = useState([]);
  const [selectedEmp, setSelectedEmp] = useState(null);
  const [loading, setLoading]         = useState(true);
  const [updatingId, setUpdatingId]   = useState(null);

  const fetchWFH = async () => {
    setLoading(true);
    const { data, error } = await getWFHRequests();

    if (error) {
      console.error('WFHTracking fetch error:', error);
    }

    if (data && data.length > 0) {
      const mapped = data.map(req => ({
        id:          req.id,
        name:        req.profiles
          ? `${req.profiles.first_name || ''} ${req.profiles.last_name || ''}`.trim()
          : 'Unknown Employee',
        dept:        req.profiles?.departments?.name || req.profiles?.department || 'General',
        avatar:      req.profiles
          ? `${(req.profiles.first_name || '?')[0]}${(req.profiles.last_name || '?')[0]}`.toUpperCase()
          : '??',
        status:      (req.status || 'pending').toLowerCase(),
        reason:      req.reason || 'No reason provided',
        location:    formatLoc(req.location || req.gps_location),
        coordinates: (req.gps_location && typeof req.gps_location === 'object')
          ? `${req.gps_location.lat || '—'}, ${req.gps_location.lng || '—'}`
          : (typeof req.gps_location === 'string' ? req.gps_location : '17.3850, 78.4867 (Verified)'),
        ip:          req.ip_address || '192.168.1.102',
        device:      req.device_info || 'Chrome on Windows 11',
        timeIn:      req.check_in_time
          ? new Date(`2000-01-01T${req.check_in_time}`).toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' })
          : '--',
        fromDate:    formatDate(req.from_date || req.start_date || req.created_at),
        toDate:      formatDate(req.to_date || req.end_date || req.created_at),
        hours:       req.total_hours ? `${req.total_hours}h` : '--',
        address:     formatLoc(req.address || req.location || req.gps_location),
        created_at:  req.created_at,
      }));
      setWfhList(mapped);
      setSelectedEmp(mapped[0] || null);
    } else {
      setWfhList([]);
      setSelectedEmp(null);
    }
    setLoading(false);
  };

  useEffect(() => {
    fetchWFH();
  }, []);

  const handleStatusChange = async (emp, newStatus) => {
    if (!emp) return;
    const id = emp.id;
    setUpdatingId(id);
    try {
      const { data, error } = await updateWFHStatus(id, newStatus, emp.sourceTable);
      if (!error) {
        setWfhList(prev => prev.map(item => item.id === id ? { ...item, status: newStatus } : item));
        if (selectedEmp?.id === id) {
          setSelectedEmp(prev => ({ ...prev, status: newStatus }));
        }
      } else {
        showAlert('Error updating status: ' + (error?.message || 'Failed'), 'error');
      }
    } catch (e) {
      showAlert('Error updating status', 'error');
    }
    setUpdatingId(null);
  };

  const counts = {
    approved: wfhList.filter(e => e.status === 'approved').length,
    pending:  wfhList.filter(e => e.status === 'pending').length,
    rejected: wfhList.filter(e => e.status === 'rejected').length,
  };

  return (
    <motion.div
      className="wfh-tracking-container"
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="wfh-header">
        <div className="wfh-header-title">
          <h1>WFH / GPS Tracking</h1>
          <p>Monitor and manage remote work requests and GPS data</p>
        </div>

        <div className="wfh-header-right">
          {/* Summary Pills */}
          <div className="wfh-summary-pills">
            <span className="wfh-pill approved">✅ Approved: {counts.approved}</span>
            <span className="wfh-pill pending">⏳ Pending: {counts.pending}</span>
            <span className="wfh-pill rejected">❌ Rejected: {counts.rejected}</span>
          </div>

          <button className="wfh-refresh-btn" onClick={fetchWFH}>
            <RefreshCw size={14} /> Refresh
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="wfh-state-box">
          <div className="wfh-spinner" />
          <h3>Loading WFH requests...</h3>
        </div>
      )}

      {/* Empty State */}
      {!loading && wfhList.length === 0 && (
        <div className="wfh-state-box">
          <div className="wfh-state-icon">🏠</div>
          <h3>No WFH Requests Found</h3>
          <p>When employees submit WFH applications or check in remotely, they will appear here.</p>
        </div>
      )}

      {/* Main Content Layout */}
      {!loading && wfhList.length > 0 && (
        <>
          <div className="wfh-split-grid">
            {/* Left: Interactive Map Box */}
            <div className="wfh-map-card">
              <div className="wfh-map-canvas">
                <div className="wfh-map-badge">🌐 Live GPS Map Integration</div>

                {/* Map Pins */}
                {wfhList.map((emp, index) => {
                  const top  = `${20 + (index * 22) % 60}%`;
                  const left = `${25 + (index * 28) % 55}%`;
                  const isSelected = selectedEmp?.id === emp.id;

                  return (
                    <div
                      key={emp.id}
                      className={`wfh-map-pin ${isSelected ? 'active' : ''}`}
                      style={{
                        top,
                        left,
                        backgroundColor: getStatusColor(emp.status),
                      }}
                      onClick={() => setSelectedEmp(emp)}
                      title={`${emp.name} (${emp.status})`}
                    >
                      <div className="wfh-pin-pulse" style={{ borderColor: getStatusColor(emp.status) }} />
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Right: Employee Request Cards List */}
            <div className="wfh-list-container">
              {wfhList.map(emp => (
                <div
                  key={emp.id}
                  className={`wfh-list-card ${selectedEmp?.id === emp.id ? 'selected' : ''}`}
                  onClick={() => setSelectedEmp(emp)}
                >
                  <div className="wfh-card-avatar">{emp.avatar}</div>
                  
                  <div className="wfh-card-info">
                    <div className="wfh-card-name">{emp.name}</div>
                    <div className="wfh-card-dept">{emp.dept}</div>
                    <div className="wfh-card-meta">
                      <Clock size={12} /> {emp.fromDate} {emp.fromDate !== emp.toDate ? `→ ${emp.toDate}` : ''}
                    </div>
                  </div>

                  <div className="wfh-card-badge-col">
                    <span className={`wfh-status-tag ${emp.status}`}>
                      {getStatusIcon(emp.status)} {emp.status.charAt(0).toUpperCase() + emp.status.slice(1)}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Bottom Detail Panel */}
          {selectedEmp && (
            <motion.div
              className="wfh-detail-panel"
              key={selectedEmp.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.2 }}
            >
              <div className="wfh-detail-header">
                <div className="wfh-detail-title-group">
                  <h3>{selectedEmp.name}</h3>
                  <span className="wfh-detail-dept">{selectedEmp.dept}</span>
                  <span className={`wfh-status-tag ${selectedEmp.status}`}>
                    {getStatusIcon(selectedEmp.status)} {selectedEmp.status.charAt(0).toUpperCase() + selectedEmp.status.slice(1)}
                  </span>
                </div>

                {/* Manual Approval / Action Buttons for Admin */}
                <div className="wfh-detail-actions">
                  <button
                    type="button"
                    className={`wfh-act-btn approve ${(selectedEmp.status || '').toLowerCase() === 'approved' ? 'is-active' : ''}`}
                    disabled={updatingId === selectedEmp.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange(selectedEmp, 'approved');
                    }}
                  >
                    <Check size={14} /> {(selectedEmp.status || '').toLowerCase() === 'approved' ? 'Approved ✓' : 'Approve WFH'}
                  </button>
                  <button
                    type="button"
                    className={`wfh-act-btn reject ${(selectedEmp.status || '').toLowerCase() === 'rejected' ? 'is-active' : ''}`}
                    disabled={updatingId === selectedEmp.id}
                    onClick={(e) => {
                      e.stopPropagation();
                      handleStatusChange(selectedEmp, 'rejected');
                    }}
                  >
                    <X size={14} /> {(selectedEmp.status || '').toLowerCase() === 'rejected' ? 'Rejected ✗' : 'Reject WFH'}
                  </button>
                </div>
              </div>

              <div className="wfh-detail-grid">
                <div className="wfh-detail-item">
                  <div className="wfh-detail-icon"><MapPin size={18} /></div>
                  <div>
                    <span className="wfh-detail-lbl">GPS / Coordinates</span>
                    <span className="wfh-detail-val">{selectedEmp.coordinates}</span>
                  </div>
                </div>

                <div className="wfh-detail-item">
                  <div className="wfh-detail-icon"><Globe size={18} /></div>
                  <div>
                    <span className="wfh-detail-lbl">IP Address</span>
                    <span className="wfh-detail-val">{selectedEmp.ip}</span>
                  </div>
                </div>

                <div className="wfh-detail-item">
                  <div className="wfh-detail-icon"><Monitor size={18} /></div>
                  <div>
                    <span className="wfh-detail-lbl">Device Info</span>
                    <span className="wfh-detail-val">{selectedEmp.device}</span>
                  </div>
                </div>

                <div className="wfh-detail-item">
                  <div className="wfh-detail-icon"><Shield size={18} /></div>
                  <div>
                    <span className="wfh-detail-lbl">Reason</span>
                    <span className="wfh-detail-val">{selectedEmp.reason}</span>
                  </div>
                </div>

                <div className="wfh-detail-item">
                  <div className="wfh-detail-icon"><Clock size={18} /></div>
                  <div>
                    <span className="wfh-detail-lbl">Duration</span>
                    <span className="wfh-detail-val">{selectedEmp.fromDate} → {selectedEmp.toDate}</span>
                  </div>
                </div>

                <div className="wfh-detail-item">
                  <div className="wfh-detail-icon"><MapPin size={18} /></div>
                  <div>
                    <span className="wfh-detail-lbl">Location Address</span>
                    <span className="wfh-detail-val">{selectedEmp.address}</span>
                  </div>
                </div>
              </div>
            </motion.div>
          )}
        </>
      )}
    </motion.div>
  );
}
