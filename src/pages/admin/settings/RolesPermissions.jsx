import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { ChevronRight } from 'lucide-react';
import '../../../styles/admin/settings/roles-permissions.css';

const ROLES = [
  { id: 'admin', name: 'System Admin' },
  { id: 'hr', name: 'HR Manager' },
  { id: 'manager', name: 'Department Manager' },
  { id: 'lead', name: 'Team Lead' },
  { id: 'employee', name: 'Employee (Default)' }
];

const MODULES = [
  'Employees', 'Attendance', 'Leave', 'Tasks', 
  'Worksheets', 'Tickets', 'Assets', 'Reports', 
  'Settings', 'Audit Logs'
];

// Initial mock state
const INITIAL_PERMISSIONS = {
  admin: MODULES.reduce((acc, mod) => ({
    ...acc, [mod]: { view: true, create: true, edit: true, delete: true }
  }), {}),
  hr: MODULES.reduce((acc, mod) => {
    const isHrModule = ['Employees', 'Attendance', 'Leave', 'Reports'].includes(mod);
    return { ...acc, [mod]: { view: true, create: isHrModule, edit: isHrModule, delete: false } };
  }, {}),
  manager: MODULES.reduce((acc, mod) => ({
    ...acc, [mod]: { view: true, create: false, edit: false, delete: false }
  }), {})
};

const RolesPermissions = () => {
  const [activeRole, setActiveRole] = useState('admin');
  const [saveSuccess, setSaveSuccess] = useState(false);
  
  // Use state to make checkboxes interactive and persistent
  const [permissions, setPermissions] = useState(() => {
    try {
      const saved = localStorage.getItem('hrms_role_permissions');
      return saved ? JSON.parse(saved) : INITIAL_PERMISSIONS;
    } catch (e) {
      return INITIAL_PERMISSIONS;
    }
  });

  const handleToggle = (moduleName, action) => {
    setPermissions(prev => {
      const rolePerms = prev[activeRole] || {};
      const modPerms = rolePerms[moduleName] || { view: false, create: false, edit: false, delete: false };
      
      return {
        ...prev,
        [activeRole]: {
          ...rolePerms,
          [moduleName]: {
            ...modPerms,
            [action]: !modPerms[action]
          }
        }
      };
    });
  };

  const currentPerms = permissions[activeRole] || {};

  const handleSave = (e) => {
    e.preventDefault();
    try {
      localStorage.setItem('hrms_role_permissions', JSON.stringify(permissions));
      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err) {}
  };

  return (
    <motion.div 
      className="roles-permissions-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="page-header">
        <div className="page-title">
          <h1>Roles & Permissions</h1>
          <p>Configure access control and module visibility for different user roles</p>
        </div>
      </div>

      <div className="roles-layout">
        <div className="roles-sidebar">
          {ROLES.map(role => (
            <button 
              key={role.id}
              className={`role-btn ${activeRole === role.id ? 'active' : ''}`}
              onClick={() => setActiveRole(role.id)}
            >
              {role.name}
              {activeRole === role.id && <ChevronRight size={16} />}
            </button>
          ))}
        </div>

        <div className="permissions-content">
          <motion.div 
            key={activeRole}
            initial={{ opacity: 0 }} 
            animate={{ opacity: 1 }}
            style={{ display: 'flex', flexDirection: 'column', height: '100%' }}
          >
            <h2 className="role-title">
              Permissions: {ROLES.find(r => r.id === activeRole)?.name}
            </h2>
            
            <form onSubmit={handleSave} style={{ display: 'flex', flexDirection: 'column', flex: 1 }}>
              <div className="table-container">
                <table>
                  <thead>
                    <tr>
                      <th>Module</th>
                      <th>View</th>
                      <th>Create</th>
                      <th>Edit</th>
                      <th>Delete</th>
                    </tr>
                  </thead>
                  <tbody>
                    {MODULES.map(mod => {
                      const perms = currentPerms[mod] || { view: false, create: false, edit: false, delete: false };
                      return (
                        <tr key={mod}>
                          <td>{mod}</td>
                          <td>
                            <div className="checkbox-cell">
                              <input 
                                type="checkbox" 
                                checked={perms.view} 
                                onChange={() => handleToggle(mod, 'view')}
                              />
                            </div>
                          </td>
                          <td>
                            <div className="checkbox-cell">
                              <input 
                                type="checkbox" 
                                checked={perms.create} 
                                onChange={() => handleToggle(mod, 'create')}
                              />
                            </div>
                          </td>
                          <td>
                            <div className="checkbox-cell">
                              <input 
                                type="checkbox" 
                                checked={perms.edit} 
                                onChange={() => handleToggle(mod, 'edit')}
                              />
                            </div>
                          </td>
                          <td>
                            <div className="checkbox-cell">
                              <input 
                                type="checkbox" 
                                checked={perms.delete} 
                                onChange={() => handleToggle(mod, 'delete')}
                              />
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>

              <div className="form-actions" style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <button type="submit" className="btn-primary">Save Permissions</button>
                {saveSuccess && (
                  <span style={{ fontSize: '13px', color: '#10b981', fontWeight: 600 }}>
                    ✓ Permissions saved successfully for {ROLES.find(r => r.id === activeRole)?.name}!
                  </span>
                )}
              </div>
            </form>
          </motion.div>
        </div>
      </div>
    </motion.div>
  );
};

export default RolesPermissions;
