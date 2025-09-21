import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Plus,
  X,
  MapPin,
  Home,
  Bed,
  Bath,
  DollarSign,
  Upload,
  Image as ImageIcon,
  ArrowLeft,
  Save,
} from "lucide-react";
import api from "../services/api";

const EditProperty = () => {
  const { id } = useParams();
  const { user } = useAuth();
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    address: "",
    price: "",
    bedrooms: "",
    bathrooms: "",
    area: "",
    propertyType: "apartment",
    furnishing: "semi-furnished",
    amenities: [],
    nearbyUniversities: [],
  });
  const [existingImages, setExistingImages] = useState([]);
  const [selectedImages, setSelectedImages] = useState([]);
  const [imagePreviews, setImagePreviews] = useState([]);
  const [amenityInput, setAmenityInput] = useState("");
  const [universityInput, setUniversityInput] = useState("");

  useEffect(() => {
    if (user && (user.userType === "broker" || user.userType === "owner")) {
      fetchPropertyDetails();
    }
  }, [id, user]);

  const fetchPropertyDetails = async () => {
    try {
      const response = await api.get(`/properties/${id}`);
      const property = response.data;

      // Check if the current user owns this property
      if (property.owner._id !== user.id) {
        alert("You can only edit your own properties");
        navigate("/broker-dashboard");
        return;
      }

      setFormData({
        title: property.title || "",
        description: property.description || "",
        address: property.address || "",
        price: property.price?.toString() || "",
        bedrooms: property.bedrooms?.toString() || "",
        bathrooms: property.bathrooms?.toString() || "",
        area: property.area?.toString() || "",
        propertyType: property.propertyType || "apartment",
        furnishing: property.furnishing || "semi-furnished",
        amenities: property.amenities || [],
        nearbyUniversities: property.nearbyUniversities || [],
      });

      setExistingImages(property.images || []);
    } catch (error) {
      console.error("Error fetching property details:", error);
      alert("Error loading property details");
      navigate("/broker-dashboard");
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);

    if (files.length + selectedImages.length + existingImages.length > 5) {
      alert("You can upload maximum 5 images total");
      return;
    }

    // Validate file types and sizes
    const validFiles = files.filter((file) => {
      if (!file.type.startsWith("image/")) {
        alert(`${file.name} is not an image file`);
        return false;
      }
      if (file.size > 5 * 1024 * 1024) {
        // 5MB limit
        alert(`${file.name} is too large. Maximum size is 5MB`);
        return false;
      }
      return true;
    });

    setSelectedImages((prev) => [...prev, ...validFiles]);

    // Create previews
    validFiles.forEach((file) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        setImagePreviews((prev) => [
          ...prev,
          {
            file: file,
            url: e.target.result,
            name: file.name,
          },
        ]);
      };
      reader.readAsDataURL(file);
    });
  };

  const removeNewImage = (index) => {
    setSelectedImages((prev) => prev.filter((_, i) => i !== index));
    setImagePreviews((prev) => prev.filter((_, i) => i !== index));
  };

  const removeExistingImage = (index) => {
    setExistingImages((prev) => prev.filter((_, i) => i !== index));
  };

  const handleAddAmenity = () => {
    if (
      amenityInput.trim() &&
      !formData.amenities.includes(amenityInput.trim())
    ) {
      setFormData({
        ...formData,
        amenities: [...formData.amenities, amenityInput.trim()],
      });
      setAmenityInput("");
    }
  };

  const handleRemoveAmenity = (amenity) => {
    setFormData({
      ...formData,
      amenities: formData.amenities.filter((item) => item !== amenity),
    });
  };

  const handleAddUniversity = () => {
    if (
      universityInput.trim() &&
      !formData.nearbyUniversities.includes(universityInput.trim())
    ) {
      setFormData({
        ...formData,
        nearbyUniversities: [
          ...formData.nearbyUniversities,
          universityInput.trim(),
        ],
      });
      setUniversityInput("");
    }
  };

  const handleRemoveUniversity = (university) => {
    setFormData({
      ...formData,
      nearbyUniversities: formData.nearbyUniversities.filter(
        (item) => item !== university
      ),
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSaving(true);

    try {
      // Create FormData for file upload
      const formDataToSend = new FormData();

      // Add property data
      formDataToSend.append("title", formData.title);
      formDataToSend.append("description", formData.description);
      formDataToSend.append("address", formData.address);
      formDataToSend.append("price", parseInt(formData.price));
      formDataToSend.append("bedrooms", parseInt(formData.bedrooms));
      formDataToSend.append("bathrooms", parseInt(formData.bathrooms));
      formDataToSend.append("area", parseInt(formData.area));
      formDataToSend.append("propertyType", formData.propertyType);
      formDataToSend.append("furnishing", formData.furnishing);
      formDataToSend.append("amenities", JSON.stringify(formData.amenities));
      formDataToSend.append(
        "nearbyUniversities",
        JSON.stringify(formData.nearbyUniversities)
      );
      formDataToSend.append("existingImages", JSON.stringify(existingImages));

      // Add new images
      selectedImages.forEach((image) => {
        formDataToSend.append("images", image);
      });

      await api.put(`/properties/${id}`, formDataToSend, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
      });

      alert("Property updated successfully!");
      navigate("/broker-dashboard");
    } catch (error) {
      console.error("Error updating property:", error);
      alert("Error updating property. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (user?.userType !== "broker" && user?.userType !== "owner") {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          
          <p className="text-gray-600">
            Only brokers and property owners can edit properties
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
          <p className="mt-4 text-gray-600">Loading property details...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="bg-white rounded-lg shadow-md p-8">
          {/* Header */}
          <div className="mb-8">
            <button
              onClick={() => navigate("/broker-dashboard")}
              className="inline-flex items-center text-blue-600 hover:text-blue-700 mb-4 transition-colors"
            >
              <ArrowLeft className="h-5 w-5 mr-2" />
              Back to Dashboard
            </button>
            <h1 className="text-3xl font-bold text-gray-900 mb-2">
              Edit Property
            </h1>
            <p className="text-gray-600">
              Update your property details and information
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Basic Information */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="md:col-span-2">
                <label
                  htmlFor="title"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Property Title *
                </label>
                <input
                  type="text"
                  id="title"
                  name="title"
                  required
                  value={formData.title}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="e.g., Spacious 2BHK near MIT College"
                />
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="description"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Description *
                </label>
                <textarea
                  id="description"
                  name="description"
                  required
                  rows={4}
                  value={formData.description}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  placeholder="Describe your property in detail..."
                />
              </div>

              <div className="md:col-span-2">
                <label
                  htmlFor="address"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Address *
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="text"
                    id="address"
                    name="address"
                    required
                    value={formData.address}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="Full address with area and city"
                  />
                </div>
              </div>
            </div>

            {/* Property Details */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
              <div>
                <label
                  htmlFor="price"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Monthly Rent (₹) *
                </label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    id="price"
                    name="price"
                    required
                    min="1000"
                    value={formData.price}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                    placeholder="25010"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="bedrooms"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Bedrooms *
                </label>
                <div className="relative">
                  <Bed className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    id="bedrooms"
                    name="bedrooms"
                    required
                    min="1"
                    max="10"
                    value={formData.bedrooms}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="bathrooms"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Bathrooms *
                </label>
                <div className="relative">
                  <Bath className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    id="bathrooms"
                    name="bathrooms"
                    required
                    min="1"
                    max="10"
                    value={formData.bathrooms}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>

              <div>
                <label
                  htmlFor="area"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Area (sq ft) *
                </label>
                <div className="relative">
                  <Home className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                  <input
                    type="number"
                    id="area"
                    name="area"
                    required
                    min="100"
                    value={formData.area}
                    onChange={handleInputChange}
                    className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
              </div>
            </div>

            {/* Property Type and Furnishing */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label
                  htmlFor="propertyType"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Property Type
                </label>
                <select
                  id="propertyType"
                  name="propertyType"
                  value={formData.propertyType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="studio">Studio</option>
                  <option value="shared">Shared Room</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="furnishing"
                  className="block text-sm font-medium text-gray-700 mb-2"
                >
                  Furnishing
                </label>
                <select
                  id="furnishing"
                  name="furnishing"
                  value={formData.furnishing}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                >
                  <option value="furnished">Fully Furnished</option>
                  <option value="semi-furnished">Semi Furnished</option>
                  <option value="unfurnished">Unfurnished</option>
                </select>
              </div>
            </div>

            {/* Image Management */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Property Images (Max 5 images total)
              </label>

              {/* Existing Images */}
              {existingImages.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    Current Images
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {existingImages.map((image, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={`http://localhost:5010${image}`}
                          alt={`Existing ${index + 1}`}
                          className="w-full h-24 object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeExistingImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Upload New Images */}
              {existingImages.length + selectedImages.length < 5 && (
                <div className="mb-4">
                  <label className="flex flex-col items-center justify-center w-full h-32 border-2 border-gray-300 border-dashed rounded-lg cursor-pointer bg-gray-50 hover:bg-gray-100 transition-colors">
                    <div className="flex flex-col items-center justify-center pt-5 pb-6">
                      <Upload className="w-8 h-8 mb-2 text-gray-500" />
                      <p className="mb-2 text-sm text-gray-500">
                        <span className="font-semibold">Click to upload</span>{" "}
                        new images
                      </p>
                      <p className="text-xs text-gray-500">
                        PNG, JPG, JPEG (MAX. 5MB each)
                      </p>
                    </div>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={handleImageChange}
                      className="hidden"
                    />
                  </label>
                </div>
              )}

              {/* New Image Previews */}
              {imagePreviews.length > 0 && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-700 mb-2">
                    New Images
                  </h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
                    {imagePreviews.map((preview, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={preview.url}
                          alt={`New ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg border border-gray-200"
                        />
                        <button
                          type="button"
                          onClick={() => removeNewImage(index)}
                          className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                        >
                          <X className="h-4 w-4" />
                        </button>
                        <div className="absolute bottom-0 left-0 right-0 bg-black bg-opacity-50 text-white text-xs p-1 rounded-b-lg truncate">
                          {preview.name}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {existingImages.length === 0 && selectedImages.length === 0 && (
                <div className="text-center py-4 text-gray-500">
                  <ImageIcon className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                  <p>No images selected</p>
                </div>
              )}
            </div>

            {/* Amenities */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Amenities
              </label>
              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  value={amenityInput}
                  onChange={(e) => setAmenityInput(e.target.value)}
                  placeholder="Add amenity (e.g., WiFi, Parking, AC)"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  onKeyPress={(e) =>
                    e.key === "Enter" &&
                    (e.preventDefault(), handleAddAmenity())
                  }
                />
                <button
                  type="button"
                  onClick={handleAddAmenity}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.amenities.map((amenity, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm"
                  >
                    {amenity}
                    <button
                      type="button"
                      onClick={() => handleRemoveAmenity(amenity)}
                      className="ml-2 text-blue-600 hover:text-blue-800"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Nearby Universities */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nearby Universities
              </label>
              <div className="flex space-x-2 mb-3">
                <input
                  type="text"
                  value={universityInput}
                  onChange={(e) => setUniversityInput(e.target.value)}
                  placeholder="Add university (e.g., MIT, Harvard)"
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  onKeyPress={(e) =>
                    e.key === "Enter" &&
                    (e.preventDefault(), handleAddUniversity())
                  }
                />
                <button
                  type="button"
                  onClick={handleAddUniversity}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  <Plus className="h-5 w-5" />
                </button>
              </div>
              <div className="flex flex-wrap gap-2">
                {formData.nearbyUniversities.map((university, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm"
                  >
                    {university}
                    <button
                      type="button"
                      onClick={() => handleRemoveUniversity(university)}
                      className="ml-2 text-green-600 hover:text-green-800"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  </span>
                ))}
              </div>
            </div>

            {/* Submit Buttons */}
            <div className="flex justify-end space-x-4 pt-6 border-t border-gray-200">
              <button
                type="button"
                onClick={() => navigate("/broker-dashboard")}
                className="px-8 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Cancel
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center"
              >
                {saving ? (
                  <>
                    <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-2"></div>
                    Updating Property...
                  </>
                ) : (
                  <>
                    <Save className="h-5 w-5 mr-2" />
                    Update Property
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default EditProperty;
