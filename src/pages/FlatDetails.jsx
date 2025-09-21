import React, { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  MapPin,
  Bed,
  Bath,
  Home,
  Phone,
  Mail,
  ArrowLeft,
  Star,
  MessageCircle,
  User,
  CheckCircle,
  Heart,
  GraduationCap,
  Edit,
  Trash2,
} from "lucide-react";
import StarRating from "../components/StarRating";
import RatingModal from "../components/RatingModal";
import api from "../services/api";

const FlatDetails = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const [flat, setFlat] = useState(null);
  const [loading, setLoading] = useState(true);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);
  const [showContactForm, setShowContactForm] = useState(false);
  const [contactMessage, setContactMessage] = useState("");
  const [contactLoading, setContactLoading] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [isFavorite, setIsFavorite] = useState(false);
  const [ratings, setRatings] = useState([]);
  const [averageRating, setAverageRating] = useState(0);
  const [totalRatings, setTotalRatings] = useState(0);
  const [categoryAverages, setCategoryAverages] = useState({});
  const [userRating, setUserRating] = useState(null);
  const [showRatingModal, setShowRatingModal] = useState(false);
  const [ratingsLoading, setRatingsLoading] = useState(false);

  useEffect(() => {
    fetchFlatDetails();
    fetchRatings();
    if (user && user.userType === "student") {
      checkFavoriteStatus();
      fetchUserRating();
    }
  }, [id]);

  useEffect(() => {
    if (user && user.userType === "student") {
      checkFavoriteStatus();
      fetchUserRating();
    }
  }, [user, id]);

  const fetchFlatDetails = async () => {
    try {
      const response = await api.get(`/properties/${id}`);
      setFlat(response.data);
    } catch (error) {
      console.error("Error fetching flat details:", error);
    } finally {
      setLoading(false);
    }
  };

  const fetchRatings = async () => {
    try {
      const response = await api.get(`/ratings/property/${id}`);
      setRatings(response.data.ratings);
      setAverageRating(response.data.averageRating);
      setTotalRatings(response.data.totalRatings);
      setCategoryAverages(response.data.categoryAverages);
    } catch (error) {
      console.error("Error fetching ratings:", error);
    }
  };

  const fetchUserRating = async () => {
    if (!user || user.userType !== "student") return;

    try {
      const response = await api.get(`/ratings/property/${id}/student`);
      setUserRating(response.data.rating);
    } catch (error) {
      console.error("Error fetching user rating:", error);
    }
  };

  const handleRatingSubmit = async (ratingData) => {
    setRatingsLoading(true);
    try {
      console.log("Submitting rating to API:", ratingData);
      await api.post("/ratings", ratingData);
      await fetchRatings();
      await fetchUserRating();
      alert("Rating submitted successfully!");
    } catch (error) {
      console.error("Error submitting rating:", error);
      console.error("Error response:", error.response?.data);
      console.error("Error status:", error.response?.status);
      throw error;
    } finally {
      setRatingsLoading(false);
    }
  };

  const handleDeleteRating = async (ratingId) => {
    if (window.confirm("Are you sure you want to delete your rating?")) {
      try {
        await api.delete(`/ratings/${ratingId}`);
        await fetchRatings();
        await fetchUserRating();
        alert("Rating deleted successfully!");
      } catch (error) {
        console.error("Error deleting rating:", error);
        alert("Error deleting rating. Please try again.");
      }
    }
  };
  const checkFavoriteStatus = () => {
    if (!user || user.userType !== "student") return;

    const savedFavorites = localStorage.getItem(`favorites_${user.id}`);
    if (savedFavorites) {
      const favorites = JSON.parse(savedFavorites);
      setIsFavorite(favorites.includes(id));
    }
  };

  const toggleFavorite = () => {
    if (!user || user.userType !== "student") {
      alert("Please login as a student to add favorites");
      return;
    }

    const savedFavorites = localStorage.getItem(`favorites_${user.id}`);
    const favorites = savedFavorites ? JSON.parse(savedFavorites) : [];

    const newFavorites = isFavorite
      ? favorites.filter((favId) => favId !== id)
      : [...favorites, id];

    localStorage.setItem(`favorites_${user.id}`, JSON.stringify(newFavorites));
    setIsFavorite(!isFavorite);
  };

  const handleContactSubmit = async (e) => {
    e.preventDefault();
    if (!user) {
      alert("Please login to contact the broker");
      return;
    }

    if (user.userType !== "student") {
      alert("Only students can contact brokers");
      return;
    }

    if (!contactMessage.trim()) {
      alert("Please enter a message");
      return;
    }

    setContactLoading(true);
    try {
      await api.post("/contacts", {
        brokerId: flat.owner._id,
        propertyId: flat._id,
        message: contactMessage.trim(),
      });
      setContactSuccess(true);
      setTimeout(() => {
        setShowContactForm(false);
        setContactMessage("");
        setContactSuccess(false);
      }, 2000);
    } catch (error) {
      console.error("Error sending contact request:", error);
      alert("Error sending contact request. Please try again.");
    } finally {
      setContactLoading(false);
    }
  };

  const handlePhoneCall = (phoneNumber) => {
    if (!user) {
      alert("Please login to contact the broker");
      return;
    }

    if (user.userType !== "student") {
      alert("Only students can contact brokers");
      return;
    }

    if (!phoneNumber) {
      alert("Phone number not available");
      return;
    }

    // Create a clickable phone link that opens the phone dialer
    window.open(`tel:${phoneNumber}`, "_self");
  };

  const handleEmailContact = (email, propertyTitle, ownerName, price) => {
    if (!user) {
      alert("Please login to contact the broker");
      return;
    }

    if (user.userType !== "student") {
      alert("Only students can contact brokers");
      return;
    }

    if (!email) {
      alert("Email address not available");
      return;
    }

    // Create mailto link that opens default email client
    const subject = `Inquiry about ${propertyTitle}`;
    const body = `Hi ${ownerName},

I'm interested in your property "${propertyTitle}" listed at ₹${price.toLocaleString()}/month.

Could you please provide more details about:
- Availability and move-in date
- Viewing schedule
- Any additional charges
- Lease terms

Looking forward to hearing from you.

Best regards,
${user.name}
Phone: ${user.phone || "Not provided"}
Email: ${user.email}`;

    // Create mailto URL
    const mailtoUrl = `mailto:${email}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;

    // Open default email client
    window.location.href = mailtoUrl;
  };

  const formatPhoneNumber = (phone) => {
    if (!phone) return "Not provided";
    // Format phone number for display
    const cleaned = phone.replace(/\D/g, "");
    if (cleaned.length === 10) {
      return `+91 ${cleaned.slice(0, 5)} ${cleaned.slice(5)}`;
    }
    return phone;
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading flat details...</p>
        </div>
      </div>
    );
  }

  if (!flat) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <h2 className="text-2xl font-bold text-gray-900 mb-4">
            Flat not found
          </h2>
          <Link to="/flats" className="text-blue-600 hover:text-blue-700">
            Back to listings
          </Link>
        </div>
      </div>
    );
  }

  const images =
    flat.images && flat.images.length > 0
      ? flat.images.map((img) => `http://localhost:5010${img}`)
      : ["https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg"];

  return (
    <div className="min-h-screen bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link
          to="/flats"
          className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-6 transition-colors"
        >
          <ArrowLeft className="h-5 w-5 mr-2" />
          Back to listings
        </Link>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Images and Details */}
          <div className="lg:col-span-2">
            {/* Property Header with Favorite Button */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h1 className="text-3xl font-bold text-gray-900 mb-2">
                    {flat.title}
                  </h1>
                  <div className="flex items-center text-gray-600 mb-4">
                    <MapPin className="h-5 w-5 mr-2" />
                    <span>{flat.address}</span>
                  </div>

                  {/* Rating Display */}
                  <div className="mb-4">
                    <StarRating
                      rating={averageRating}
                      size="lg"
                      showNumber={true}
                      className="justify-start"
                    />
                    {totalRatings > 0 && (
                      <span className="text-sm text-gray-600 ml-2">
                        ({totalRatings} review{totalRatings !== 1 ? "s" : ""})
                      </span>
                    )}
                  </div>
                </div>

                {/* Favorite Button */}
                {user && user.userType === "student" && (
                  <button
                    onClick={toggleFavorite}
                    className={`flex items-center px-4 py-2 rounded-lg border-2 transition-colors ${
                      isFavorite
                        ? "border-red-500 bg-red-50 text-red-700 hover:bg-red-100"
                        : "border-gray-300 bg-white text-gray-700 hover:border-red-300 hover:text-red-600"
                    }`}
                  >
                    <Heart
                      className={`h-5 w-5 mr-2 ${
                        isFavorite ? "fill-current" : ""
                      }`}
                    />
                    {isFavorite ? "Remove from Favorites" : "Add to Favorites"}
                  </button>
                )}
              </div>

              <div className="flex items-center space-x-6">
                <div className="flex items-center">
                  <Bed className="h-5 w-5 mr-2 text-gray-600" />
                  <span className="font-semibold">{flat.bedrooms}</span>
                  <span className="text-gray-600 ml-1">Bedrooms</span>
                </div>
                <div className="flex items-center">
                  <Bath className="h-5 w-5 mr-2 text-gray-600" />
                  <span className="font-semibold">{flat.bathrooms}</span>
                  <span className="text-gray-600 ml-1">Bathrooms</span>
                </div>
                <div className="flex items-center">
                  <Home className="h-5 w-5 mr-2 text-gray-600" />
                  <span className="font-semibold">{flat.area}</span>
                  <span className="text-gray-600 ml-1">sq ft</span>
                </div>
              </div>
            </div>
            {/* Image Gallery */}
            <div className="bg-white rounded-lg shadow-md overflow-hidden mb-6">
              <div className="aspect-w-16 aspect-h-9">
                <img
                  src={images[currentImageIndex]}
                  alt={flat.title}
                  className="w-full h-96 object-cover"
                />
              </div>
              {images.length > 1 && (
                <div className="p-4">
                  <div className="flex space-x-2 overflow-x-auto">
                    {images.map((image, index) => (
                      <button
                        key={index}
                        onClick={() => setCurrentImageIndex(index)}
                        className={`flex-shrink-0 w-20 h-20 rounded-lg overflow-hidden border-2 transition-colors ${
                          index === currentImageIndex
                            ? "border-blue-600"
                            : "border-gray-200 hover:border-gray-300"
                        }`}
                      >
                        <img
                          src={image}
                          alt={`${flat.title} ${index + 1}`}
                          className="w-full h-full object-cover"
                        />
                      </button>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Property Details */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <div className="mb-6">
                <h3 className="text-xl font-semibold text-gray-900 mb-3">
                  Description
                </h3>
                <p className="text-gray-600 leading-relaxed">
                  {flat.description}
                </p>
              </div>

              {flat.amenities && flat.amenities.length > 0 && (
                <div className="mb-6">
                  <h3 className="text-xl font-semibold text-gray-900 mb-3">
                    Amenities
                  </h3>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {flat.amenities.map((amenity, index) => (
                      <div
                        key={index}
                        className="flex items-center bg-gray-50 px-3 py-2 rounded-lg"
                      >
                        <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
                        <span className="text-sm text-gray-700">{amenity}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {flat.nearbyUniversities &&
                flat.nearbyUniversities.length > 0 && (
                  <div>
                    <h3 className="text-xl font-semibold text-gray-900 mb-3 flex items-center">
                      <GraduationCap className="h-5 w-5 mr-2 text-blue-600" />
                      Nearby Universities
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {flat.nearbyUniversities.map((university, index) => (
                        <div
                          key={index}
                          className="flex items-center bg-blue-50 px-4 py-3 rounded-lg border border-blue-200"
                        >
                          <GraduationCap className="h-5 w-5 text-blue-600 mr-3" />
                          <div>
                            <span className="font-medium text-blue-900">
                              {university}
                            </span>
                            <p className="text-xs text-blue-600">
                              Walking distance or easy commute
                            </p>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

              {/* Student Rating Section */}
              {user && user.userType === "student" && (
                <div className="mt-6 pt-6 border-t border-gray-200">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Rate This Property
                  </h3>

                  {userRating ? (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <span className="text-sm font-medium text-blue-900">
                          Your Rating:
                        </span>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => setShowRatingModal(true)}
                            className="text-blue-600 hover:text-blue-700 text-sm"
                          >
                            <Edit className="h-4 w-4 inline mr-1" />
                            Edit
                          </button>
                          <button
                            onClick={() => handleDeleteRating(userRating._id)}
                            className="text-red-600 hover:text-red-700 text-sm"
                          >
                            <Trash2 className="h-4 w-4 inline mr-1" />
                            Delete
                          </button>
                        </div>
                      </div>
                      <StarRating
                        rating={userRating.rating}
                        size="sm"
                        showNumber={true}
                        className="mb-2"
                      />
                      {userRating.review && (
                        <p className="text-sm text-blue-800 mt-2">
                          "{userRating.review}"
                        </p>
                      )}
                    </div>
                  ) : (
                    <button
                      onClick={() => setShowRatingModal(true)}
                      className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center font-medium"
                    >
                      <Star className="h-5 w-5 mr-2" />
                      Rate This Property
                    </button>
                  )}
                </div>
              )}
            </div>
          </div>

          {/* Sidebar */}
          <div className="lg:col-span-1">
            {/* Price and Contact */}
            <div className="bg-white rounded-lg shadow-md p-6 mb-6">
              <div className="text-center mb-6">
                <div className="text-3xl font-bold text-blue-600 mb-2">
                  ₹{flat.price.toLocaleString()}
                  <span className="text-lg text-gray-500 font-normal">
                    /month
                  </span>
                </div>
                <div className="bg-green-100 text-green-800 px-3 py-1 rounded-full text-sm font-medium inline-block">
                  Available Now
                </div>
              </div>

              {flat.owner && (
                <div className="border-t pt-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">
                    Property Owner
                  </h3>
                  <div className="space-y-4">
                    {/* Owner Profile */}
                    <div className="flex items-center p-4 bg-gray-50 rounded-lg">
                      <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center mr-4">
                        <span className="text-blue-600 font-semibold text-lg">
                          {flat.owner.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                      <div className="flex-1">
                        <p className="font-semibold text-gray-900">
                          {flat.owner.name}
                        </p>
                        <p className="text-sm text-gray-600 capitalize">
                          {flat.owner.userType || "Broker"}
                        </p>
                        <p className="text-sm text-gray-500">
                          {flat.owner.email}
                        </p>
                      </div>
                    </div>

                    {/* Contact Actions */}
                    <div className="space-y-3">
                      {flat.owner.phone && (
                        <button
                          onClick={() => handlePhoneCall(flat.owner.phone)}
                          className="w-full bg-green-600 text-white py-3 rounded-lg hover:bg-green-700 transition-colors flex items-center justify-center font-medium"
                        >
                          <Phone className="h-5 w-5 mr-2" />
                          Call: {formatPhoneNumber(flat.owner.phone)}
                        </button>
                      )}

                      <button
                        onClick={() => setShowContactForm(true)}
                        className="w-full bg-blue-600 text-white py-3 rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center font-medium"
                      >
                        <MessageCircle className="h-5 w-5 mr-2" />
                        Send Message
                      </button>

                      {flat.owner.email && (
                        <button
                          onClick={() =>
                            handleEmailContact(
                              flat.owner.email,
                              flat.title,
                              flat.owner.name,
                              flat.price
                            )
                          }
                          className="w-full bg-purple-600 text-white py-3 rounded-lg hover:bg-purple-700 transition-colors flex items-center justify-center font-medium"
                        >
                          <Mail className="h-5 w-5 mr-2" />
                          Open Email App
                        </button>
                      )}
                    </div>

                    {/* Login Prompt for Non-logged Users */}
                    {!user && (
                      <div className="mt-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <p className="text-sm text-yellow-800 text-center">
                          <Link
                            to="/login"
                            className="font-medium text-yellow-900 hover:underline"
                          >
                            Login
                          </Link>{" "}
                          to contact the property owner
                        </p>
                      </div>
                    )}

                    {/* Non-student User Message */}
                    {user && user.userType !== "student" && (
                      <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                        <p className="text-sm text-blue-800 text-center">
                          Only students can contact property owners
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              )}
            </div>

            {/* Additional Info */}
            <div className="bg-white rounded-lg shadow-md p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Property Details
              </h3>
              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-gray-600">Property Type</span>
                  <span className="font-medium capitalize">
                    {flat.propertyType || "Apartment"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Furnishing</span>
                  <span className="font-medium capitalize">
                    {flat.furnishing || "Semi-Furnished"}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Security Deposit</span>
                  <span className="font-medium">
                    ₹{(flat.price / 4).toLocaleString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Available From</span>
                  <span className="font-medium">Immediately</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Views</span>
                  <span className="font-medium">{flat.views || 0}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Ratings and Reviews Section */}
          <div className="bg-white rounded-lg shadow-md p-6 mt-6">
            <h3 className="text-xl font-semibold text-gray-900 mb-6">
              Ratings & Reviews
            </h3>

            {totalRatings > 0 ? (
              <div>
                {/* Overall Rating Summary */}
                <div className="mb-6 p-4 bg-gray-50 rounded-lg">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <div className="text-3xl font-bold text-gray-900 mb-1">
                        {averageRating.toFixed(1)}
                      </div>
                      <StarRating
                        rating={averageRating}
                        size="md"
                        showNumber={false}
                      />
                      <p className="text-sm text-gray-600 mt-1">
                        Based on {totalRatings} review
                        {totalRatings !== 1 ? "s" : ""}
                      </p>
                    </div>
                  </div>

                  {/* Category Ratings */}
                  {Object.keys(categoryAverages).some(
                    (key) => categoryAverages[key] > 0
                  ) && (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                      {Object.entries(categoryAverages).map(([key, value]) => {
                        if (value === 0) return null;
                        const labels = {
                          location: "Location",
                          cleanliness: "Cleanliness",
                          amenities: "Amenities",
                          valueForMoney: "Value for Money",
                          landlordResponse: "Landlord Response",
                        };
                        return (
                          <div
                            key={key}
                            className="flex items-center justify-between"
                          >
                            <span className="text-sm text-gray-600">
                              {labels[key]}
                            </span>
                            <StarRating
                              rating={value}
                              size="sm"
                              showNumber={true}
                            />
                          </div>
                        );
                      })}
                    </div>
                  )}
                </div>

                {/* Individual Reviews */}
                <div className="space-y-4">
                  {ratings.map((rating) => (
                    <div
                      key={rating._id}
                      className="border border-gray-200 rounded-lg p-4"
                    >
                      <div className="flex items-center justify-between mb-2">
                        <div className="flex items-center">
                          <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                            <span className="text-blue-600 font-semibold text-sm">
                              {rating.student?.name?.charAt(0)?.toUpperCase() ||
                                "A"}
                            </span>
                          </div>
                          <div>
                            <p className="font-medium text-gray-900">
                              {rating.student?.name || "Anonymous"}
                            </p>
                            <p className="text-xs text-gray-500">
                              {new Date(rating.createdAt).toLocaleDateString()}
                            </p>
                          </div>
                        </div>
                        <StarRating
                          rating={rating.rating}
                          size="sm"
                          showNumber={true}
                        />
                      </div>
                      {rating.review && (
                        <p className="text-gray-700 text-sm mt-2">
                          "{rating.review}"
                        </p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            ) : (
              <div className="text-center py-8">
                <Star className="h-16 w-16 text-gray-300 mx-auto mb-4" />
                <h4 className="text-lg font-semibold text-gray-900 mb-2">
                  No reviews yet
                </h4>
                <p className="text-gray-600 mb-4">
                  Be the first to rate this property!
                </p>
                {user && user.userType === "student" && (
                  <button
                    onClick={() => setShowRatingModal(true)}
                    className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                  >
                    Write a Review
                  </button>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Contact Form Modal */}
        {showContactForm && (
          <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg p-6 max-w-md w-full">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Contact Property Owner
              </h3>

              {contactSuccess ? (
                <div className="text-center py-4">
                  <CheckCircle className="h-12 w-12 text-green-500 mx-auto mb-3" />
                  <p className="text-green-700 font-medium">
                    Message sent successfully!
                  </p>
                  <p className="text-sm text-gray-600 mt-1">
                    The owner will contact you soon.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleContactSubmit}>
                  <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Your Message to {flat.owner.name}
                    </label>
                    <textarea
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      required
                      rows={4}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                      placeholder={`Hi ${flat.owner.name}, I'm interested in your property "${flat.title}". Could you please provide more details about the availability and viewing schedule?`}
                    />
                  </div>
                  <div className="flex space-x-3">
                    <button
                      type="button"
                      onClick={() => {
                        setShowContactForm(false);
                        setContactMessage("");
                        setContactSuccess(false);
                      }}
                      className="flex-1 px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                    >
                      Cancel
                    </button>
                    <button
                      type="submit"
                      disabled={contactLoading}
                      className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {contactLoading ? "Sending..." : "Send Message"}
                    </button>
                  </div>
                </form>
              )}
            </div>
          </div>
        )}
      </div>

      {/* Rating Modal */}
      <RatingModal
        isOpen={showRatingModal}
        onClose={() => setShowRatingModal(false)}
        property={flat}
        existingRating={userRating}
        onSubmit={handleRatingSubmit}
      />
    </div>
  );
};

export default FlatDetails;
