# Student Flat Finder Website

A comprehensive flat finder website for students to find accommodations near their universities. Built with React.js frontend, Express.js backend, and MongoDB database.

## Features

### For Students:

- Register and create student profiles
- Search for flats near universities
- Filter by price, bedrooms, bathrooms, and location
- View detailed property information
- Track viewed properties in dashboard
- Contact brokers directly

### For Brokers:

- Register as property brokers
- Add and manage property listings
- Upload property images
- Track property views and inquiries
- Comprehensive broker dashboard
- Manage multiple properties

### General Features:

- User authentication with JWT tokens
- Responsive design for all devices
- Modern UI with Tailwind CSS
- Image upload and storage
- Search and filter functionality
- Real-time property updates

## Tech Stack

- **Frontend**: React.js, Tailwind CSS, Lucide React Icons
- **Backend**: Node.js, Express.js
- **Database**: MongoDB with Mongoose
- **Authentication**: JWT (JSON Web Tokens)
- **File Upload**: Multer
- **Styling**: Tailwind CSS

## Prerequisites

Before running this application, make sure you have the following installed:

- Node.js (v14 or higher)
- MongoDB (local installation or MongoDB Atlas)
- npm or yarn package manager

## Running the Application

### Development Mode

```bash
# Start both frontend and backend simultaneously
npm run dev
```

This will start:

- Frontend on https://studentflatfinder.vercel.app/
- Backend on https://studentflatfinder.onrender.com

### Individual Services

```bash
# Start only frontend
npm run client

# Start only backend
npm run server
```

## Project Structure

```
studentflatfinder/
├── src/                          # Frontend React application
│   ├── components/               # Reusable React components
│   │   ├── Errorboundary.jsx
│   │   └── Footer.jsx
│   │   ├── Navbar.jsx
│   │   └── ProtectionRoute.jsx
│   │   ├── RatingModal.jsx
│   │   └── StarRating.jsx
│   ├── pages/                    # Page components
│   │   ├── AddProperty.jsx
│   │   ├──AdminDashboard.jsx
        ├── AdminProfile.jsx
│   │   ├── BrokerDashboard.jsx
│   │   ├── Dashboard.jsx
│   │   ├── EditProperty.jsx
│   │   ├── FlatDetails.jsx
│   │   ├── FlatListing.jsx
│   │   └── Home.jsx
│   │   ├── Login.jsx
│   │   ├── Register.jsx
│   ├── context/                  # React context providers
│   │   └── AuthContext.jsx
│   ├── services/                 # API services
│   │   └── api.js
│   └── App.jsx                   # Main App component
│   └── index.css
│   └── main.jsx
├── server/                       # Backend Express application
│   ├── index.js                  # Main server file
│   └── uploads/                  # File upload directory
├── public/                       # Static files
├── package.json                  # Dependencies and scripts
└── README.md                     # This file


## API Endpoints

### Authentication

- `POST /api/auth/register` - Register new user
- `POST /api/auth/login` - User login
- `GET /api/auth/me` - Get current user

### Properties

- `GET /api/properties` - Get all properties
- `GET /api/properties/:id` - Get property by ID
- `POST /api/properties` - Add new property (brokers only)
- `GET /api/properties/broker/my-properties` - Get broker's properties
- `DELETE /api/properties/:id` - Delete property (owner only)

## Usage Instructions

### For Students:

1. Register with student account
2. Browse available flats
3. Use filters to find suitable properties
4. View property details
5. Contact brokers for inquiries

### For Brokers:

1. Register with broker account
2. Access broker dashboard
3. Add new properties with details
4. Manage existing listings
5. Track property performance

## Support

If you encounter any issues or have questions, please:
1. Check this README file
2. Search existing issues
3. Create a new issue with detailed information
