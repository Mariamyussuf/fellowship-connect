import React, { useState } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';
import MainLayout from '../../layouts/MainLayout';
import { storage } from '../../lib/firebase';
import { updateDocument } from '../../firebase/firestore';
import { memberSchema, type MemberFormData } from '../../utils/validationSchemas';
import { ref, uploadBytesResumable, getDownloadURL } from 'firebase/storage';
import Image from 'next/image';

const MemberRegistrationForm: React.FC = () => {
  const { currentUser, userProfile } = useAuth();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [profileImageFile, setProfileImageFile] = useState<File | null>(null);
  const [imagePreview, setImagePreview] = useState<string | null>(
    userProfile?.photoURL || null
  );
  const router = useRouter();
  
  const { 
    register, 
    handleSubmit, 
    formState: { errors } 
  } = useForm<MemberFormData>({
    resolver: zodResolver(memberSchema),
    defaultValues: {
      fullName: userProfile?.fullName || '',
      age: userProfile?.age || undefined,
      birthday: userProfile?.birthday || '',
      department: userProfile?.department || '',
      phoneNumber: userProfile?.phoneNumber || '',
      email: userProfile?.email || currentUser?.email || '',
      academicYear: userProfile?.academicYear || '',
      major: userProfile?.major || '',
      yearOfStudy: userProfile?.yearOfStudy || undefined,
      expectedGraduation: userProfile?.expectedGraduation || '',
    }
  });
  
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
      setError('You must be logged in to complete registration.');
      return;
    }
    
    try {
      setLoading(true);
      setError(null);
      
      // Check if Firebase services are properly initialized
      if (!storage) {
        throw new Error('Firebase Storage is not initialized');
      }
      
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
      await updateDocument('users', currentUser.uid, {
        fullName: data.fullName,
        age: data.age,
        birthday: data.birthday,
        department: data.department,
        phoneNumber: data.phoneNumber,
        academicYear: data.academicYear,
        major: data.major,
        yearOfStudy: data.yearOfStudy,
        expectedGraduation: data.expectedGraduation,
        photoURL,
        profileCompleted: true,
        updatedAt: new Date().toISOString()
      });
      
      // Navigate to dashboard after successful registration
      router.push('/dashboard');
      
    } catch (err) {
      console.error('Error updating profile:', err);
      setError('Failed to update profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <MainLayout>
      <div className="form-container">
        <h1>Complete Your Profile</h1>
        <p className="form-description">
          Please provide your information to complete your fellowship membership.
        </p>
        
        {error && <div className="error-message">{error}</div>}
        
        <form onSubmit={handleSubmit(onSubmit)} className="registration-form">
          <div className="profile-image-section">
            <div className="profile-image-container">
              {imagePreview ? (
                <Image src={imagePreview} alt="Profile preview" width={100} height={100} className="profile-image-preview" />
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
              <p className="helper-text">Optional: Upload a profile photo</p>
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
              <label htmlFor="major">Major/Field of Study*</label>
              <input
                type="text"
                id="major"
                placeholder="Your major or field of study"
                {...register('major')}
              />
              {errors.major && (
                <span className="error">{errors.major.message}</span>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="yearOfStudy">Year of Study*</label>
              <select
                id="yearOfStudy"
                {...register('yearOfStudy')}
              >
                <option value="">Select your year</option>
                <option value="100 Level">100 Level</option>
                <option value="200 Level">200 Level</option>
                <option value="300 Level">300 Level</option>
                <option value="400 Level">400 Level</option>
                <option value="500 Level">500 Level</option>
                <option value="Masters">Masters</option>
                <option value="PhD">PhD</option>
              </select>
              {errors.yearOfStudy && (
                <span className="error">{errors.yearOfStudy.message}</span>
              )}
            </div>
            
            <div className="form-group">
              <label htmlFor="expectedGraduation">Expected Graduation Year*</label>
              <input
                type="text"
                id="expectedGraduation"
                placeholder="e.g., 2025"
                {...register('expectedGraduation')}
              />
              {errors.expectedGraduation && (
                <span className="error">{errors.expectedGraduation.message}</span>
              )}
            </div>
          </div>
          
          <div className="form-footer">
            <button 
              type="submit" 
              className="btn-primary" 
              disabled={loading}
            >
              {loading ? 'Saving...' : 'Complete Registration'}
            </button>
          </div>
        </form>
      </div>
    </MainLayout>
  );
};

export default MemberRegistrationForm;