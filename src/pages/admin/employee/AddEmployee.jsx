import React, { useState, useEffect, useRef } from 'react';
import { compressDocument } from '../../../utils/imageCompressor';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { UploadCloud, ArrowLeft, ArrowRight, Save, CheckCircle, User, Building2, CreditCard, FileText } from 'lucide-react';
import '../../../styles/admin/employee/add-employee.css';
import CustomDropdown from '../../../components/admin/CustomDropdown';
import { createEmployee, getEmployeeById, updateEmployee, getAllEmployees } from '../../../services/adminService';

const STEPS = [
  'Personal Info',
  'Company Info',
  'Bank Details',
  'Documents',
  'Review'
];

const AddEmployee = () => {
  const navigate = useNavigate();
  const { id } = useParams();
  const isEditMode = Boolean(id);
  const [currentStep, setCurrentStep] = useState(1);
  const { register, handleSubmit, formState: { errors }, trigger, getValues, setValue, reset } = useForm({
    defaultValues: isEditMode ? {} : JSON.parse(localStorage.getItem('employeeDraft') || '{}')
  });
  const [uploadedDocs, setUploadedDocs] = useState([]);
  const uploadedDocsRef = useRef(uploadedDocs);
  React.useEffect(() => {
    uploadedDocsRef.current = uploadedDocs;
  }, [uploadedDocs]);
  const [ifscLoading, setIfscLoading] = useState(false);
  const [ifscError, setIfscError] = useState('');
  const [showSuccess, setShowSuccess] = useState(false);
  const [submitError, setSubmitError] = useState('');
  const [draftSaved, setDraftSaved] = useState(false);
  const [managersList, setManagersList] = useState([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const fetchManagers = async () => {
      const { data } = await getAllEmployees();
      if (data) setManagersList(data);
    };
    fetchManagers();
  }, []);

  useEffect(() => {
    if (isEditMode) {
      const loadData = async () => {
        setIsLoading(true);
        const { data } = await getEmployeeById(id);
        if (data) {
          const prefillData = {
            ...(data.raw_data || {}),
            ...data,
            firstName: data.firstName || data.first_name || data.raw_data?.firstName || '',
            lastName: data.lastName || data.last_name || data.raw_data?.lastName || '',
            personalEmail: data.personalEmail || data.raw_data?.personalEmail || '',
            officialEmail: data.officialEmail || data.email || data.raw_data?.officialEmail || '',
            phone: data.phone || data.raw_data?.phone || '',
            dob: data.dob || data.raw_data?.dob || '',
            gender: data.gender || data.raw_data?.gender || '',
            bloodGroup: data.bloodGroup || data.raw_data?.bloodGroup || '',
            maritalStatus: data.maritalStatus || data.raw_data?.maritalStatus || '',
            address: data.address || data.raw_data?.address || '',
            city: data.city || data.raw_data?.city || '',
            state: data.state || data.raw_data?.state || '',
            pincode: data.pincode || data.raw_data?.pincode || '',
            empId: data.empId || data.emp_id || data.raw_data?.empId || data.id || '',
            department: data.department || data.raw_data?.department || '',
            designation: data.designation || data.raw_data?.designation || '',
            joinDate: data.joinDate || data.raw_data?.joinDate || '',
            employmentType: data.employmentType || data.raw_data?.employmentType || '',
            workLocation: data.workLocation || data.raw_data?.workLocation || '',
            shift: data.shift || data.raw_data?.shift || '',
            leaveBalance: data.leaveBalance || data.raw_data?.leaveBalance || 0,
            bankName: data.bankName || data.raw_data?.bankName || '',
            accountNumber: data.accountNumber || data.raw_data?.accountNumber || '',
            ifscCode: data.ifscCode || data.raw_data?.ifscCode || '',
            accountHolder: data.accountHolder || data.raw_data?.accountHolder || '',
            panNumber: data.panNumber || data.raw_data?.panNumber || '',
            aadharNumber: data.aadharNumber || data.raw_data?.aadharNumber || '',
            manager: data.manager || data.raw_data?.manager || '',
          };
          reset(prefillData);

          const docs = data.documents || data.raw_data?.documents || [];
          if (docs.length > 0) {
            setUploadedDocs(docs);
          }
        }
        setIsLoading(false);
      };
      loadData();
    }
  }, [id, isEditMode, reset]);

  const handleSaveDraft = () => {
    const data = getValues();
    const completeRawData = { ...data, documents: uploadedDocs };
    localStorage.setItem('employeeDraft', JSON.stringify(completeRawData));
    setDraftSaved(true);
    setTimeout(() => setDraftSaved(false), 3000);
  };

  const handleFileUpload = (e, docType) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setSubmitError('File size exceeds 5MB limit. Please choose a smaller file.');
        return;
      }
      compressDocument(file).then(({ dataUrl }) => {
        const newDoc = { type: docType, name: file.name, url: dataUrl, uploadDate: new Date().toISOString().split('T')[0] };
        setUploadedDocs(prev => {
          const filtered = prev.filter(d => d.type !== docType);
          return [...filtered, newDoc];
        });
      }).catch(() => {
        setSubmitError('Failed to process the file. Please try again.');
      });
    }
  };

  const handleIfscChange = async (e) => {
    const code = e.target.value.toUpperCase();
    // React Hook Form will handle the value update internally because we pass this to register.
    // We just want to watch the length.
    
    if (code.length === 11) {
      setIfscLoading(true);
      setIfscError('');
      try {
        const response = await fetch(`https://ifsc.razorpay.com/${code}`);
        if (response.ok) {
          const data = await response.json();
          setValue('bankName', data.BANK, { shouldValidate: true, shouldDirty: true, shouldTouch: true });
          // optionally set city/state if needed
        } else {
          setIfscError('Invalid IFSC Code');
          setValue('bankName', '', { shouldValidate: true });
        }
      } catch (error) {
        setIfscError('Failed to verify IFSC');
      } finally {
        setIfscLoading(false);
      }
    } else {
      setIfscError('');
    }
  };

  const handleNext = async () => {
    let fieldsToValidate = [];
    if (currentStep === 1) {
      fieldsToValidate = ['firstName', 'lastName', 'personalEmail', 'phone', 'dob', 'gender'];
    } else if (currentStep === 2) {
      fieldsToValidate = ['empId', 'officialEmail', 'department', 'designation', 'joinDate', 'employmentType', 'workLocation', 'shift'];
    }

    const isStepValid = await trigger(fieldsToValidate);
    if (isStepValid) {
      setCurrentStep(prev => prev + 1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = async (data) => {
    setIsSubmitting(true);
    try {
      // Map form fields to database schema, passing ALL data collected in the wizard
      const completeRawData = { ...data, documents: uploadedDocsRef.current };
      const employeeData = {
        email: data.officialEmail, // map officialEmail to email for adminService
        firstName: data.firstName,
        lastName: data.lastName,
        phone: data.phone,
        department: data.department,
        designation: data.designation,
        manager: data.manager,
        // Include the entire raw form data so the database trigger can map all 40+ fields
        raw_data: completeRawData
      };

      let error;
      if (isEditMode) {
        const res = await updateEmployee(id, employeeData);
        error = res.error;
      } else {
        const res = await createEmployee(employeeData);
        error = res.error;
      }

      if (error) {
        console.error('Error saving employee:', error);
        setSubmitError('Failed to save employee: ' + (error.message || 'Unknown error. Please try again.'));
      } else {
        localStorage.removeItem('employeeDraft');
        setSubmitError('');
        setShowSuccess(true);
        setTimeout(() => {
          navigate('/admin/employees');
        }, 2000);
      }
    } catch (err) {
      console.error(err);
      setSubmitError('An unexpected error occurred. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  if (isLoading) {
    return (
      <div style={{ padding: '60px 20px', textAlign: 'center', color: '#64748b' }}>
        <p style={{ fontSize: '16px', fontWeight: '500' }}>Loading employee details...</p>
      </div>
    );
  }

  const formData = getValues();

  return (
    <motion.div
      className="add-employee-container"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="wizard-header">
        <div>
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 4px 0' }}>
            {isEditMode ? 'Edit Employee' : 'Add New Employee'}
          </h1>
          <p style={{ color: 'var(--text-tertiary)', margin: 0, fontSize: '14px' }}>
            {isEditMode ? 'Update employee details' : 'Fill in employee details to create a new profile'}
          </p>
        </div>
        <div className="wizard-actions">
          <button className="btn-secondary" onClick={() => navigate('/admin/employees')}>Cancel</button>
          <button type="button" className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }} onClick={handleSaveDraft}>
            <Save size={16} /> Save Draft
          </button>
        </div>
      </div>

      {/* Draft Saved Banner */}
      {draftSaved && (
        <div style={{ background: '#d1fae5', border: '1px solid #6ee7b7', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', color: '#065f46', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
          <CheckCircle size={16} /> Draft saved successfully! You can resume later.
        </div>
      )}

      {/* Submit Error Banner */}
      {submitError && (
        <div style={{ background: '#fee2e2', border: '1px solid #fca5a5', borderRadius: '8px', padding: '12px 16px', marginBottom: '16px', color: '#991b1b', display: 'flex', alignItems: 'center', gap: '8px', fontSize: '14px' }}>
          ⚠️ {submitError}
        </div>
      )}

      {/* Step Indicator */}
      <div
        className="step-indicator"
        style={{ '--step-progress': `${((currentStep - 1) / (STEPS.length - 1)) * 100}%` }}
      >
        {STEPS.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;

          return (
            <div key={step} className={`step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
              <div className="step-circle">
                {isCompleted ? <CheckCircle size={18} /> : stepNumber}
              </div>
              <span className="step-label">{step}</span>
            </div>
          );
        })}
      </div>

      {/* Form Content */}
      <div className="form-card">
        <form onSubmit={handleSubmit(onSubmit)}>

          {/* STEP 1: Personal Info */}
          {currentStep === 1 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="form-grid">
                <div className="form-group">
                  <label htmlFor="firstName">First Name *</label>
                  <input id="firstName" type="text" className={`form-control ${errors.firstName ? 'error' : ''}`} placeholder="Enter first name" {...register('firstName', { required: 'First name is required' })} />
                  {errors.firstName && <span className="form-error">{errors.firstName.message}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="lastName">Last Name *</label>
                  <input id="lastName" type="text" className={`form-control ${errors.lastName ? 'error' : ''}`} placeholder="Enter last name" {...register('lastName', { required: 'Last name is required' })} />
                  {errors.lastName && <span className="form-error">{errors.lastName.message}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="email">Personal Email *</label>
                  <input id="email" type="email" className={`form-control ${errors.email ? 'error' : ''}`} placeholder="johndoe@gmail.com" {...register('personalEmail', { required: 'Email is required', pattern: /^\S+@\S+$/i })} />
                  {errors.personalEmail && <span className="form-error">{errors.personalEmail.message}</span>}
                  <span style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>📌 Personal email (Gmail/Outlook) — not used for login</span>
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone Number *</label>
                  <input id="phone" type="tel" className={`form-control ${errors.phone ? 'error' : ''}`} placeholder="+91 98765 43210" {...register('phone', { required: 'Phone is required', minLength: { value: 10, message: "Must be 10 digits" } })} />
                  {errors.phone && <span className="form-error">{errors.phone.message}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="dob">Date of Birth</label>
                  <input id="dob" type="date" className="form-control" {...register('dob', { required: 'DOB is required' })} />
                  {errors.dob && <span className="form-error">{errors.dob.message}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="gender">Gender</label>
                  <select 
                    id="gender"
                    className={`form-control ${errors.gender ? 'error' : ''}`}
                    {...register('gender')}
                  >
                    <option value="">Select Gender</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                  {errors.gender && <span className="form-error">{errors.gender.message}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Blood Group</label>
                  <input className="form-input" placeholder="e.g. O+" {...register('bloodGroup')} />
                </div>
                <div className="form-group">
                  <label htmlFor="maritalStatus">Marital Status</label>
                  <select 
                    id="maritalStatus"
                    className="form-control"
                    {...register('maritalStatus')}
                  >
                    <option value="">Select Status</option>
                    <option value="Single">Single</option>
                    <option value="Married">Married</option>
                  </select>
                </div>
              </div>
              <div className="form-group" style={{ marginTop: '24px' }}>
                <label className="form-label">Address</label>
                <input className="form-input" placeholder="Full address" {...register('address')} />
              </div>
              <div className="form-grid" style={{ marginTop: '24px' }}>
                <div className="form-group">
                  <label className="form-label">City</label>
                  <input className="form-input" {...register('city')} />
                </div>
                <div className="form-group">
                  <label className="form-label">State</label>
                  <input className="form-input" {...register('state')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Pincode</label>
                  <input className="form-input" {...register('pincode', { minLength: { value: 6, message: "6 digits required" } })} />
                  {errors.pincode && <span className="form-error">{errors.pincode.message}</span>}
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 2: Company Info */}
          {currentStep === 2 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Employee ID<span>*</span></label>
                  <input className="form-input" placeholder="e.g. EMP-021" {...register('empId', { required: 'Employee ID is required' })} />
                  {errors.empId && <span className="form-error">{errors.empId.message}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Official Email<span>*</span></label>
                  <input
                    type="email"
                    className="form-input"
                    placeholder="name@dropyhub.com"
                    {...register('officialEmail', {
                      required: 'Official email is required',
                      pattern: {
                        value: /^[^@]+@dropyhub\.com$/i,
                        message: 'Must be a @dropyhub.com email address'
                      }
                    })}
                  />
                  {errors.officialEmail && <span className="form-error">{errors.officialEmail.message}</span>}
                  <span style={{ fontSize: '12px', color: '#059669', marginTop: '2px', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '4px' }}>🔑 This is the login email — must be @dropyhub.com</span>
                </div>
                <div className="form-group">
                  <label htmlFor="department">Department<span>*</span></label>
                  <select 
                    id="department"
                    className={`form-control ${errors.department ? 'error' : ''}`}
                    {...register('department', { required: 'Department is required' })}
                  >
                    <option value="">Select Department</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="HR">HR</option>
                  </select>
                  {errors.department && <span className="form-error">{errors.department.message}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="designation">Designation<span>*</span></label>
                  <select 
                    id="designation"
                    className={`form-control ${errors.designation ? 'error' : ''}`}
                    {...register('designation', { required: 'Designation is required' })}
                  >
                    <option value="">Select Designation</option>
                    <option value="Software Engineer">Software Engineer</option>
                    <option value="Frontend Developer">Frontend Developer</option>
                    <option value="Marketing Manager">Marketing Manager</option>
                    <option value="HR Executive">HR Executive</option>
                  </select>
                  {errors.designation && <span className="form-error">{errors.designation.message}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="manager" className="form-label">Reporting Manager</label>
                  <select 
                    id="manager"
                    className="form-control"
                    {...register('manager')}
                  >
                    <option value="">Select Reporting Manager</option>
                    <option value="Test Admin">Test Admin (Admin)</option>
                    {managersList.map(m => (
                      <option key={m.id} value={`${m.firstName || ''} ${m.lastName || ''}`.trim()}>
                        {m.firstName} {m.lastName} ({m.designation || m.department || 'Employee'})
                      </option>
                    ))}
                  </select>
                </div>
                <div className="form-group">
                  <label className="form-label">Date of Joining<span>*</span></label>
                  <input type="date" className="form-input" {...register('joinDate', { required: 'Date of joining is required' })} />
                  {errors.joinDate && <span className="form-error">{errors.joinDate.message}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="employmentType">Employment Type<span>*</span></label>
                  <select 
                    id="employmentType"
                    className={`form-control ${errors.employmentType ? 'error' : ''}`}
                    {...register('employmentType', { required: 'Type is required' })}
                  >
                    <option value="">Select Type</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Intern">Intern</option>
                  </select>
                  {errors.employmentType && <span className="form-error">{errors.employmentType.message}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="workLocation">Work Location<span>*</span></label>
                  <select 
                    id="workLocation"
                    className={`form-control ${errors.workLocation ? 'error' : ''}`}
                    {...register('workLocation', { required: 'Location is required' })}
                  >
                    <option value="">Select Location</option>
                    <option value="Hyderabad">Hyderabad</option>
                  </select>
                  {errors.workLocation && <span className="form-error">{errors.workLocation.message}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="shift">Shift<span>*</span></label>
                  <select 
                    id="shift"
                    className={`form-control ${errors.shift ? 'error' : ''}`}
                    {...register('shift', { required: 'Shift is required' })}
                  >
                    <option value="">Select Shift</option>
                    <option value="General">9:30 AM - 6:30 PM</option>
                  </select>
                  {errors.shift && <span className="form-error">{errors.shift.message}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="leaveBalance">Initial Leave Balance</label>
                  <input 
                    type="number" 
                    id="leaveBalance" 
                    className="form-input" 
                    placeholder="e.g. 12" 
                    {...register('leaveBalance', { valueAsNumber: true })} 
                  />
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 3: Bank Details */}
          {currentStep === 3 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Bank Name</label>
                  <input className="form-input" {...register('bankName')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Account Number</label>
                  <input className="form-input" {...register('accountNumber')} />
                </div>
                <div className="form-group">
                  <label className="form-label">IFSC Code</label>
                  <input 
                    className="form-input" 
                    maxLength={11}
                    placeholder="e.g. HDFC0001234"
                    style={{ textTransform: 'uppercase' }}
                    {...register('ifscCode', {
                      onChange: handleIfscChange
                    })} 
                  />
                  {ifscLoading && <span style={{ fontSize: '12px', color: '#3b82f6', marginTop: '4px', display: 'block' }}>Fetching bank details...</span>}
                  {ifscError && <span className="form-error">{ifscError}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Account Holder Name</label>
                  <input className="form-input" {...register('accountHolder')} />
                </div>
                <div className="form-group">
                  <label className="form-label">PAN Number</label>
                  <input className="form-input" {...register('panNumber')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Aadhar Number</label>
                  <input
                    className="form-input"
                    placeholder="1234-5678-9012"
                    maxLength={14}
                    {...register('aadharNumber')}
                    onChange={(e) => {
                      // Strip non-digits, limit to 12 digits, insert dash after every 4
                      const raw = e.target.value.replace(/\D/g, '').slice(0, 12);
                      const formatted = raw.replace(/(\d{4})(?=\d)/g, '$1-');
                      e.target.value = formatted;
                    }}
                  />
                  <span style={{ fontSize: '12px', color: '#6b7280', marginTop: '2px' }}>Format: XXXX-XXXX-XXXX</span>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Documents */}
          {currentStep === 4 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="form-grid full">
                <div className="form-group">
                  <label className="form-label">Profile Photo</label>
                  <div className="upload-area">
                    <UploadCloud size={24} className="upload-icon" />
                    <p style={{ margin: '0', fontSize: '14px', color: 'var(--text-secondary)', fontWeight: '500' }}>Click to upload or drag and drop</p>
                    <p style={{ margin: '4px 0 0', fontSize: '12px', color: 'var(--text-tertiary)' }}>SVG, PNG, JPG or GIF (max. 800x400px)</p>
                  </div>
                </div>

                <div className="form-grid">
                  <div className="form-group">
                    <label className="form-label">Aadhar Card</label>
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="form-input" onChange={(e) => handleFileUpload(e, 'Aadhar Card')} />
                    {uploadedDocs.find(d => d.type === 'Aadhar Card') && <span style={{fontSize: '12px', color: '#10b981', marginTop: '4px', display: 'block'}}>✓ {uploadedDocs.find(d => d.type === 'Aadhar Card').name}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">PAN Card</label>
                    <input type="file" accept=".pdf,.jpg,.jpeg,.png" className="form-input" onChange={(e) => handleFileUpload(e, 'PAN Card')} />
                    {uploadedDocs.find(d => d.type === 'PAN Card') && <span style={{fontSize: '12px', color: '#10b981', marginTop: '4px', display: 'block'}}>✓ {uploadedDocs.find(d => d.type === 'PAN Card').name}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Resume</label>
                    <input type="file" accept=".pdf,.doc,.docx" className="form-input" onChange={(e) => handleFileUpload(e, 'Resume')} />
                    {uploadedDocs.find(d => d.type === 'Resume') && <span style={{fontSize: '12px', color: '#10b981', marginTop: '4px', display: 'block'}}>✓ {uploadedDocs.find(d => d.type === 'Resume').name}</span>}
                  </div>
                  <div className="form-group">
                    <label className="form-label">Offer Letter</label>
                    <input type="file" accept=".pdf,.doc,.docx" className="form-input" onChange={(e) => handleFileUpload(e, 'Offer Letter')} />
                    {uploadedDocs.find(d => d.type === 'Offer Letter') && <span style={{fontSize: '12px', color: '#10b981', marginTop: '4px', display: 'block'}}>✓ {uploadedDocs.find(d => d.type === 'Offer Letter').name}</span>}
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 5: Review */}
          {currentStep === 5 && (
            <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }}>
              
              {/* Personal Information Card */}
              <div className="summary-section">
                <h3 className="summary-title">
                  <User size={18} style={{ color: '#2563eb' }} />
                  Personal Information
                </h3>
                <div className="summary-grid">
                  <div className="summary-item">
                    <span className="summary-label">Full Name</span>
                    <span className="summary-value">{formData.firstName} {formData.lastName}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Personal Email</span>
                    <span className="summary-value">{formData.personalEmail || '-'}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Phone Number</span>
                    <span className="summary-value">{formData.phone || '-'}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Date of Birth</span>
                    <span className="summary-value">{formData.dob || '-'}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Gender</span>
                    <span className="summary-value">{formData.gender || '-'}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Blood Group</span>
                    <span className="summary-value">{formData.bloodGroup || '-'}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Marital Status</span>
                    <span className="summary-value">{formData.maritalStatus || '-'}</span>
                  </div>
                  <div className="summary-item summary-full-row">
                    <span className="summary-label">Residential Address</span>
                    <span className="summary-value">
                      {[formData.address, formData.city, formData.state, formData.pincode].filter(Boolean).join(', ') || 'Not provided'}
                    </span>
                  </div>
                </div>
              </div>

              {/* Company Information Card */}
              <div className="summary-section">
                <h3 className="summary-title">
                  <Building2 size={18} style={{ color: '#2563eb' }} />
                  Company Information
                </h3>
                <div className="summary-grid">
                  <div className="summary-item">
                    <span className="summary-label">Employee ID</span>
                    <span className="summary-value" style={{ color: '#2563eb' }}>{formData.empId}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Official Email</span>
                    <span className="summary-value">{formData.officialEmail}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Department</span>
                    <span className="summary-value">{formData.department}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Designation</span>
                    <span className="summary-value">{formData.designation}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Reporting Manager</span>
                    <span className="summary-value">{getValues('manager') || formData.manager || 'Not Assigned'}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Date of Joining</span>
                    <span className="summary-value">{formData.joinDate || '-'}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Employment Type</span>
                    <span className="summary-value">{formData.employmentType || '-'}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Work Location</span>
                    <span className="summary-value">{getValues('workLocation') || '-'}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Shift</span>
                    <span className="summary-value">{getValues('shift') || '-'}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Initial Leave Balance</span>
                    <span className="summary-value">{getValues('leaveBalance') || '0'} days</span>
                  </div>
                </div>
              </div>

              {/* Bank Details Card */}
              <div className="summary-section">
                <h3 className="summary-title">
                  <CreditCard size={18} style={{ color: '#2563eb' }} />
                  Bank & Statutory Details
                </h3>
                <div className="summary-grid">
                  <div className="summary-item">
                    <span className="summary-label">Bank Name</span>
                    <span className="summary-value">{formData.bankName || '-'}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Account Number</span>
                    <span className="summary-value">{formData.accountNumber || '-'}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">IFSC Code</span>
                    <span className="summary-value">{formData.ifscCode || '-'}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Account Holder Name</span>
                    <span className="summary-value">{formData.accountHolder || '-'}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">PAN Number</span>
                    <span className="summary-value" style={{ letterSpacing: '0.03em' }}>{formData.panNumber || '-'}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Aadhar Number</span>
                    <span className="summary-value" style={{ letterSpacing: '0.03em' }}>{formData.aadharNumber || '-'}</span>
                  </div>
                </div>
              </div>

              {/* Uploaded Documents Card */}
              <div className="summary-section">
                <h3 className="summary-title">
                  <FileText size={18} style={{ color: '#2563eb' }} />
                  Uploaded Documents ({uploadedDocs.length})
                </h3>
                {uploadedDocs.length > 0 ? (
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(220px, 1fr))', gap: '12px' }}>
                    {uploadedDocs.map((doc, idx) => (
                      <div key={idx} style={{ padding: '10px 14px', background: '#fff', borderRadius: '8px', border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', gap: '10px' }}>
                        <FileText size={18} color="#2563eb" />
                        <div style={{ overflow: 'hidden' }}>
                          <div style={{ fontSize: '13px', fontWeight: '600', color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.type}</div>
                          <div style={{ fontSize: '11px', color: '#64748b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{doc.name}</div>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <p style={{ margin: 0, fontSize: '13px', color: '#94a3b8' }}>No documents uploaded.</p>
                )}
              </div>

            </motion.div>
          )}

          {/* Navigation Buttons */}
          <div className="form-navigation">
            <button
              type="button"
              className="btn-secondary"
              style={{ display: 'flex', alignItems: 'center', gap: '8px', opacity: currentStep === 1 ? 0 : 1, pointerEvents: currentStep === 1 ? 'none' : 'auto' }}
              onClick={handleBack}
            >
              <ArrowLeft size={16} /> Back
            </button>

            {currentStep < STEPS.length ? (
              <button
                type="button"
                style={{ display: 'flex', alignItems: 'center', gap: '8px', background: '#2563eb', color: 'var(--card-bg)', padding: '8px 24px', borderRadius: '8px', border: 'none', fontWeight: '500', cursor: 'pointer' }}
                onClick={handleNext}
              >
                Next Step <ArrowRight size={16} />
              </button>
            ) : (
              <button
                type="submit"
                disabled={isSubmitting}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', background: isSubmitting ? '#059669' : '#10b981', color: 'var(--card-bg)', padding: '8px 24px', borderRadius: '8px', border: 'none', fontWeight: '500', cursor: isSubmitting ? 'not-allowed' : 'pointer' }}
              >
                <CheckCircle size={16} /> {isSubmitting ? (isEditMode ? 'Employee Updated!' : 'Employee Created!') : (isEditMode ? 'Update Employee' : 'Create Employee')}
              </button>
            )}
          </div>

          {/* Success Popup */}
          {showSuccess && (
            <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: 'rgba(0,0,0,0.5)', zIndex: 9999 }}>
              <motion.div 
                initial={{ scale: 0.8, opacity: 0 }} 
                animate={{ scale: 1, opacity: 1 }} 
                style={{ background: 'white', padding: '32px', borderRadius: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', boxShadow: '0 10px 25px rgba(0,0,0,0.1)' }}
              >
                <div style={{ width: '64px', height: '64px', borderRadius: '50%', background: '#10b981', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '16px' }}>
                  <CheckCircle size={32} color="white" />
                </div>
                <h2 style={{ margin: '0 0 8px 0', color: '#111827' }}>Success!</h2>
                <p style={{ margin: 0, color: '#6b7280', textAlign: 'center' }}>Employee added successfully.<br/>Redirecting to directory...</p>
              </motion.div>
            </div>
          )}

        </form>
      </div>
    </motion.div>
  );
};

export default AddEmployee;
