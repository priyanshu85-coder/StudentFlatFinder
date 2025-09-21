import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Plus,
  Eye,
  Edit,
  Trash2,
  Building,
  TrendingUp,
  Users,
  DollarSign,
  MessageCircle,
  Phone,
  Mail,
  Clock,
  CheckCircle,
  Send,
  Reply,
  X,
} from "lucide-react";
import api from "../services/api";

const BrokerDashboard = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [contacts, setContacts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState("properties");
  const [replyingTo, setReplyingTo] = useState(null);
  const [replyMessage, setReplyMessage] = useState("");
  const [sendingReply, setSendingReply] = useState(false);
  const [stats, setStats] = useState({
    totalProperties: 0,
    totalViews: 0,
    totalInquiries: 0,
    monthlyRevenue: 0,
  });

  useEffect(() => {
    if (user && user.userType === "broker") {
      fetchBrokerData();
    }
  }, [user]);

  const fetchBrokerData = async () => {
    try {
      const [propertiesResponse, contactsResponse] = await Promise.all([
        api.get("/properties/broker/my-properties"),
        api.get("/contacts/broker"),
      ]);

      setProperties(propertiesResponse.data);
      setContacts(contactsResponse.data);

      // Calculate stats
      const totalProperties = propertiesResponse.data.length;
      const totalViews = propertiesResponse.data.reduce(
        (sum, prop) => sum + (prop.views || 0),
        0
      );
      const totalInquiries = contactsResponse.data.length;
      const monthlyRevenue = propertiesResponse.data.reduce(
        (sum, prop) => sum + prop.price * 0.1,
        0
      ); // 10% commission

      setStats({
        totalProperties,
        totalViews,
        totalInquiries,
        monthlyRevenue,
      });
    } catch (error) {
      console.error("Error fetching broker data:", error);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    if (window.confirm("Are you sure you want to delete this property?")) {
      try {
        await api.delete(`/properties/${propertyId}`);
        setProperties(properties.filter((prop) => prop._id !== propertyId));
        alert("Property deleted successfully!");
        // Recalculate stats after deletion
        fetchBrokerData();
      } catch (error) {
        console.error("Error deleting property:", error);
        alert("Error deleting property. Please try again.");
      }
    }
  };

  const handleSendReply = async (contactId) => {
    if (!replyMessage.trim()) {
      alert("Please enter a reply message");
      return;
    }

    setSendingReply(true);
    try {
      console.log("Sending broker reply to contact:", contactId);

      // Send reply via API
      const response = await api.post(`/contacts/${contactId}/reply`, {
        message: replyMessage.trim(),
      });

      console.log("Broker reply response:", response.data);

      // Update local state with the reply
      setContacts(
        contacts.map((contact) =>
          contact._id === contactId
            ? {
                ...contact,
                status: "responded",
                brokerReply: replyMessage.trim(),
                repliedAt: new Date(),
                conversation: [
                  ...(contact.conversation || []),
                  {
                    sender: "broker",
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
      alert("Reply sent successfully! The student will be notified.");
    } catch (error) {
      console.error("Error sending reply:", error);
      alert("Error sending reply. Please try again.");
    } finally {
      setSendingReply(false);
    }
  };

  const formatDate = (dateString) => {
    const date = new Date(dateString);
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

  const handleCallStudent = (phone) => {
    if (!phone) {
      alert("Phone number not available");
      return;
    }
    window.open(`tel:${phone}`, "_self");
  };

  const handleEmailStudent = (email, studentName, propertyTitle) => {
    if (!email) {
      alert("Email address not available");
      return;
    }

    const subject = encodeURIComponent(
      `Re: Your inquiry about ${propertyTitle}`
    );
    const body = `Hi ${studentName},

Thank you for your interest in "${propertyTitle}".

I would be happy to provide more details and arrange a viewing at your convenience.

Please let me know your preferred time for a property visit.

Best regards,
${user.name}
${user.companyName || ""}
Phone: ${user.phone || "Contact via email"}`;

    // Create mailto URL and open default email client
    const mailtoUrl = `mailto:${email}?subject=${subject}&body=${encodeURIComponent(
      body
    )}`;
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
  

  if (user?.userType !== "broker") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            {/* Access Denied */}
          </h2>
          <p className="text-gray-600">
            Only brokers can access this dashboard
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
        <div className="flex justify-between items-center mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Broker Dashboard
            </h1>
            <p className="text-gray-600">
              Welcome back, {user.name}! Manage your properties and track
              performance
            </p>
          </div>
          <Link
            to="/add-property"
            className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center shadow-md"
          >
            <Plus className="h-5 w-5 mr-2" />
            Add Property
          </Link>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-blue-500">
            <div className="flex items-center">
              <div className="p-3 bg-blue-100 rounded-lg">
                <Building className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Total Properties</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalProperties}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-green-500">
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

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-purple-500">
            <div className="flex items-center">
              <div className="p-3 bg-purple-100 rounded-lg">
                <MessageCircle className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Messages</p>
                <p className="text-2xl font-bold text-gray-900">
                  {stats.totalInquiries}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow-md p-6 border-l-4 border-yellow-500">
            <div className="flex items-center">
              <div className="p-3 bg-yellow-100 rounded-lg">
                <DollarSign className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-600">Est. Revenue</p>
                <p className="text-2xl font-bold text-gray-900">
                  ₹{Math.round(stats.monthlyRevenue).toLocaleString()}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Navigation Tabs */}
        <div className="mb-8">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveTab("properties")}
              className={`py-2 px-1 border-b-2 font-medium text-sm transition-colors ${
                activeTab === "properties"
                  ? "border-blue-500 text-blue-600"
                  : "border-transparent text-gray-500 hover:text-gray-700"
              }`}
            >
              Properties ({properties.length})
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
              {contacts.filter((c) => c.status === "pending").length > 0 && (
                <span className="ml-2 bg-red-500 text-white text-xs px-2 py-1 rounded-full">
                  {contacts.filter((c) => c.status === "pending").length}
                </span>
              )}
            </button>
          </nav>
        </div>

        {/* Properties Tab */}
        {activeTab === "properties" && (
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Your Properties
              </h2>
            </div>

            {properties.length > 0 ? (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Property
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Price
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Views
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Inquiries
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {properties.map((property) => (
                      <tr
                        key={property._id}
                        className="hover:bg-gray-50 transition-colors"
                      >
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center">
                            <img
                              src={
                                property.images && property.images.length > 0
                                  ? `http://localhost:5010${property.images[0]}`
                                  : "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg"
                              }
                              alt={property.title}
                              className="w-screen h-screen object-cover rounded-lg border border-gray-200"
                            />
                            <div className="ml-4">
                              <div className="text-sm font-medium text-gray-900 max-w-xs truncate">
                                {property.title}
                              </div>
                              <div className="text-sm text-gray-500 max-w-xs truncate">
                                {property.address}
                              </div>
                              <div className="text-xs text-gray-400">
                                {property.bedrooms} bed • {property.bathrooms}{" "}
                                bath • {property.area} sq ft
                              </div>
                            </div>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="text-sm font-semibold text-gray-900">
                            ₹{property.price.toLocaleString()}
                          </div>
                          <div className="text-sm text-gray-500">per month</div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <Eye className="h-4 w-4 text-gray-400 mr-1" />
                            {property.views || 0}
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                          <div className="flex items-center">
                            <MessageCircle className="h-4 w-4 text-gray-400 mr-1" />
                            {
                              contacts.filter(
                                (c) => c.property._id === property._id
                              ).length
                            }
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <span
                            className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                              property.isActive
                                ? "bg-green-100 text-green-800"
                                : "bg-red-100 text-red-800"
                            }`}
                          >
                            {property.isActive ? "Active" : "Inactive"}
                          </span>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                          <div className="flex space-x-3">
                            <Link
                              to={`/flat/${property._id}`}
                              className="text-blue-600 hover:text-blue-900 transition-colors"
                              title="View Property"
                            >
                              <Eye className="h-5 w-5" />
                            </Link>
                            <Link
                              to={`/edit-property/${property._id}`}
                              className="text-green-600 hover:text-green-900 transition-colors"
                              title="Edit Property"
                            >
                              <Edit className="h-5 w-5" />
                            </Link>
                            <button
                              onClick={() => handleDeleteProperty(property._id)}
                              className="text-red-600 hover:text-red-900 transition-colors"
                              title="Delete Property"
                            >
                              <Trash2 className="h-5 w-5" />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            ) : (
              <div className="text-center py-12">
                <Building className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">
                  No properties yet
                </h3>
                <p className="text-gray-600 mb-6">
                  Start by adding your first property to attract potential
                  tenants
                </p>
                <Link
                  to="/add-property"
                  className="inline-flex items-center bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-5 w-5 mr-2" />
                  Add Your First Property
                </Link>
              </div>
            )}
          </div>
        )}

        {/* Messages Tab */}
        {activeTab === "messages" && (
          <div className="bg-white rounded-lg shadow-md">
            <div className="px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">
                Student Messages
              </h2>
              <p className="text-sm text-gray-600 mt-1">
                Inquiries from students interested in your properties
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
                        {/* Student Info */}
                        <div className="flex items-center mb-3">
                          <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-blue-600 font-semibold">
                              {contact.student.name.charAt(0).toUpperCase()}
                            </span>
                          </div>
                          <div className="flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                  {contact.student.name}
                                </h3>
                                <p className="text-sm text-gray-600">
                                  {contact.student.email}
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
                                  {contact.status}
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
                              Property: {contact.property.title}
                            </span>
                          </div>
                        </div>

                        {/* Student's Message */}
                        <div className="bg-blue-50 border-l-4 border-blue-400 p-4 mb-4">
                          <div className="flex items-start">
                            <MessageCircle className="h-5 w-5 text-blue-400 mr-2 mt-0.5" />
                            <div>
                              <p className="text-sm font-medium text-blue-900 mb-1">
                                Student's Message:
                              </p>
                              <p className="text-sm text-blue-800">
                                {contact.message}
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
                                  Your Reply:
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

                        {/* Student's Follow-up Reply (if exists) */}
                        {contact.studentReply && (
                          <div className="bg-purple-50 border-l-4 border-purple-400 p-4 mb-4">
                            <div className="flex items-start">
                              <CheckCircle className="h-5 w-5 text-purple-400 mr-2 mt-0.5" />
                              <div>
                                <p className="text-sm font-medium text-purple-900 mb-1">
                                  Student's Follow-up:
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
                              Reply to {contact.student.name}
                            </h4>
                            <textarea
                              value={replyMessage}
                              onChange={(e) => setReplyMessage(e.target.value)}
                              rows={4}
                              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                              placeholder={`Hi ${contact.student.name}, thank you for your interest in "${contact.property.title}". I would be happy to provide more details...`}
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
                                handleCallStudent(contact.studentPhone)
                              }
                              className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm"
                            >
                              <Phone className="h-4 w-4 mr-2" />
                              Call: {formatPhoneNumber(contact.studentPhone)}
                            </button>

                            <button
                              onClick={() =>
                                handleEmailStudent(
                                  contact.student.email,
                                  contact.student.name,
                                  contact.property.title
                                )
                              }
                              className="flex items-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                            >
                              <Mail className="h-4 w-4 mr-2" />
                              Send Email
                            </button>

                            <Link
                              to={`/flat/${contact.property._id}`}
                              className="flex items-center px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 transition-colors text-sm"
                            >
                              <Eye className="h-4 w-4 mr-2" />
                              View Property
                            </Link>
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
                  When students contact you about your properties, their
                  messages will appear here
                </p>
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 max-w-md mx-auto">
                  <h4 className="font-medium text-blue-900 mb-2">
                    💡 Tips to get more inquiries:
                  </h4>
                  <ul className="text-sm text-blue-800 space-y-1">
                    <li>• Add high-quality photos</li>
                    <li>• Write detailed descriptions</li>
                    <li>• Keep prices competitive</li>
                    <li>• Update property regularly</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Quick Tips */}
        <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            💡 Quick Tips for Success
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>• Upload high-quality photos to attract more views</div>
            <div>• Keep property descriptions detailed and accurate</div>
            <div>• Respond quickly to student inquiries</div>
            <div>• Update availability status regularly</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default BrokerDashboard;
