import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { collection, query, getDocs, doc, updateDoc, orderBy } from 'firebase/firestore';
import { db } from '../lib/firebase';
import { useAuth } from '../contexts/AuthContext';
import MainLayout from '../layouts/MainLayout';
import Image from 'next/image';
import type { FellowshipUser } from '../types';

interface ExtendedFellowshipUser extends FellowshipUser {
  id: string;
  createdAt?: string;
  updatedAt?: string;
  profileCompleted?: boolean;
}

const MemberManagement: React.FC = () => {
  const { isAdmin } = useAuth();
  const router = useRouter();
  const [members, setMembers] = useState<ExtendedFellowshipUser[]>([]);
  const [filteredMembers, setFilteredMembers] = useState<ExtendedFellowshipUser[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('all'); // all, active, inactive
  const [departmentFilter, setDepartmentFilter] = useState('all');
  const [academicYearFilter, setAcademicYearFilter] = useState('all');
  const [departments, setDepartments] = useState<string[]>([]);
  const [academicYears, setAcademicYears] = useState<string[]>([]);
  
  // Check if user is admin
  useEffect(() => {
    if (!isAdmin) {
      router.push('/dashboard');
    }
  }, [isAdmin, router]);
  
  // Fetch all members
  useEffect(() => {
    // Check if Firebase is properly initialized
    if (!db) {
      console.error('Firebase Firestore is not initialized');
      setError('Database connection error');
      setLoading(false);
      return;
    }
    
    const fetchMembers = async () => {
      try {
        setLoading(true);
        
        const q = query(
          collection(db, 'users'),
          orderBy('createdAt', 'desc')
        );
        
        const querySnapshot = await getDocs(q);
        const fetchedMembers: ExtendedFellowshipUser[] = [];
        const depts = new Set<string>();
        const years = new Set<string>();
        
        querySnapshot.forEach((doc) => {
          const memberData = doc.data() as ExtendedFellowshipUser;
          const member = {
            ...memberData,
            id: doc.id
          };
          
          fetchedMembers.push(member);
          
          // Collect unique departments and academic years for filters
          if (member.department) {
            depts.add(member.department);
          }
          if (member.academicYear) {
            years.add(member.academicYear);
          }
        });
        
        setMembers(fetchedMembers);
        setFilteredMembers(fetchedMembers);
        setDepartments(Array.from(depts).sort());
        setAcademicYears(Array.from(years).sort());
        
      } catch (err) {
        console.error('Error fetching members:', err);
        setError('Failed to load members. Please try again.');
      } finally {
        setLoading(false);
      }
    };
    
    fetchMembers();
  }, []);
  
  // Apply filters and search
  useEffect(() => {
    let result = [...members];
    
    // Apply status filter
    if (filter === 'active') {
      result = result.filter(member => member.active !== false);
    } else if (filter === 'inactive') {
      result = result.filter(member => member.active === false);
    }
    
    // Apply department filter
    if (departmentFilter !== 'all') {
      result = result.filter(member => member.department === departmentFilter);
    }
    
    // Apply academic year filter
    if (academicYearFilter !== 'all') {
      result = result.filter(member => member.academicYear === academicYearFilter);
    }
    
    // Apply search term
    if (searchTerm) {
      const search = searchTerm.toLowerCase();
      result = result.filter(member => 
        (member.fullName && member.fullName.toLowerCase().includes(search)) ||
        (member.email && member.email.toLowerCase().includes(search)) ||
        (member.phoneNumber && member.phoneNumber.includes(search)) ||
        (member.department && member.department.toLowerCase().includes(search))
      );
    }
    
    setFilteredMembers(result);
  }, [members, searchTerm, filter, departmentFilter, academicYearFilter]);
  
  // Toggle member active status
  const toggleMemberStatus = async (memberId: string, currentStatus: boolean | undefined) => {
    try {
      // Check if Firebase is properly initialized
      if (!db) {
        throw new Error('Firebase Firestore is not initialized');
      }
      
      const memberRef = doc(db, 'users', memberId);
      await updateDoc(memberRef, {
        active: currentStatus === false ? true : false,
        updatedAt: new Date().toISOString()
      });
      
      // Update local state
      setMembers(prevMembers => 
        prevMembers.map(member => 
          member.id === memberId 
            ? { ...member, active: currentStatus === false ? true : false } 
            : member
        )
      );
      
    } catch (err) {
      console.error('Error updating member status:', err);
      setError('Failed to update member status.');
    }
  };
  
  // Export member data to CSV
  const exportMemberData = () => {
    // Create CSV header
    const headers = [
      'Full Name', 
      'Email', 
      'Phone Number', 
      'Department', 
      'Academic Year', 
      'Age', 
      'Birthday', 
      'Status'
    ].join(',');
    
    // Create CSV rows
    const rows = filteredMembers.map(member => [
      member.fullName || '',
      member.email || '',
      member.phoneNumber || '',
      member.department || '',
      member.academicYear || '',
      member.age || '',
      member.birthday || '',
      member.active === false ? 'Inactive' : 'Active'
    ].map(value => `"${value}"`).join(','));
    
    // Combine header and rows
    const csvContent = [headers, ...rows].join('\n');
    
    // Create blob and download link
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `fellowship_members_${new Date().toISOString().split('T')[0]}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };
  
  if (loading) {
    return <MainLayout><div>Loading member data...</div></MainLayout>;
  }
  
  return (
    <MainLayout>
      <div className="member-management">
        <div className="page-header">
          <h1>Member Management</h1>
          <div className="header-actions">
            <button 
              className="btn-primary" 
              onClick={exportMemberData}
            >
              Export Members
            </button>
          </div>
        </div>
        
        {error && <div className="error-message">{error}</div>}
        
        <div className="filters-container">
          <div className="search-container">
            <input
              type="text"
              placeholder="Search members..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>
          
          <div className="filter-controls">
            <div className="filter-group">
              <label htmlFor="statusFilter">Status:</label>
              <select 
                id="statusFilter"
                value={filter}
                onChange={(e) => setFilter(e.target.value)}
              >
                <option value="all">All</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
              </select>
            </div>
            
            <div className="filter-group">
              <label htmlFor="departmentFilter">Department:</label>
              <select 
                id="departmentFilter"
                value={departmentFilter}
                onChange={(e) => setDepartmentFilter(e.target.value)}
              >
                <option value="all">All Departments</option>
                {departments.map(dept => (
                  <option key={dept} value={dept}>{dept}</option>
                ))}
              </select>
            </div>
            
            <div className="filter-group">
              <label htmlFor="academicYearFilter">Academic Year:</label>
              <select 
                id="academicYearFilter"
                value={academicYearFilter}
                onChange={(e) => setAcademicYearFilter(e.target.value)}
              >
                <option value="all">All Years</option>
                {academicYears.map(year => (
                  <option key={year} value={year}>{year}</option>
                ))}
              </select>
            </div>
          </div>
        </div>
        
        <div className="results-summary">
          Showing {filteredMembers.length} of {members.length} members
        </div>
        
        <div className="members-table-container">
          <table className="members-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Phone</th>
                <th>Department</th>
                <th>Year</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredMembers.length > 0 ? (
                filteredMembers.map((member) => (
                  <tr key={member.id} className={member.active === false ? 'inactive-member' : ''}>
                    <td className="member-name">
                      {member.photoURL && (
                        <div className="member-avatar">
                          <Image src={member.photoURL} alt={member.fullName || 'Member'} width={40} height={40} />
                        </div>
                      )}
                      {member.fullName || 'Unnamed Member'}
                    </td>
                    <td>{member.email}</td>
                    <td>{member.phoneNumber || 'N/A'}</td>
                    <td>{member.department || 'N/A'}</td>
                    <td>{member.academicYear || 'N/A'}</td>
                    <td>
                      <span className={`role-badge role-${member.role}`}>
                        {member.role}
                      </span>
                    </td>
                    <td>
                      <span className={`status-badge status-${member.active === false ? 'inactive' : 'active'}`}>
                        {member.active === false ? 'Inactive' : 'Active'}
                      </span>
                    </td>
                    <td className="actions-cell">
                      <button 
                        className="btn-icon"
                        onClick={() => router.push(`/admin/members/edit/${member.id}`)}
                      >
                        Edit
                      </button>
                      <button 
                        className={`btn-icon ${member.active === false ? 'activate' : 'deactivate'}`}
                        onClick={() => toggleMemberStatus(member.id, member.active)}
                      >
                        {member.active === false ? 'Activate' : 'Deactivate'}
                      </button>
                    </td>
                  </tr>
                ))
              ) : (
                <tr>
                  <td colSpan={8} className="no-results">
                    No members found matching the criteria.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </MainLayout>
  );
};

export default MemberManagement;