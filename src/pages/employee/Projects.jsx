import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FolderKanban, Users, Calendar, Briefcase, Tag, Clock, ArrowRight, ShieldCheck, CheckCircle2 } from 'lucide-react';
import DashboardLayout from '../../components/employee/DashboardLayout';
import { useAuth } from '../../contexts/AuthContext';
import { getMyProjects } from '../../services/employeeService';
import '../../styles/employee/dashboard.css';

const ROLE_LABELS = {
  project_manager: 'Project Manager',
  developer: 'Developer',
  ui_ux_designer: 'UI/UX Designer',
  tester: 'Tester',
  devops: 'DevOps',
  member: 'Team Member',
};

const STATUS_THEMES = {
  planning:  { label: 'Planning',  color: '#8b5cf6', bg: '#ede9fe' },
  active:    { label: 'Active',    color: '#059669', bg: '#d1fae5' },
  on_hold:   { label: 'On Hold',   color: '#d97706', bg: '#fef3c7' },
  completed: { label: 'Completed', color: '#2563eb', bg: '#dbeafe' },
  cancelled: { label: 'Cancelled', color: '#dc2626', bg: '#fee2e2' },
};

const EmployeeProjects = () => {
  const { user } = useAuth();
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    const fetchProjects = async () => {
      setLoading(true);
      const { data } = await getMyProjects(user.id);
      setProjects(data || []);
      setLoading(false);
    };
    fetchProjects();
  }, [user]);

  return (
    <DashboardLayout>
      <div className="employee-projects-container" style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
        {/* Header */}
        <div style={{ marginBottom: '24px' }}>
          <h1 style={{ fontSize: '24px', fontWeight: 700, color: '#0f172a', display: 'flex', alignItems: 'center', gap: '10px', margin: '0 0 6px 0' }}>
            <FolderKanban size={26} color="#2563eb" /> My Projects
          </h1>
          <p style={{ color: '#64748b', fontSize: '14px', margin: 0 }}>
            Overview of company projects you are currently assigned to as a team member.
          </p>
        </div>

        {/* Projects List */}
        {loading ? (
          <div style={{ padding: '60px', textAlign: 'center', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <p style={{ color: '#64748b', fontWeight: 600 }}>Loading assigned projects...</p>
          </div>
        ) : projects.length === 0 ? (
          <div style={{ padding: '60px 20px', textAlign: 'center', background: '#ffffff', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <FolderKanban size={56} color="#cbd5e1" style={{ margin: '0 auto 16px' }} />
            <h3 style={{ margin: '0 0 8px 0', fontSize: '18px', color: '#1e293b' }}>No Projects Assigned Yet</h3>
            <p style={{ color: '#64748b', margin: 0, fontSize: '14px' }}>
              When an admin assigns you to a company project, it will appear here.
            </p>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(350px, 1fr))', gap: '20px' }}>
            {projects.map(project => {
              const theme = STATUS_THEMES[project.status] || STATUS_THEMES.active;
              const roleText = ROLE_LABELS[project.myRole] || project.myRole || 'Member';

              return (
                <motion.div
                  key={project.id || project.name}
                  whileHover={{ y: -3 }}
                  style={{
                    background: '#ffffff',
                    borderRadius: '16px',
                    border: '1px solid #e2e8f0',
                    padding: '20px',
                    display: 'flex',
                    flexDirection: 'column',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                  }}
                >
                  {/* Top row */}
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '14px' }}>
                    <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                      <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: theme.bg, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        <FolderKanban size={20} color={theme.color} />
                      </div>
                      <div>
                        <h3 style={{ fontSize: '16px', fontWeight: 700, color: '#0f172a', margin: '0 0 4px 0' }}>{project.name}</h3>
                        <span style={{ fontSize: '11px', fontWeight: 700, color: theme.color, background: theme.bg, padding: '2px 8px', borderRadius: '6px', textTransform: 'uppercase' }}>
                          {theme.label}
                        </span>
                      </div>
                    </div>
                  </div>

                  {/* Description */}
                  {project.description && (
                    <p style={{ fontSize: '13px', color: '#64748b', lineHeight: 1.5, margin: '0 0 14px 0' }}>
                      {project.description}
                    </p>
                  )}

                  {/* Role Badge */}
                  <div style={{ marginBottom: '14px', display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <span style={{ fontSize: '12px', color: '#475569', fontWeight: 600 }}>Your Role:</span>
                    <span style={{ fontSize: '12px', fontWeight: 700, background: '#eff6ff', color: '#2563eb', padding: '4px 10px', borderRadius: '8px', display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                      <ShieldCheck size={14} /> {roleText}
                    </span>
                  </div>

                  {/* Departments */}
                  {project.departments?.length > 0 && (
                    <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px', marginBottom: '14px' }}>
                      {project.departments.map(dept => (
                        <span key={dept} style={{ fontSize: '11px', background: '#f8fafc', border: '1px solid #e2e8f0', color: '#475569', padding: '2px 8px', borderRadius: '6px', display: 'inline-flex', alignItems: 'center', gap: '4px' }}>
                          <Briefcase size={10} /> {dept}
                        </span>
                      ))}
                    </div>
                  )}

                  {/* Dates */}
                  {(project.start_date || project.end_date) && (
                    <div style={{ fontSize: '12px', color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px', marginTop: 'auto', paddingTop: '12px', borderTop: '1px solid #f1f5f9' }}>
                      <Calendar size={13} color="#94a3b8" />
                      <span>{project.start_date || 'Started'} → {project.end_date || 'Ongoing'}</span>
                    </div>
                  )}
                </motion.div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};

export default EmployeeProjects;
