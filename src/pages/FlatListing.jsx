import React, { useState, useEffect } from "react";
import { Link } from "react-router-dom";
import {
  Search,
  MapPin,
  Bed,
  Bath,
  Home,
  Filter,
  Heart,
  GraduationCap,
} from "lucide-react";
import { useAuth } from "../context/AuthContext";
import StarRating from "../components/StarRating";
import api from "../services/api";

const FlatListing = () => {
  const { user } = useAuth();
  const [flats, setFlats] = useState([]);
  const [loading, setLoading] = useState(true);
  const [favorites, setFavorites] = useState([]);
  const [propertyRatings, setPropertyRatings] = useState({});
  const [filters, setFilters] = useState({
    search: "",
    minPrice: "",
    maxPrice: "",
    bedrooms: "",
    bathrooms: "",
    university: "",
    location: "",
  });
  const [showFilters, setShowFilters] = useState(false);

  // Popular universities for quick selection
  const popularUniversities = [
    "MIT",
    "Harvard University",
    "Stanford University",
    "IIT Delhi",
    "IIT Mumbai",
    "Delhi University",
    "Mumbai University",
    "Bangalore University",
    "Chennai University",
    "Pune University",
    "Hyderabad University",
    "Kolkata University",
  ];

  useEffect(() => {
    fetchFlats();
    loadFavorites();
  }, [user]);

  const fetchFlats = async () => {
    try {
      const response = await api.get("/properties");
      const properties = response.data;
      setFlats(properties);

      // Fetch ratings for all properties
      const ratingsPromises = properties.map(async (property) => {
        try {
          const ratingResponse = await api.get(
            `/ratings/property/${property._id}`
          );
          return {
            propertyId: property._id,
            averageRating: ratingResponse.data.averageRating,
            totalRatings: ratingResponse.data.totalRatings,
          };
        } catch (error) {
          return {
            propertyId: property._id,
            averageRating: 0,
            totalRatings: 0,
          };
        }
      });

      const ratingsData = await Promise.all(ratingsPromises);
      const ratingsMap = {};
      ratingsData.forEach(({ propertyId, averageRating, totalRatings }) => {
        ratingsMap[propertyId] = { averageRating, totalRatings };
      });
      setPropertyRatings(ratingsMap);
    } catch (error) {
      console.error("Error fetching flats:", error);
    } finally {
      setLoading(false);
    }
  };

  const loadFavorites = () => {
    if (!user || user.userType !== "student") {
      setFavorites([]);
      return;
    }

    const savedFavorites = localStorage.getItem(`favorites_${user.id}`);
    if (savedFavorites) {
      try {
        const parsedFavorites = JSON.parse(savedFavorites);
        setFavorites(Array.isArray(parsedFavorites) ? parsedFavorites : []);
      } catch (error) {
        console.error("Error parsing favorites:", error);
        setFavorites([]);
        localStorage.removeItem(`favorites_${user.id}`);
      }
    } else {
      setFavorites([]);
    }
  };

  const toggleFavorite = (flatId) => {
    if (!user || user.userType !== "student") {
      alert("Please login as a student to add favorites");
      return;
    }

    console.log("Toggling favorite for flat:", flatId);
    console.log("Current favorites:", favorites);
    console.log("User ID:", user.id);

    const newFavorites = favorites.includes(flatId)
      ? favorites.filter((id) => id !== flatId)
      : [...favorites, flatId];

    console.log("New favorites:", newFavorites);

    setFavorites(newFavorites);

    try {
      localStorage.setItem(
        `favorites_${user.id}`,
        JSON.stringify(newFavorites)
      );
      console.log("Favorites saved to localStorage");
    } catch (error) {
      console.error("Error saving favorites to localStorage:", error);
      alert("Error saving to favorites. Please try again.");
    }
  };

  const handleFilterChange = (e) => {
    setFilters({
      ...filters,
      [e.target.name]: e.target.value,
    });
  };

  const handleUniversitySelect = (university) => {
    setFilters({
      ...filters,
      university: university,
    });
  };

  const clearFilters = () => {
    setFilters({
      search: "",
      minPrice: "",
      maxPrice: "",
      bedrooms: "",
      bathrooms: "",
      university: "",
      location: "",
    });
  };

  const filteredFlats = flats.filter((flat) => {
    const searchTerm = filters.search.toLowerCase();
    const universityTerm = filters.university.toLowerCase();
    const locationTerm = filters.location.toLowerCase();

    return (
      // General search in title and address
      (!filters.search ||
        flat.title.toLowerCase().includes(searchTerm) ||
        flat.address.toLowerCase().includes(searchTerm)) &&
      // Price filters
      (!filters.minPrice || flat.price >= parseInt(filters.minPrice)) &&
      (!filters.maxPrice || flat.price <= parseInt(filters.maxPrice)) &&
      // Room filters
      (!filters.bedrooms || flat.bedrooms === parseInt(filters.bedrooms)) &&
      (!filters.bathrooms || flat.bathrooms === parseInt(filters.bathrooms)) &&
      // University-based search
      (!filters.university ||
        (flat.nearbyUniversities &&
          flat.nearbyUniversities.some((uni) =>
            uni.toLowerCase().includes(universityTerm)
          ))) &&
      // Location-based search
      (!filters.location || flat.address.toLowerCase().includes(locationTerm))
    );
  });

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600 mx-auto"></div>
          <p className="mt-4 text-gray-600">Loading flats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Find Your Perfect Flat
          </h1>
          <p className="text-gray-600">
            Discover amazing student accommodations near your university
          </p>
        </div>

        {/* Quick University Selection */}
        <div className="mb-6 bg-white rounded-lg shadow-md p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
            <GraduationCap className="h-5 w-5 mr-2 text-blue-600" />
            Popular Universities
          </h3>
          <div className="flex flex-wrap gap-2">
            {popularUniversities.map((university) => (
              <button
                key={university}
                onClick={() => handleUniversitySelect(university)}
                className={`px-4 py-2 rounded-full text-sm font-medium transition-colors ${
                  filters.university === university
                    ? "bg-blue-600 text-white"
                    : "bg-gray-100 text-gray-700 hover:bg-gray-200"
                }`}
              >
                {university}
              </button>
            ))}
            {filters.university && (
              <button
                onClick={() => setFilters({ ...filters, university: "" })}
                className="px-4 py-2 rounded-full text-sm font-medium bg-red-100 text-red-700 hover:bg-red-200"
              >
                Clear University
              </button>
            )}
          </div>
        </div>

        {/* Search and Filters */}
        <div className="mb-8 bg-white rounded-lg shadow-md p-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 mb-4">
            {/* General Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Search Properties
              </label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="search"
                  value={filters.search}
                  onChange={handleFilterChange}
                  placeholder="Search by property name or area..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* University Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Near University
              </label>
              <div className="relative">
                <GraduationCap className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="university"
                  value={filters.university}
                  onChange={handleFilterChange}
                  placeholder="Enter university name..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>

            {/* Location Search */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Location
              </label>
              <div className="relative">
                <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <input
                  type="text"
                  name="location"
                  value={filters.location}
                  onChange={handleFilterChange}
                  placeholder="Enter area, city, or landmark..."
                  className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                />
              </div>
            </div>
          </div>

          <div className="flex justify-between items-center">
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              <Filter className="h-5 w-5 mr-2" />
              Advanced Filters
            </button>

            {(filters.search ||
              filters.university ||
              filters.location ||
              filters.minPrice ||
              filters.maxPrice ||
              filters.bedrooms ||
              filters.bathrooms) && (
              <button
                onClick={clearFilters}
                className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>

          {/* Advanced Filters */}
          {showFilters && (
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Min Price (₹)
                  </label>
                  <input
                    type="number"
                    name="minPrice"
                    value={filters.minPrice}
                    onChange={handleFilterChange}
                    placeholder="0"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Max Price (₹)
                  </label>
                  <input
                    type="number"
                    name="maxPrice"
                    value={filters.maxPrice}
                    onChange={handleFilterChange}
                    placeholder="50100"
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bedrooms
                  </label>
                  <select
                    name="bedrooms"
                    value={filters.bedrooms}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="">Any</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4+</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Bathrooms
                  </label>
                  <select
                    name="bathrooms"
                    value={filters.bathrooms}
                    onChange={handleFilterChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none"
                  >
                    <option value="">Any</option>
                    <option value="1">1</option>
                    <option value="2">2</option>
                    <option value="3">3</option>
                    <option value="4">4+</option>
                  </select>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Results Count and Favorites Filter */}
        <div className="mb-6 flex justify-between items-center">
          <p className="text-gray-600">
            Showing {filteredFlats.length}{" "}
            {filteredFlats.length === 1 ? "property" : "properties"}
            {filters.university && (
              <span className="ml-2 text-blue-600 font-medium">
                near {filters.university}
              </span>
            )}
          </p>

          {user && user.userType === "student" && favorites.length > 0 && (
            <Link
              to="/dashboard?tab=favorites"
              className="flex items-center text-red-600 hover:text-red-700 font-medium"
            >
              <Heart className="h-4 w-4 mr-1 fill-current" />
              View Favorites ({favorites.length})
            </Link>
          )}
        </div>

        {/* Flats Grid */}
        {filteredFlats.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredFlats.map((flat) => (
              <div
                key={flat._id}
                className="bg-white rounded-lg shadow-md overflow-hidden hover:shadow-xl transition-shadow duration-300 relative"
              >
                {/* Favorite Button */}
                {user && user.userType === "student" && (
                  <button
                    onClick={(e) => {
                      e.preventDefault();
                      toggleFavorite(flat._id);
                    }}
                    className="absolute top-3 right-3 z-10 p-2 bg-white rounded-full shadow-md hover:shadow-lg transition-shadow"
                  >
                    <Heart
                      className={`h-5 w-5 ${
                        favorites.includes(flat._id)
                          ? "text-red-500 fill-current"
                          : "text-gray-400 hover:text-red-500"
                      }`}
                    />
                  </button>
                )}

                <Link to={`/flat/${flat._id}`}>
                  <div className="aspect-w-16 aspect-h-9">
                    <img
                      src={
                        flat.images && flat.images.length > 0
                          ? `http://localhost:5010${flat.images[0]}`
                          : "https://images.pexels.com/photos/1571460/pexels-photo-1571460.jpeg"
                      }
                      alt={flat.title}
                      className="w-full h-48 object-cover"
                    />
                  </div>
                  <div className="p-6">
                    <h3 className="text-xl font-semibold text-gray-900 mb-2">
                      {flat.title}
                    </h3>
                    <div className="flex items-center text-gray-600 mb-2">
                      <MapPin className="h-4 w-4 mr-1" />
                      <span className="text-sm">{flat.address}</span>
                    </div>

                    {/* Nearby Universities */}
                    {flat.nearbyUniversities &&
                      flat.nearbyUniversities.length > 0 && (
                        <div className="mb-3">
                          <div className="flex items-center text-blue-600 mb-1">
                            <GraduationCap className="h-4 w-4 mr-1" />
                            <span className="text-sm font-medium">
                              Near Universities:
                            </span>
                          </div>
                          <div className="flex flex-wrap gap-1">
                            {flat.nearbyUniversities
                              .slice(0, 2)
                              .map((uni, index) => (
                                <span
                                  key={index}
                                  className="text-xs bg-blue-100 text-blue-700 px-2 py-1 rounded-full"
                                >
                                  {uni}
                                </span>
                              ))}
                            {flat.nearbyUniversities.length > 2 && (
                              <span className="text-xs text-gray-500">
                                +{flat.nearbyUniversities.length - 2} more
                              </span>
                            )}
                          </div>
                        </div>
                      )}

                    <div className="flex items-center space-x-4 text-gray-600 mb-3">
                      <div className="flex items-center">
                        {/* Rating */}
                        <div className="mb-3">
                          <StarRating
                            rating={
                              propertyRatings[flat._id]?.averageRating || 0
                            }
                            size="sm"
                            showNumber={true}
                            className="justify-start"
                          />
                          {propertyRatings[flat._id]?.totalRatings > 0 && (
                            <span className="text-xs text-gray-500 ml-2">
                              ({propertyRatings[flat._id].totalRatings} review
                              {propertyRatings[flat._id].totalRatings !== 1
                                ? "s"
                                : ""}
                              )
                            </span>
                          )}
                        </div>

                        <Bed className="h-4 w-4 mr-1" />
                        <span className="text-sm">{flat.bedrooms} Bed</span>
                      </div>
                      <div className="flex items-center">
                        <Bath className="h-4 w-4 mr-1" />
                        <span className="text-sm">{flat.bathrooms} Bath</span>
                      </div>
                      <div className="flex items-center">
                        <Home className="h-4 w-4 mr-1" />
                        <span className="text-sm">{flat.area} sq ft</span>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <div className="text-2xl font-bold text-blue-600">
                        ₹{flat.price.toLocaleString()}
                        <span className="text-sm text-gray-500 font-normal">
                          /month
                        </span>
                      </div>
                      <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
                        Available
                      </div>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-12">
            <Home className="h-24 w-24 text-gray-300 mx-auto mb-4" />
            <h3 className="text-xl font-semibold text-gray-900 mb-2">
              No flats found
            </h3>
            <p className="text-gray-600 mb-4">
              {filters.university
                ? `No properties found near "${filters.university}"`
                : "Try adjusting your search criteria or filters"}
            </p>
            {(filters.search || filters.university || filters.location) && (
              <button
                onClick={clearFilters}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700 transition-colors"
              >
                Clear All Filters
              </button>
            )}
          </div>
        )}

        {/* Search Tips */}
        <div className="mt-12 bg-blue-50 border border-blue-200 rounded-lg p-6">
          <h3 className="text-lg font-semibold text-blue-900 mb-3">
            💡 Search Tips
          </h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
            <div>• Use university name to find nearby accommodations</div>
            <div>• Try searching by area names or landmarks</div>
            <div>• Set price range to find budget-friendly options</div>
            <div>• Use filters to narrow down your preferences</div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default FlatListing;
