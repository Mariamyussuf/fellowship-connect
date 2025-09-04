import React, { useState, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import { db, storage } from '../firebase/config';
import { useAuth } from '../context/AuthContext';
import MainLayout from '../layouts/MainLayout';
import { memberSchema, type MemberFormData } from '../utils/validationSchemas';

const ProfilePage: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    userProfile?.photoURL || null
  );
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors },
    reset
  } = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema)
  });
  
  // Load user data
  useEffect(() => {
    const fetchProfile = async () => {
      if (!currentUser) return;
      
      try {
        setLoading(true);
        const docRef = doc(db, 'users', currentUser.uid);
        const docSnap = await getDoc(docRef);
        
        if (docSnap.exists()) {
          const profileData = docSnap.data();
          setImagePreview(profileData.photoURL || null);
          
          // Reset form with profile data
          reset({
            fullName: profileData.fullName || '',
            age: profileData.age || undefined,
            birthday: profileData.birthday || '',
            department: profileData.department || '',
            phoneNumber: profileData.phoneNumber || '',
            email: profileData.email || currentUser.email || '',
            academicYear: profileData.academicYear || ''
          });
        }
      } catch (err) {
        console.error('Error fetching profile:', err);
        setError('Failed to load profile data');
      } finally {
        setLoading(false);
      }
    };
    
    fetchProfile();
  }, [currentUser, reset]);
  
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
    if (!currentUser) {
      setError('You must be logged in to update your profile.');
      return;
    }
    
    try {
      setUpdating(true);
      setError(null);
      setSuccess(null);
      
      let photoURL = userProfile?.photoURL || null;
      
      // Upload profile image if provided
      if (profileImageFile) {
        const storageRef = ref(storage, `profilePhotos/${currentUser.uid}/${profileImageFile.name}`);
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
      const userRef = doc(db, 'users', currentUser.uid);
      await updateDoc(userRef, {
        fullName: data.fullName,
        age: data.age,
        birthday: data.birthday,
        department: data.department,
        phoneNumber: data.phoneNumber,
        academicYear: data.academicYear,
        photoURL,
        profileCompleted: true,
        updatedAt: new Date().toISOString()
      });
      
      setSuccess('Profile updated successfully');
      
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setUpdating(false);
    }
  };
  
  if (!currentUser) {
    return <MainLayout><div>Please log in to view your profile.</div></MainLayout>;
  }
  
  if (loading) {
    return <MainLayout><div>Loading profile data...</div></MainLayout>;
  }
  
  return (
    <MainLayout>
      <div className="profile-container">
        <h1>My Profile</h1>
        
        {error && <div className="error-message">{error}</div>}
        {success && <div className="success-message">{success}</div>}
        
        <div className="profile-card">
          <form onSubmit={handleSubmit(onSubmit)} className="profile-form">
            <div className="profile-header">
              <div className="profile-image-section">
                <div className="profile-image-container">
                  {imagePreview ? (
                    <img src={imagePreview} alt="Profile preview" className="profile-image-preview" />
                  ) : (
                    <div className="profile-image-placeholder">
                      <span>Add Photo</span>
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
              
              <div className="profile-role">
                <span className={`role-badge role-${userProfile?.role || 'member'}`}>
                  {userProfile?.role || 'Member'}
                </span>
              </div>
            </div>
            
            <div className="form-grid">
              <div className="form-group">
                <label htmlFor="fullName">Full Name*</label>
                <input
                  type="text"
                  id="fullName"
                  placeholder="Enter your full name"
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
                  placeholder="Your email address"
                  {...register('email')}
                  readOnly={!!currentUser?.email}
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
                  placeholder="Your phone number"
                  {...register('phoneNumber')}
                />
                {errors.phoneNumber && (
                  <span className="error">{errors.phoneNumber.message}</span>
                )}
              </div>
              
              <div className="form-group">
                <label htmlFor="department">Department/Major*</label>
                <input
                  type="text"
                  id="department"
                  placeholder="Your department or major"
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
                  placeholder="Your age"
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
            
            <div className="form-footer">
              <button 
                type="submit" 
                className="btn-primary" 
                disabled={updating}
              >
                {updating ? 'Saving...' : 'Update Profile'}
              </button>
            </div>
          </form>
        </div>
      </div>
    </MainLayout>
  );
};

export default ProfilePage;