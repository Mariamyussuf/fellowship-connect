import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import MainLayout from '../layouts/MainLayout';
import Image from 'next/image';
import { type FellowshipUser } from '../types';
import { memberSchema, type MemberFormData } from '../utils/validationSchemas';

const MemberEdit: React.FC<{ memberId: string }> = ({ memberId }) => {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const [member, setMember] = useState<FellowshipUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(null);
  const [roleValue, setRoleValue] = useState<string>('member');
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    reset
  } = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema)
  });
  
  // Check if user is admin
  useEffect(() => {
    if (!isAdmin) {
      router.push('/dashboard');
    }
  }, [isAdmin, router]);
  
  // Fetch member data
  useEffect(() => {
    // Check if Firebase is properly initialized
    if (!db) {
      console.error('Firebase Firestore is not initialized');
      setError('Database connection error');
      setLoading(false);
      return;
    }
    
    const fetchMember = async () => {
      try {
        setLoading(true);
        const docRef = doc(db, 'users', memberId);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const memberData = docSnap.data() as FellowshipUser;
          setMember(memberData);
          setRoleValue(memberData.role || 'member');
          setImagePreview(memberData.photoURL || null);
          
          // Reset form with member data
          reset({
            fullName: memberData.fullName || '',
            age: memberData.age || undefined,
            birthday: memberData.birthday || '',
            department: memberData.department || '',
            phoneNumber: memberData.phoneNumber || '',
            email: memberData.email || '',
            academicYear: memberData.academicYear || ''
          });
        } else {
          setError('Member not found');
          router.push('/admin/members');
        }
      } catch (err) {
        console.error('Error fetching member:', err);
        setError('Failed to load member data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMember();
  }, [memberId, router, reset]);
  
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      setProfileImageFile(file);
      
      // Create image preview
      const reader = new FileReader();
      reader.onload = () => {
        setImagePreview(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };
  
  const onSubmit = async (data: MemberFormData) => {
    try {
      setUpdating(true);
      setError(null);
      setSuccess(null);
      
      // Check if Firebase services are properly initialized
      if (!db || !storage) {
        throw new Error('Firebase services are not initialized');
      }
      
      let photoURL = member?.photoURL || null;
      
      // Upload profile image if provided
      if (profileImageFile) {
        const storageRef = ref(storage, `profilePhotos/${memberId}/${profileImageFile.name}`);
        const uploadTask = uploadBytesResumable(storageRef, profileImageFile);
        
        // Wait for upload to complete
        await new Promise<void>((resolve, reject) => {
          uploadTask.on(
            'state_changed',
            (_snapshot) => {
              // Progress monitoring could be added here
            },
            (error) => {
              reject(error);
            },
            async () => {
              try {
                photoURL = await getDownloadURL(uploadTask.snapshot.ref);
                resolve();
              } catch (error) {
                reject(error);
              }
            }
          );
        });
      }
      
      // Update user profile in Firestore
      const memberRef = doc(db, 'users', memberId);
      await updateDoc(memberRef, {
        fullName: data.fullName,
        age: data.age,
        birthday: data.birthday,
        department: data.department,
        phoneNumber: data.phoneNumber,
        academicYear: data.academicYear,
        role: roleValue,
        photoURL,
        updatedAt: new Date().toISOString()
      });
      
      setSuccess('Member updated successfully');
      
    } catch (err) {
      console.error('Error updating member:', err);
      setError('Failed to update member. Please try again.');
    } finally {
      setUpdating(false);
    }
  };
  
  if (loading) {
    return <MainLayout><div>Loading member data...</div></MainLayout>;
  }
  
  return (
    <MainLayout>
      <div className="member-edit-container">
        <div className="page-header">
          <h1>Edit Member</h1>
          <div className="header-actions">
            <button 
              className="btn-secondary" 
              onClick={() => router.push('/admin/members')}
            >
              Back to Members
            </button>
          </div>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <form onSubmit={handleSubmit(onSubmit)} className="member-edit-form">
          <div className="form-sections">
            <div className="form-section">
              <h2>Basic Information</h2>
              
              <div className="profile-image-section">
                <div className="profile-image-container">
                  {imagePreview ? (
                    <Image src={imagePreview} alt="Profile preview" width={100} height={100} className="profile-image-preview" />
                  ) : (
                    <div className="profile-image-placeholder">
                      <span>No Photo</span>
                    </div>
                  )}
                </div>
                <div className="profile-image-upload">
                  <label htmlFor="profilePhoto" className="btn-secondary">
                    {imagePreview ? 'Change Photo' : 'Upload Photo'}
                  </label>
                  <input
                    type="file"
                    id="profilePhoto"
                    accept="image/*"
                    onChange={handleImageChange}
                    style={{ display: 'none' }}
                  />
                </div>
              </div>
              
              <div className="form-group">
                <label htmlFor="fullName">Full Name*</label>
                <input
                  type="text"
                  id="fullName"
                  placeholder="Enter full name"
                  {...register('fullName')}
                />
                {errors.fullName && (
                  <span className="error">{errors.fullName.message}</span>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="email">Email Address*</label>
                <input
                  type="email"
                  id="email"
                  placeholder="Enter email address"
                  {...register('email')}
                />
                {errors.email && (
                  <span className="error">{errors.email.message}</span>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="phoneNumber">Phone Number*</label>
                <input
                  type="tel"
                  id="phoneNumber"
                  placeholder="Enter phone number"
                  {...register('phoneNumber')}
                />
                {errors.phoneNumber && (
                  <span className="error">{errors.phoneNumber.message}</span>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="role">Role</label>
                <select 
                  id="role"
                  value={roleValue}
                  onChange={(e) => setRoleValue(e.target.value)}
                >
                  <option value="member">Member</option>
                  <option value="admin">Admin</option>
                  <option value="superadmin">Super Admin</option>
                </select>
              </div>
            </div>
            
            <div className="form-section">
              <h2>Fellowship Information</h2>
              
              <div className="form-group">
                <label htmlFor="department">Department/Major*</label>
                <input
                  type="text"
                  id="department"
                  placeholder="Enter department or major"
                  {...register('department')}
                />
                {errors.department && (
                  <span className="error">{errors.department.message}</span>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="academicYear">Academic/Graduation Year*</label>
                <input
                  type="text"
                  id="academicYear"
                  placeholder="e.g., 2023-2024 or 2025"
                  {...register('academicYear')}
                />
                {errors.academicYear && (
                  <span className="error">{errors.academicYear.message}</span>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="age">Age*</label>
                <input
                  type="number"
                  id="age"
                  placeholder="Enter age"
                  {...register('age', { valueAsNumber: true })}
                />
                {errors.age && (
                  <span className="error">{errors.age.message}</span>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="birthday">Birthday*</label>
                <input
                  type="date"
                  id="birthday"
                  {...register('birthday')}
                />
                {errors.birthday && (
                  <span className="error">{errors.birthday.message}</span>
                )}
              </div>
            </div>
          </div>
          
          <div className="form-footer">
            <button 
              type="button" 
              className="btn-secondary" 
              onClick={() => router.push('/admin/members')}
              disabled={updating}
            >
              Cancel
            </button>
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={updating}
            >
              {updating ? 'Saving...' : 'Save Changes'}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default MemberEdit;