import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { User, Mail, Phone, Shield, Edit, Save, X, Users, Building, TrendingUp, Eye } from 'lucide-react';
import api from '../services/api';

const AdminProfile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalProperties: 0,
    totalContacts: 0,
    activeUsers: 0
  });
  const [profileData, setProfileData] = useState({
    name: '',
    email: '',
    phone: '',
    bio: '',
    department: 'Administration'
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || '',
        email: user.email || '',
        phone: user.phone || '',
        
        bio: user.bio || '',
        department: user.department || 'Administration'
      });
      fetchAdminStats();
    }
  }, [user]);

  const fetchAdminStats = async () => {
    try {
      const response = await api.get('/admin/stats');
      setStats(response.data);
    } catch (error) {
      console.error('Error fetching admin stats:', error);
      // Handle error gracefully
      setStats({
        totalUsers: 0,
        totalProperties: 0,
        totalContacts: 0,
        activeUsers: 0
      });
    }
  };

  const handleInputChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // In a real app, you would update the profile via API
      // await api.put('/auth/profile', profileData);
      setIsEditing(false);
      alert('Profile updated successfully!');
    } catch (error) {
      console.error('Error updating profile:', error);
      alert('Error updating profile. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setProfileData({
      name: user.name || '',
      email: user.email || '',
      phone: user.phone || '',
      bio: user.bio || '',
      department: user.department || 'Administration'
    });
    setIsEditing(false);
  };

  if (user?.userType !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          {/* <h2 className="text-2xl font-bold text-gray-900 mb-4">Access Denied</h2> */}
          {/* <p className="text-gray-600">This page is only accessible to administrators</p> */}
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-white rounded-lg shadow-md p-6 mb-8">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <div className="w-20 h-20 bg-purple-100 rounded-full flex items-center justify-center mr-6">
                <Shield className="h-10 w-10 text-purple-600" />
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">{profileData.name}</h1>
                <p className="text-gray-600 text-lg">{profileData.department}</p>
                <p className="text-purple-600 font-medium">System Administrator</p>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
            >
              <Edit className="h-4 w-4 mr-2" />
              {isEditing ? 'Cancel' : 'Edit Profile'}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Users className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Users</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalUsers}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Building className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Properties</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalProperties}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <TrendingUp className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Contacts</p>
                <p className="text-2xl font-bold text-gray-900">{stats.totalContacts}</p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <Eye className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Active Properties</p>
                <p className="text-2xl font-bold text-gray-900">{stats.activeProperties}</p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">Profile Information</h2>
          
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="name"
                  value={profileData.name}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
              ) : (
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <User className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-900">{profileData.name}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email Address
              </label>
              <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                <Mail className="h-5 w-5 text-gray-400 mr-3" />
                <span className="text-gray-900">{profileData.email}</span>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Phone Number
              </label>
              {isEditing ? (
                <input
                  type="tel"
                  name="phone"
                  value={profileData.phone}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                />
              ) : (
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <Phone className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-900">{profileData.phone || 'Not provided'}</span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Department
              </label>
              {isEditing ? (
                <select
                  name="department"
                  value={profileData.department}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                >
                  <option value="Administration">Administration</option>
                  <option value="IT Support">IT Support</option>
                  <option value="Customer Service">Customer Service</option>
                  <option value="Operations">Operations</option>
                </select>
              ) : (
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <Shield className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-900">{profileData.department}</span>
                </div>
              )}
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Bio / About
              </label>
              {isEditing ? (
                <textarea
                  name="bio"
                  value={profileData.bio}
                  onChange={handleInputChange}
                  rows={4}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none"
                  placeholder="Tell us about your role and responsibilities..."
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-900">
                    {profileData.bio || 'System administrator responsible for managing the FlatFinder platform, ensuring smooth operations, and maintaining data integrity.'}
                  </span>
                </div>
              )}
            </div>
          </div>

          {isEditing && (
            <div className="flex justify-end space-x-4 mt-6 pt-6 border-t border-gray-200">
              <button
                onClick={handleCancel}
                className="flex items-center px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <X className="h-4 w-4 mr-2" />
                Cancel
              </button>
              <button
                onClick={handleSave}
                disabled={loading}
                className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors disabled:opacity-50"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Saving...' : 'Save Changes'}
              </button>
            </div>
          )}
        </div>

        {/* Admin Actions */}
        <div className="bg-white rounded-lg shadow-md p-6 mt-8">
          <h2 className="text-xl font-semibold text-gray-900 mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <Users className="h-6 w-6 text-blue-600 mb-2" />
              <h3 className="font-medium text-gray-900">Manage Users</h3>
              <p className="text-sm text-gray-600">View and manage all users</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <Building className="h-6 w-6 text-green-600 mb-2" />
              <h3 className="font-medium text-gray-900">Manage Properties</h3>
              <p className="text-sm text-gray-600">Oversee all property listings</p>
            </button>
            <button className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors text-left">
              <TrendingUp className="h-6 w-6 text-purple-600 mb-2" />
              <h3 className="font-medium text-gray-900">View Analytics</h3>
              <p className="text-sm text-gray-600">Platform usage statistics</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminProfile;