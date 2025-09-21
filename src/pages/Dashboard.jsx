import React, { useState, useEffect } from "react";
import { useAuth } from "../context/AuthContext";
import { useLocation } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  MapPin,
  GraduationCap,
  MessageCircle,
  Eye,
  Heart,
  Edit,
  Save,
  X,
  Bed,
  Bath,
  Home,
  Building,
  Clock,
  CheckCircle,
  Send,
  Reply,
} from "lucide-react";
import api from "../services/api";

const Dashboard = () => {
  const { user } = useAuth();
  const location = useLocation();
  const [activeTab, setActiveTab] = useState("profile");
  const [contacts, setContacts] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [favoriteProperties, setFavoriteProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isEditing, setIsEditing] = useState(false);
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [profileData, setProfileData] = useState({
    name: "",
    email: "",
    phone: "",
    university: "",
    bio: "",
    year: "",
    course: "",
  });

  useEffect(() => {
    // Check URL parameters for tab and edit mode
    const urlParams = new URLSearchParams(location.search);
    const tab = urlParams.get("tab");
    const edit = urlParams.get("edit");

    if (tab) {
      setActiveTab(tab);
    }
    if (edit === "true") {
      setIsEditing(true);
    }
  }, [location]);

  useEffect(() => {
    if (user?.userType === "student") {
      setProfileData({
        name: user?.name || "",
        email: user?.email || "",
        phone: user?.phone || "",
        university: user?.university || "",
        bio: user?.bio || "",
        year: user?.year || "",
        course: user?.course || "",
      });
      fetchStudentData();
    }
  }, [user]);

  const fetchStudentData = async () => {
    if (!user?.id) {
      setLoading(false);
      return;
    }

    try {
      const [contactsResponse] = await Promise.all([
        api.get("/contacts/student"),
      ]);

      setContacts(contactsResponse.data || []);
      loadFavorites();
    } catch (error) {
      console.error("Error fetching student data:", error);
      setContacts([]);
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = async () => {
    if (!user?.id) return;

    try {
      const savedFavorites = localStorage.getItem(`favorites_${user.id}`);
      if (savedFavorites) {
        const favoriteIds = JSON.parse(savedFavorites);
        if (Array.isArray(favoriteIds)) {
          setFavorites(favoriteIds);
        } else {
          setFavorites([]);
          localStorage.removeItem(`favorites_${user.id}`);
        }

        // Fetch favorite properties details
        if (Array.isArray(favoriteIds) && favoriteIds.length > 0) {
          const propertiesResponse = await api.get("/properties");
          const allProperties = propertiesResponse.data || [];
          const favoriteProps = allProperties.filter((prop) =>
            favoriteIds.includes(prop._id)
          );
          setFavoriteProperties(favoriteProps);
        } else {
          setFavoriteProperties([]);
        }
      } else {
        setFavorites([]);
        setFavoriteProperties([]);
      }
    } catch (error) {
      console.error("Error loading favorites:", error);
      setFavorites([]);
      setFavoriteProperties([]);
      // Clear corrupted data
      if (user?.id) {
        localStorage.removeItem(`favorites_${user.id}`);
      }
    }
  };

  const removeFavorite = (propertyId) => {
    if (!user?.id) return;

    console.log("Removing favorite:", propertyId);
    console.log("Current favorites:", favorites);

    const newFavorites = favorites.filter((id) => id !== propertyId);
    setFavorites(newFavorites);
    setFavoriteProperties(
      favoriteProperties.filter((prop) => prop._id !== propertyId)
    );

    try {
      localStorage.setItem(
        `favorites_${user.id}`,
        JSON.stringify(newFavorites)
      );
      console.log("Favorite removed successfully");
    } catch (error) {
      console.error("Error removing favorite:", error);
      alert("Error removing from favorites. Please try again.");
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
      name: user?.name || "",
      email: user?.email || "",
      phone: user?.phone || "",
      university: user?.university || "",
      bio: user?.bio || "",
      year: user?.year || "",
      course: user?.course || "",
    });
    setIsEditing(false);
  };

  const handleSendReply = async (contactId) => {
    if (!replyMessage.trim()) {
      alert("Please enter a reply message");
      return;
    }

    setSendingReply(true);
    try {
      console.log("Sending student reply to contact:", contactId);

      const response = await api.post(`/contacts/${contactId}/student-reply`, {
        message: replyMessage.trim(),
      });

      console.log("Student reply response:", response.data);

      // Update local state
      setContacts(
        contacts.map((contact) =>
          contact._id === contactId
            ? {
                ...contact,
                studentReply: replyMessage.trim(),
                studentRepliedAt: new Date(),
                conversation: [
                  ...(contact.conversation || []),
                  {
                    sender: "student",
                    message: replyMessage.trim(),
                    timestamp: new Date(),
                  },
                ],
              }
            : contact
        )
      );

      setReplyingTo(null);
      setReplyMessage("");
      alert("Reply sent successfully!");
    } catch (error) {
      console.error("Error sending reply:", error);
      alert("Error sending reply. Please try again.");
    } finally {
      setSendingReply(false);
    }
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Unknown date";
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return "Invalid date";
    return date.toLocaleDateString("en-IN", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return "Not provided";
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 10) {
      return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
    }
    return phone;
  };

  const handleCallBroker = (phone) => {
    if (!phone) {
      alert("Phone number not available");
      return;
    }
    // Create a clickable phone link that opens the phone dialer
    window.open(`tel:${phone}`, "_self");
  };

  const handleEmailBroker = (email, brokerName, propertyTitle) => {
    if (!email) {
      alert("Email address not available");
      return;
    }

    if (!user?.name) {
      alert("User information not available");
      return;
    }
    // Create mailto link that opens default email client
    const subject = `Follow-up on ${propertyTitle}`;
    const body = `Hi ${brokerName},

I wanted to follow up on our conversation about "${propertyTitle}".

Could you please provide more information about:
- Current availability
- Viewing schedule
- Move-in process
- Any additional requirements

Looking forward to hearing from you.

Best regards,
${user.name}
Phone: ${user?.phone || "Not provided"}`;

    // Create mailto URL and open default email client
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
    window.location.href = mailtoUrl;
  };

  const startReply = (contactId) => {
    setReplyingTo(contactId);
    setReplyMessage("");
  };

  const cancelReply = () => {
    setReplyingTo(null);
    setReplyMessage("");
  };

  // Early return if user is not loaded yet
  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading user data...</p>
        </div>
      </div>
    );
  }
  if (user?.userType !== "student") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {/* Access Denied */}
          </h2>
          <p className="text-gray-600">
            {/* This dashboard is only accessible to students */}
             Welcome  {user?.name}! Manage your profile and
            track your property inquiries
          </p>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            Student Dashboard
          </h1>
          <p className="text-gray-600">
            Welcome  {user?.name}! Manage your profile and
            track your property inquiries
          </p>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("profile")}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "profile"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Profile
            </button>
            <button
              onClick={() => setActiveTab("messages")}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "messages"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Messages ({contacts.length})
            </button>
            <button
              onClick={() => setActiveTab("favorites")}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "favorites"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Favorites ({favorites.length})
            </button>
          </nav>
        </div>

        {/* Profile Tab */}
        {activeTab === "profile" && (
          <div className="bg-white rounded-lg shadow-md p-6">
            <div className="flex justify-between items-center mb-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Profile Information
              </h2>
              <button
                onClick={() => setIsEditing(!isEditing)}
                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Edit className="h-4 w-4 mr-2" />
                {isEditing ? "Cancel" : "Edit Profile"}
              </button>
            </div>

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
                      {formatPhoneNumber(profileData.phone)}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  University
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="university"
                    value={profileData.university}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                ) : (
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <GraduationCap className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-900">
                      {profileData.university}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Course/Program
                </label>
                {isEditing ? (
                  <input
                    type="text"
                    name="course"
                    value={profileData.course}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="e.g., Computer Science, MBA"
                  />
                ) : (
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <Building className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-900">
                      {profileData.course || "Not specified"}
                    </span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Year of Study
                </label>
                {isEditing ? (
                  <select
                    name="year"
                    value={profileData.year}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="">Select Year</option>
                    <option value="1st Year">1st Year</option>
                    <option value="2nd Year">2nd Year</option>
                    <option value="3rd Year">3rd Year</option>
                    <option value="4th Year">4th Year</option>
                    <option value="Graduate">Graduate</option>
                    <option value="Post Graduate">Post Graduate</option>
                  </select>
                ) : (
                  <div className="flex items-center p-3 bg-gray-50 rounded-lg">
                    <GraduationCap className="h-5 w-5 text-gray-400 mr-3" />
                    <span className="text-gray-900">
                      {profileData.year || "Not specified"}
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
                    placeholder="Tell us about yourself, your interests, and what you're looking for in accommodation..."
                  />
                ) : (
                  <div className="p-3 bg-gray-50 rounded-lg">
                    <span className="text-gray-900">
                      {profileData.bio ||
                        "No bio provided yet. Click edit to add information about yourself."}
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
        )}

        {/* Messages Tab */}
        {activeTab === "messages" && (
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Your Messages
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Conversations with property brokers
              </p>
            </div>

            {contacts.length > 0 ? (
              <div className="divide-y divide-gray-200">
                {contacts.map((contact) => (
                  <div
                    key={contact._id}
                    className="p-6 hover:bg-gray-50 transition-colors"
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        {/* Broker Info */}
                        <div className="flex items-center mb-3">
                          <div className="w-10 h-10 bg-purple-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-purple-600 font-semibold">
                              {contact.broker?.name?.charAt(0)?.toUpperCase() ||
                                "B"}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {contact.broker?.name || "Unknown Broker"}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {contact.broker?.email || "No email provided"}
                                </p>
                              </div>
                              <div className="text-right">
                                <span
                                  className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                                    contact.status === "pending"
                                      ? "bg-yellow-100 text-yellow-800"
                                      : contact.status === "responded"
                                      ? "bg-green-100 text-green-800"
                                      : "bg-gray-100 text-gray-800"
                                  }`}
                                >
                                  {contact.status || "unknown"}
                                </span>
                                <div className="flex items-center text-xs text-gray-500 mt-1">
                                  <Clock className="h-3 w-3 mr-1" />
                                  {formatDate(contact.createdAt)}
                                </div>
                              </div>
                            </div>
                          </div>
                        </div>

                        {/* Property Info */}
                        <div className="bg-gray-50 rounded-lg p-4 mb-4">
                          <div className="flex items-center">
                            <Building className="h-4 w-4 text-gray-500 mr-2" />
                            <span className="text-sm font-medium text-gray-900">
                              Property:{" "}
                              {contact.property?.title || "Unknown Property"}
                            </span>
                          </div>
                        </div>

                        {/* Your Message */}
                        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                          <div className="flex items-start">
                            <MessageCircle className="h-5 w-5 text-blue-400 mr-2 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-blue-900 mb-1">
                                Your Message:
                              </p>
                              <p className="text-sm text-blue-800">
                                {contact.message || "No message content"}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Broker's Reply (if exists) */}
                        {contact.brokerReply && (
                          <div className="bg-green-50 border-l-4 border-green-400 p-4 mb-4">
                            <div className="flex items-start">
                              <Reply className="h-5 w-5 text-green-400 mr-2 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-green-900 mb-1">
                                  Broker's Reply:
                                </p>
                                <p className="text-sm text-green-800">
                                  {contact.brokerReply}
                                </p>
                                {contact.repliedAt && (
                                  <p className="text-xs text-green-600 mt-1">
                                    Replied on {formatDate(contact.repliedAt)}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Your Follow-up Reply (if exists) */}
                        {contact.studentReply && (
                          <div className="bg-purple-50 border-l-4 border-purple-400 p-4 mb-4">
                            <div className="flex items-start">
                              <CheckCircle className="h-5 w-5 text-purple-400 mr-2 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-purple-900 mb-1">
                                  Your Follow-up:
                                </p>
                                <p className="text-sm text-purple-800">
                                  {contact.studentReply}
                                </p>
                                {contact.studentRepliedAt && (
                                  <p className="text-xs text-purple-600 mt-1">
                                    Sent on{" "}
                                    {formatDate(contact.studentRepliedAt)}
                                  </p>
                                )}
                              </div>
                            </div>
                          </div>
                        )}

                        {/* Reply Form */}
                        {replyingTo === contact._id ? (
                          <div className="bg-gray-50 rounded-lg p-4 mb-4">
                            <h4 className="text-sm font-medium text-gray-900 mb-3">
                              Reply to {contact.broker?.name || "Broker"}
                            </h4>
                            <textarea
                              value={replyMessage}
                              onChange={(e) => setReplyMessage(e.target.value)}
                              rows={4}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                              placeholder={`Hi ${
                                contact.broker?.name || "there"
                              }, thank you for your response. I would like to know more about...`}
                            />
                            <div className="flex justify-end space-x-3 mt-3">
                              <button
                                onClick={cancelReply}
                                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                              >
                                <X className="h-4 w-4 mr-1 inline" />
                                Cancel
                              </button>
                              <button
                                onClick={() => handleSendReply(contact._id)}
                                disabled={sendingReply || !replyMessage.trim()}
                                className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                              >
                                <Send className="h-4 w-4 mr-2" />
                                {sendingReply ? "Sending..." : "Send Reply"}
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Contact Actions */
                          <div className="flex flex-wrap gap-3">
                            <button
                              onClick={() => startReply(contact._id)}
                              className="flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                            >
                              <Reply className="h-4 w-4 mr-2" />
                              Reply Message
                            </button>

                            <button
                              onClick={() =>
                                handleCallBroker(
                                  contact.brokerPhone || contact.broker?.phone
                                )
                              }
                              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                            >
                              <Phone className="h-4 w-4 mr-2" />
                              Call:{" "}
                              {formatPhoneNumber(
                                contact.brokerPhone || contact.broker?.phone
                              )}
                            </button>

                            <button
                              onClick={() =>
                                handleEmailBroker(
                                  contact.broker?.email,
                                  contact.broker?.name,
                                  contact.property?.title
                                )
                              }
                              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                            >
                              <Mail className="h-4 w-4 mr-2" />
                              Send Email
                            </button>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-12">
                <MessageCircle className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No messages yet
                </h3>
                <p className="text-gray-600 mb-6">
                  When you contact brokers about properties, your conversations
                  will appear here
                </p>
              </div>
            )}
          </div>
        )}

        {/* Favorites Tab */}
        {activeTab === "favorites" && (
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Your Favorite Properties
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Properties you've saved for later
              </p>
            </div>

            {favoriteProperties.length > 0 ? (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 p-6">
                {favoriteProperties.map((property) =>
                  property ? (
                    <div
                      key={property._id}
                      className="bg-white border border-gray-200 rounded-lg overflow-hidden hover:shadow-lg transition-shadow relative"
                    >
                      <button
                        onClick={() => removeFavorite(property._id)}
                        className="absolute top-3 right-3 z-10 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                      >
                        <Heart className="h-5 w-5 text-red-500 fill-current" />
                      </button>

                      <img
                        src={
                          property.images && property.images.length > 0
                            ? `http://localhost:5010${property.images[0]}`
                            : "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg"
                        }
                        alt={property.title || "Property image"}
                        className="w-full h-48 object-cover"
                      />
                      <div className="p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                          {property.title || "Untitled Property"}
                        </h3>
                        <div className="flex items-center text-gray-600 mb-2">
                          <MapPin className="h-4 w-4 mr-1" />
                          <span className="text-sm">
                            {property.address || "Address not available"}
                          </span>
                        </div>
                        <div className="flex items-center space-x-4 text-gray-600 mb-3">
                          <div className="flex items-center">
                            <Bed className="h-4 w-4 mr-1" />
                            <span className="text-sm">
                              {property.bedrooms || 0} Bed
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Bath className="h-4 w-4 mr-1" />
                            <span className="text-sm">
                              {property.bathrooms || 0} Bath
                            </span>
                          </div>
                          <div className="flex items-center">
                            <Home className="h-4 w-4 mr-1" />
                            <span className="text-sm">
                              {property.area || 0} sq ft
                            </span>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <div className="text-xl font-bold text-blue-600">
                            ₹{property.price?.toLocaleString() || "0"}
                            <span className="text-sm text-gray-500 font-normal">
                              /month
                            </span>
                          </div>
                          <a
                            href={`/flat/${property._id}`}
                            className="flex items-center px-3 py-1 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                          >
                            <Eye className="h-4 w-4 mr-1" />
                            View
                          </a>
                        </div>
                      </div>
                    </div>
                  ) : null
                )}
              </div>
            ) : (
              <div className="text-center py-12">
                <Heart className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No favorites yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Start browsing properties and click the heart icon to save
                  your favorites
                </p>
                <a
                  href="/flats"
                  className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Browse Properties
                </a>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;
