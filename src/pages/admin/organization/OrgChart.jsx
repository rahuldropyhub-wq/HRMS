import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ZoomIn, ZoomOut, Maximize, ChevronDown } from 'lucide-react';
import '../../../styles/admin/organization/org-chart.css';

// Custom Org Node Component
const OrgNode = ({ name, title, avatar, isRoot, hasChildren }) => (
  <div className={`org-node ${isRoot ? 'root-node' : ''}`}>
    <div className="node-avatar">{avatar}</div>
    <div className="node-name">{name}</div>
    <div className="node-title">{title}</div>
    {hasChildren && (
      <div className="node-expand-btn">
        <ChevronDown size={14} />
      </div>
    )}
  </div>
);

const OrgChart = () => {
  const [scale, setScale] = useState(1);

  const handleZoomIn = () => setScale(prev => Math.min(prev + 0.1, 1.5));
  const handleZoomOut = () => setScale(prev => Math.max(prev - 0.1, 0.5));
  const handleReset = () => setScale(1);

  return (
    <motion.div 
      className="org-chart-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="page-header">
        <div className="page-title">
          <h1>Organization Chart</h1>
          <p>Visual representation of the company hierarchy</p>
        </div>
        <div className="zoom-controls">
          <button className="btn-zoom" onClick={handleZoomOut} title="Zoom Out"><ZoomOut size={18} /></button>
          <button className="btn-zoom" onClick={handleReset} title="Reset Zoom"><Maximize size={16} /></button>
          <button className="btn-zoom" onClick={handleZoomIn} title="Zoom In"><ZoomIn size={18} /></button>
        </div>
      </div>

      <div className="chart-wrapper">
        <motion.div 
          className="tree"
          animate={{ scale }}
          transition={{ type: 'spring', stiffness: 300, damping: 30 }}
          style={{ transformOrigin: 'top center' }}
        >
          <ul>
            <li>
              <OrgNode name="Anand Sharma" title="CEO" avatar="AS" isRoot={true} hasChildren={true} />
              <ul>
                <li>
                  <OrgNode name="Vikram Singh" title="CTO" avatar="VS" hasChildren={true} />
                  <ul>
                    <li>
                      <OrgNode name="Rajesh Kumar" title="Engineering Mgr" avatar="RK" hasChildren={false} />
                    </li>
                    <li>
                      <OrgNode name="Pooja Iyer" title="QA Mgr" avatar="PI" hasChildren={false} />
                    </li>
                    <li>
                      <OrgNode name="Amit Kumar" title="Design Mgr" avatar="AK" hasChildren={false} />
                    </li>
                  </ul>
                </li>
                <li>
                  <OrgNode name="Neha Gupta" title="CFO" avatar="NG" hasChildren={true} />
                  <ul>
                    <li>
                      <OrgNode name="Rohan Verma" title="Finance Mgr" avatar="RV" hasChildren={false} />
                    </li>
                    <li>
                      <OrgNode name="Anita Desai" title="Legal Head" avatar="AD" hasChildren={false} />
                    </li>
                  </ul>
                </li>
                <li>
                  <OrgNode name="Priya Patel" title="COO" avatar="PP" hasChildren={true} />
                  <ul>
                    <li>
                      <OrgNode name="Suresh Raina" title="Sales Mgr" avatar="SR" hasChildren={false} />
                    </li>
                    <li>
                      <OrgNode name="Anjali Desai" title="Ops Mgr" avatar="AD" hasChildren={false} />
                    </li>
                    <li>
                      <OrgNode name="Meera Nair" title="HR Mgr" avatar="MN" hasChildren={false} />
                    </li>
                  </ul>
                </li>
              </ul>
            </li>
          </ul>
        </motion.div>
      </div>
    </motion.div>
  );
};

export default OrgChart;
