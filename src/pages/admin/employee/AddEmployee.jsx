import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useForm } from 'react-hook-form';
import { UploadCloud, ArrowLeft, ArrowRight, Save, CheckCircle } from 'lucide-react';
import '../../../styles/admin/employee/add-employee.css';
import CustomDropdown from '../../../components/admin/CustomDropdown';

const STEPS = [
  'Personal Info',
  'Company Info',
  'Bank Details',
  'Emergency',
  'Documents',
  'Review'
];

const AddEmployee = () => {
  const navigate = useNavigate();
  const [currentStep, setCurrentStep] = useState(1);
  const { register, handleSubmit, formState: { errors }, trigger, getValues } = useForm();

  const handleNext = async () => {
    let fieldsToValidate = [];
    if (currentStep === 1) {
      fieldsToValidate = ['firstName', 'lastName', 'personalEmail', 'phone', 'dob', 'gender'];
    } else if (currentStep === 2) {
      fieldsToValidate = ['empId', 'officialEmail', 'department', 'designation', 'joinDate', 'employmentType', 'workLocation', 'shift'];
    } else if (currentStep === 4) {
      fieldsToValidate = ['emergencyName', 'emergencyRelation', 'emergencyPhone'];
    }

    const isStepValid = await trigger(fieldsToValidate);
    if (isStepValid) {
      setCurrentStep(prev => prev + 1);
    }
  };

  const handleBack = () => {
    setCurrentStep(prev => prev - 1);
  };

  const [isSubmitting, setIsSubmitting] = useState(false);

  const onSubmit = (data) => {
    setIsSubmitting(true);
    console.log("Form Submitted Data:", data);
    // Simulate API call and show success
    setTimeout(() => {
      navigate('/admin/employees');
    }, 1500);
  };

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
          <h1 style={{ fontSize: '24px', fontWeight: '700', color: 'var(--text-primary)', margin: '0 0 4px 0' }}>Add New Employee</h1>
          <p style={{ color: 'var(--text-tertiary)', margin: 0, fontSize: '14px' }}>Fill in employee details to create a new profile</p>
        </div>
        <div className="wizard-actions">
          <button className="btn-secondary" onClick={() => navigate('/admin/employees')}>Cancel</button>
          <button className="btn-secondary" style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Save size={16} /> Save Draft
          </button>
        </div>
      </div>

      {/* Step Indicator */}
      <div className="step-indicator">
        {STEPS.map((step, index) => {
          const stepNumber = index + 1;
          const isActive = stepNumber === currentStep;
          const isCompleted = stepNumber < currentStep;

          return (
            <div key={step} className={`step-item ${isActive ? 'active' : ''} ${isCompleted ? 'completed' : ''}`}>
              <div className="step-circle">
                {isCompleted ? <CheckCircle size={16} /> : stepNumber}
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
                  <label htmlFor="email">Email Address *</label>
                  <input id="email" type="email" className={`form-control ${errors.email ? 'error' : ''}`} placeholder="work@company.com" {...register('personalEmail', { required: 'Email is required', pattern: /^\S+@\S+$/i })} />
                  {errors.personalEmail && <span className="form-error">{errors.personalEmail.message}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="phone">Phone Number *</label>
                  <input id="phone" type="tel" className={`form-control ${errors.phone ? 'error' : ''}`} placeholder="+91 98765 43210" {...register('phone', { required: 'Phone is required', minLength: {value: 10, message: "Must be 10 digits"} })} />
                  {errors.phone && <span className="form-error">{errors.phone.message}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="dob">Date of Birth</label>
                  <input id="dob" type="date" className="form-control" {...register('dob', { required: 'DOB is required' })} />
                  {errors.dob && <span className="form-error">{errors.dob.message}</span>}
                </div>
                <div className="form-group">
                  <label htmlFor="gender">Gender</label>
                  <div style={{ width: '180px' }}>
          <CustomDropdown
            value=""
            onChange={() => {}}
            options={[
              { value: '', label: 'Select Gender' },
              { value: 'Male', label: 'Male' },
              { value: 'Female', label: 'Female' },
              { value: 'Other', label: 'Other' }
            ]}
            fullWidth
          />
        </div>
                  {errors.gender && <span className="form-error">{errors.gender.message}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Blood Group</label>
                  <input className="form-input" placeholder="e.g. O+" {...register('bloodGroup')} />
                </div>
                <div className="form-group">
                  <label className="form-label">Marital Status</label>
                  <div style={{ width: '180px' }}>
          <CustomDropdown
            value=""
            onChange={() => {}}
            options={[
              { value: '', label: 'Select Status' },
              { value: 'Single', label: 'Single' },
              { value: 'Married', label: 'Married' }
            ]}
            fullWidth
          />
        </div>
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
                  <input className="form-input" {...register('pincode', { minLength: {value: 6, message: "6 digits required"} })} />
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
                  <input type="email" className="form-input" placeholder="name@dropyhub.com" {...register('officialEmail', { required: 'Official email is required' })} />
                  {errors.officialEmail && <span className="form-error">{errors.officialEmail.message}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Department<span>*</span></label>
                  <div style={{ width: '180px' }}>
          <CustomDropdown
            value=""
            onChange={() => {}}
            options={[
              { value: '', label: 'Select Department' },
              { value: 'Engineering', label: 'Engineering' },
              { value: 'Marketing', label: 'Marketing' },
              { value: 'Sales', label: 'Sales' },
              { value: 'HR', label: 'HR' }
            ]}
            fullWidth
          />
        </div>
                  {errors.department && <span className="form-error">{errors.department.message}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Designation<span>*</span></label>
                  <div style={{ width: '180px' }}>
          <CustomDropdown
            value=""
            onChange={() => {}}
            options={[
              { value: '', label: 'Select Designation' },
              { value: 'Software Engineer', label: 'Software Engineer' },
              { value: 'Frontend Developer', label: 'Frontend Developer' },
              { value: 'Marketing Manager', label: 'Marketing Manager' },
              { value: 'HR Executive', label: 'HR Executive' }
            ]}
            fullWidth
          />
        </div>
                  {errors.designation && <span className="form-error">{errors.designation.message}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Date of Joining<span>*</span></label>
                  <input type="date" className="form-input" {...register('joinDate', { required: 'Date of joining is required' })} />
                  {errors.joinDate && <span className="form-error">{errors.joinDate.message}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Employment Type<span>*</span></label>
                  <div style={{ width: '180px' }}>
          <CustomDropdown
            value=""
            onChange={() => {}}
            options={[
              { value: '', label: 'Select Type' },
              { value: 'Full-time', label: 'Full-time' },
              { value: 'Part-time', label: 'Part-time' },
              { value: 'Contract', label: 'Contract' },
              { value: 'Intern', label: 'Intern' }
            ]}
            fullWidth
          />
        </div>
                  {errors.employmentType && <span className="form-error">{errors.employmentType.message}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Work Location<span>*</span></label>
                  <div style={{ width: '180px' }}>
          <CustomDropdown
            value=""
            onChange={() => {}}
            options={[
              { value: '', label: 'Select Location' },
              { value: 'Bangalore HQ', label: 'Bangalore HQ' },
              { value: 'Mumbai Office', label: 'Mumbai Office' },
              { value: 'Remote', label: 'Remote' }
            ]}
            fullWidth
          />
        </div>
                  {errors.workLocation && <span className="form-error">{errors.workLocation.message}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Shift<span>*</span></label>
                  <div style={{ width: '180px' }}>
          <CustomDropdown
            value=""
            onChange={() => {}}
            options={[
              { value: '', label: 'Select Shift' },
              { value: 'Morning', label: 'Morning (9 AM - 6 PM)' },
              { value: 'Evening', label: 'Evening (2 PM - 11 PM)' },
              { value: 'Night', label: 'Night (8 PM - 5 AM)' }
            ]}
            fullWidth
          />
        </div>
                  {errors.shift && <span className="form-error">{errors.shift.message}</span>}
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
                  <input className="form-input" {...register('ifscCode')} />
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
                  <input className="form-input" {...register('aadharNumber')} />
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 4: Emergency Contact */}
          {currentStep === 4 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="form-grid">
                <div className="form-group">
                  <label className="form-label">Contact Name<span>*</span></label>
                  <input className="form-input" {...register('emergencyName', { required: 'Name is required' })} />
                  {errors.emergencyName && <span className="form-error">{errors.emergencyName.message}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Relationship<span>*</span></label>
                  <input className="form-input" placeholder="e.g. Father, Spouse" {...register('emergencyRelation', { required: 'Relation is required' })} />
                  {errors.emergencyRelation && <span className="form-error">{errors.emergencyRelation.message}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Phone Number<span>*</span></label>
                  <input className="form-input" {...register('emergencyPhone', { required: 'Phone is required' })} />
                  {errors.emergencyPhone && <span className="form-error">{errors.emergencyPhone.message}</span>}
                </div>
                <div className="form-group">
                  <label className="form-label">Alternate Phone</label>
                  <input className="form-input" {...register('emergencyAltPhone')} />
                </div>
              </div>
              <div className="form-group" style={{ marginTop: '24px' }}>
                <label className="form-label">Emergency Address</label>
                <input className="form-input" {...register('emergencyAddress')} />
              </div>
            </motion.div>
          )}

          {/* STEP 5: Documents */}
          {currentStep === 5 && (
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
                    <input type="file" className="form-input" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">PAN Card</label>
                    <input type="file" className="form-input" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Resume</label>
                    <input type="file" className="form-input" />
                  </div>
                  <div className="form-group">
                    <label className="form-label">Offer Letter</label>
                    <input type="file" className="form-input" />
                  </div>
                </div>
              </div>
            </motion.div>
          )}

          {/* STEP 6: Review */}
          {currentStep === 6 && (
            <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }}>
              <div className="summary-section">
                <h3 className="summary-title">Personal Information</h3>
                <div className="summary-grid">
                  <div className="summary-item">
                    <span className="summary-label">Name</span>
                    <span className="summary-value">{formData.firstName} {formData.lastName}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Email</span>
                    <span className="summary-value">{formData.personalEmail}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Phone</span>
                    <span className="summary-value">{formData.phone}</span>
                  </div>
                </div>
              </div>

              <div className="summary-section">
                <h3 className="summary-title">Company Information</h3>
                <div className="summary-grid">
                  <div className="summary-item">
                    <span className="summary-label">Employee ID</span>
                    <span className="summary-value">{formData.empId}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Department</span>
                    <span className="summary-value">{formData.department}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Designation</span>
                    <span className="summary-value">{formData.designation}</span>
                  </div>
                </div>
              </div>

              <div className="summary-section" style={{ borderBottom: 'none' }}>
                <h3 className="summary-title">Emergency Contact</h3>
                <div className="summary-grid">
                  <div className="summary-item">
                    <span className="summary-label">Contact Name</span>
                    <span className="summary-value">{formData.emergencyName}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Relationship</span>
                    <span className="summary-value">{formData.emergencyRelation}</span>
                  </div>
                  <div className="summary-item">
                    <span className="summary-label">Phone</span>
                    <span className="summary-value">{formData.emergencyPhone}</span>
                  </div>
                </div>
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
                <CheckCircle size={16} /> {isSubmitting ? 'Employee Created!' : 'Create Employee'}
              </button>
            )}
          </div>

        </form>
      </div>
    </motion.div>
  );
};

export default AddEmployee;
