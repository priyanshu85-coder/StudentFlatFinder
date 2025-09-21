import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import {
  Home,
  User,
  LogOut,
  Menu,
  X,
  Building,
  Shield,
  Settings,
  ChevronDown,
  Edit,
  Heart,
} from "lucide-react";
import ApartmentImage from "../images/apartment.png";

const Navbar = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isProfileDropdownOpen, setIsProfileDropdownOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/");
    setIsMenuOpen(false);
    setIsProfileDropdownOpen(false);
  };

  const closeMenu = () => {
    setIsMenuOpen(false);
    setIsProfileDropdownOpen(false);
  };

  const getDashboardLink = () => {
    if (user?.userType === "admin") return "/admin-dashboard";
    if (user?.userType === "broker") return "/broker-dashboard";
    return "/dashboard";
  };

  const getProfileLink = () => {
    if (user?.userType === "admin") return "/admin-profile";
    if (user?.userType === "broker") return "/broker-profile";
    return "/dashboard"; // Students use dashboard as profile
  };

  const handleProfileAction = (action) => {
    if (action === "view") {
      navigate("/dashboard?tab=profile");
    } else if (action === "edit") {
      navigate("/dashboard?tab=profile&edit=true");
    }
    setIsProfileDropdownOpen(false);
    setIsMenuOpen(false);
  };

  return (
    <nav className="fixed top-0 left-0 right-0 bg-white shadow-lg z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link
              to="/"
              className="flex items-center space-x-2"
              onClick={closeMenu}
            >
              {/* apartment image */}
              <img src={ApartmentImage} style={{ width: "40px" }} />

              {/* <Building className="h-8 w-8 text-blue-600" /> */}
              <span className="text-xl font-bold bg-gradient-to-r from-red-600 to-purple-600 bg-clip-text text-transparent">
                FlatFinder
              </span>
            </Link>
          </div>

          {/* Desktop Menu */}
          <div className="hidden md:flex items-center space-x-8">
            <Link
              to="/flats"
              className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
            >
              Find Flats
            </Link>

            {user ? (
              <>
                <Link
                  to={getDashboardLink()}
                  className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  {user.userType === "admin" ? (
                    <Shield className="h-4 w-4" />
                  ) : (
                    <User className="h-4 w-4" />
                  )}
                  <span>Dashboard</span>
                </Link>

                {/* Profile Dropdown for Students */}
                {user.userType === "student" ? (
                  <div className="relative">
                    <button
                      onClick={() =>
                        setIsProfileDropdownOpen(!isProfileDropdownOpen)
                      }
                      className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                    >
                      <Settings className="h-4 w-4" />
                      <span>Profile</span>
                      <ChevronDown
                        className={`h-4 w-4 transition-transform ${
                          isProfileDropdownOpen ? "rotate-180" : ""
                        }`}
                      />
                    </button>

                    {isProfileDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 border border-gray-200">
                        <button
                          onClick={() => handleProfileAction("view")}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <User className="h-4 w-4 mr-3" />
                          View Profile
                        </button>
                        <button
                          onClick={() => handleProfileAction("edit")}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <Edit className="h-4 w-4 mr-3" />
                          Edit Profile
                        </button>
                        <button
                          onClick={() => navigate("/dashboard?tab=favorites")}
                          className="flex items-center w-full px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 transition-colors"
                        >
                          <Heart className="h-4 w-4 mr-3" />
                          My Favorites
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  /* Profile Link for Admin/Broker */
                  <Link
                    to={getProfileLink()}
                    className="flex items-center space-x-1 text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                  >
                    <Settings className="h-4 w-4" />
                    <span>Profile</span>
                  </Link>
                )}

                {user.userType === "broker" && (
                  <Link
                    to="/add-property"
                    className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                  >
                    Add Property
                  </Link>
                )}

                {/* User Info */}
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                    <span className="text-blue-600 font-semibold text-sm">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div className="hidden lg:block">
                    <p className="text-sm font-medium text-gray-900">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {user.userType}
                    </p>
                  </div>
                </div>

                <button
                  onClick={handleLogout}
                  className="flex items-center space-x-1 text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  <LogOut className="h-4 w-4" />
                  <span>Logout</span>
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium transition-colors"
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="bg-blue-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-blue-700 transition-colors"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="text-gray-700 hover:text-blue-600 focus:outline-none focus:text-blue-600"
            >
              {isMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-white border-t border-gray-200">
          <div className="px-2 pt-2 pb-3 space-y-1">
            <Link
              to="/flats"
              className="block px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors"
              onClick={closeMenu}
            >
              Find Flats
            </Link>

            {user ? (
              <>
                {/* User Info Mobile */}
                <div className="flex items-center px-3 py-2 bg-gray-50 rounded-lg mx-3 my-2">
                  <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center mr-3">
                    <span className="text-blue-600 font-semibold">
                      {user.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {user.name}
                    </p>
                    <p className="text-xs text-gray-500 capitalize">
                      {user.userType}
                    </p>
                  </div>
                </div>

                <Link
                  to={getDashboardLink()}
                  className="block px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                  onClick={closeMenu}
                >
                  Dashboard
                </Link>

                {/* Mobile Profile Options for Students */}
                {user.userType === "student" ? (
                  <>
                    <button
                      onClick={() => handleProfileAction("view")}
                      className="flex items-center w-full px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      <User className="h-4 w-4 mr-2" />
                      View Profile
                    </button>
                    <button
                      onClick={() => handleProfileAction("edit")}
                      className="flex items-center w-full px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      <Edit className="h-4 w-4 mr-2" />
                      Edit Profile
                    </button>
                    <button
                      onClick={() => {
                        navigate("/dashboard?tab=favorites");
                        closeMenu();
                      }}
                      className="flex items-center w-full px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                    >
                      <Heart className="h-4 w-4 mr-2" />
                      My Favorites
                    </button>
                  </>
                ) : (
                  <Link
                    to={getProfileLink()}
                    className="block px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                    onClick={closeMenu}
                  >
                    Profile
                  </Link>
                )}

                {user.userType === "broker" && (
                  <Link
                    to="/add-property"
                    className="block px-3 py-2 text-blue-600 font-medium transition-colors"
                    onClick={closeMenu}
                  >
                    Add Property
                  </Link>
                )}
                <button
                  onClick={handleLogout}
                  className="block w-full text-left px-3 py-2 text-red-600 hover:text-red-700 transition-colors"
                >
                  Logout
                </button>
              </>
            ) : (
              <>
                <Link
                  to="/login"
                  className="block px-3 py-2 text-gray-700 hover:text-blue-600 transition-colors"
                  onClick={closeMenu}
                >
                  Login
                </Link>
                <Link
                  to="/register"
                  className="block px-3 py-2 text-blue-600 font-medium transition-colors"
                  onClick={closeMenu}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}

      {/* Overlay to close dropdown when clicking outside */}
      {isProfileDropdownOpen && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setIsProfileDropdownOpen(false)}
        ></div>
      )}
    </nav>
  );
};

export default Navbar;
