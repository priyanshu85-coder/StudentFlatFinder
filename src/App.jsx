//import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ErrorBoundary from './components/ErrorBoundary';
import Navbar from './components/Navbar';
import Home from './pages/Home';
import Login from './pages/Login';
import Register from './pages/Register';
import FlatListing from './pages/FlatListing';
import FlatDetails from './pages/FlatDetails';
import Dashboard from './pages/Dashboard';
import BrokerDashboard from './pages/BrokerDashboard';
import BrokerProfile from './pages/BrokerProfile';
import AdminDashboard from './pages/AdminDashboard';
import AdminProfile from './pages/AdminProfile';
import AddProperty from './pages/AddProperty';
import EditProperty from './pages/EditProperty';
import Footer from './components/Footer';



function App() {

  
  return (
   
    <ErrorBoundary>
       
      <AuthProvider>
        
        <Router>
          
          
          <div className="min-h-screen bg-gray-50">
            
     
            <Navbar />
            <main className="pt-16">
          
              <ErrorBoundary>
                <Routes>
                  
                  <Route path="/" element={<Home />} />
                  <Route path="/login" element={<Login />} />
                  <Route path="/register" element={<Register />} />
                  <Route path="/flats" element={<FlatListing />} />
                  <Route path="/flat/:id" element={<FlatDetails />} />
                  <Route path="/dashboard" element={<Dashboard />} />
                  <Route path="/broker-dashboard" element={<BrokerDashboard />} />
                  <Route path="/broker-profile" element={<BrokerProfile />} />
                  <Route path="/admin-dashboard" element={<AdminDashboard />} />
                  <Route path="/admin-profile" element={<AdminProfile />} />
                  <Route path="/add-property" element={<AddProperty />} />
                  <Route path="/edit-property/:id" element={<EditProperty />} />
                </Routes>
              </ErrorBoundary>
            </main>
            <Footer />
          </div>
        </Router>
      </AuthProvider>
    </ErrorBoundary>
    
  );
}

export default App;