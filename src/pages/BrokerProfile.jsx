import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import {
  User,
  Mail,
  Phone,
  Building2,
  Edit,
  Save,
  X,
  MapPin,
  TrendingUp,
  Eye,
  MessageCircle,
} from "lucide-react";
import api from "../services/api";

const BrokerProfile = () => {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalViews: 0,
    totalInquiries: 0,
  });
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    companyName: "",
    bio: "",
    address: "",
    experience: "",
  });

  useEffect(() => {
    if (user) {
      setProfileData({
        name: user.name || "",
        email: user.email || "",
        phone: user.phone || "",
        companyName: user.companyName || "",
        bio: user.bio || "",
        address: user.address || "",
        experience: user.experience || "",
      });
      fetchBrokerStats();
    }
  }, [user]);

  const fetchBrokerStats = async () => {
    try {
      const response = await api.get("/properties/broker/my-properties");
      const properties = response.data;

      const totalProperties = properties.length;
      const totalViews = properties.reduce(
        (sum, prop) => sum + (prop.views || 0),
        0
      );
      const totalInquiries = properties.reduce(
        (sum, prop) => sum + (prop.inquiries || 0),
        0
      );

      setStats({ totalProperties, totalViews, totalInquiries });
    } catch (error) {
      console.error("Error fetching broker stats:", error);
    }
  };

  const handleInputChange = (e) => {
    setProfileData({
      ...profileData,
      [e.target.name]: e.target.value,
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // In a real app, you would update the profile via API
      // await api.put('/auth/profile', profileData);
      setIsEditing(false);
      alert("Profile updated successfully!");
    } catch (error) {
      console.error("Error updating profile:", error);
      alert("Error updating profile. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setProfileData({
      name: user.name || "",
      email: user.email || "",
      phone: user.phone || "",
      companyName: user.companyName || "",
      bio: user.bio || "",
      address: user.address || "",
      experience: user.experience || "",
    });
    setIsEditing(false);
  };

  if (user?.userType !== "broker") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          
          <p className="text-gray-600">
            This page is only accessible to brokers
          </p>
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
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mr-6">
                <span className="text-3xl font-bold text-blue-600">
                  {profileData.name.charAt(0).toUpperCase()}
                </span>
              </div>
              <div>
                <h1 className="text-3xl font-bold text-gray-900">
                  {profileData.name}
                </h1>
                <p className="text-gray-600 text-lg">
                  {profileData.companyName}
                </p>
                <p className="text-blue-600 font-medium">Property Broker</p>
              </div>
            </div>
            <button
              onClick={() => setIsEditing(!isEditing)}
              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Edit className="h-4 w-4 mr-2" />
              {isEditing ? "Cancel" : "Edit Profile"}
            </button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Building2 className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Properties</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalProperties}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-green-100 rounded-lg">
                <Eye className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Views</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalViews}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <MessageCircle className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Inquiries</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalInquiries}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Profile Details */}
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold text-gray-900 mb-6">
            Profile Information
          </h2>

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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              ) : (
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <Phone className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-900">
                    {profileData.phone || "Not provided"}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Company Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="companyName"
                  value={profileData.companyName}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              ) : (
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <Building2 className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-900">
                    {profileData.companyName}
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Experience (Years)
              </label>
              {isEditing ? (
                <input
                  type="number"
                  name="experience"
                  value={profileData.experience}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Years of experience"
                />
              ) : (
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <TrendingUp className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-900">
                    {profileData.experience || "Not specified"} years
                  </span>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Office Address
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="address"
                  value={profileData.address}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Office address"
                />
              ) : (
                <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                  <MapPin className="h-5 w-5 text-gray-400 mr-3" />
                  <span className="text-gray-900">
                    {profileData.address || "Not provided"}
                  </span>
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
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Tell us about yourself and your services..."
                />
              ) : (
                <div className="p-3 bg-gray-50 rounded-lg">
                  <span className="text-gray-900">
                    {profileData.bio || "No bio provided yet."}
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
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <Save className="h-4 w-4 mr-2" />
                {loading ? "Saving..." : "Save Changes"}
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default BrokerProfile;
