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

## Installation Steps

### 1. Clone the Repository

```bash
git clone <repository-url>
cd student-flat-finder
```

### 2. Install Dependencies

```bash
# Install all dependencies (both frontend and backend)
npm install
```

### 3. Set Up Environment Variables

```bash
# Copy the example environment file
cp .env.example .env

# Edit the .env file with your configuration
MONGODB_URI=mongodb://localhost:27017/flatfinder
JWT_SECRET=your_jwt_secret_key_here
PORT=5010
```

### 4. Set Up MongoDB

#### Option A: Local MongoDB

1. Install MongoDB on your system
2. Start MongoDB service:

   ```bash
   # On Windows
   net start MongoDB

   # On macOS
   brew services start mongodb/brew/mongodb-community

   # On Linux
   sudo systemctl start mongod
   ```

#### Option B: MongoDB Atlas (Cloud)

1. Create a free account at [MongoDB Atlas](https://www.mongodb.com/cloud/atlas)
2. Create a new cluster
3. Get your connection string
4. Update the MONGODB_URI in your .env file

### 5. Create Required Directories

```bash
# Create uploads directory for file storage
mkdir server/uploads
```

## Running the Application

### Development Mode

```bash
# Start both frontend and backend simultaneously
npm run dev
```

This will start:

- Frontend on http://localhost:5173
- Backend on http://localhost:5010

### Individual Services

```bash
# Start only frontend
npm run client

# Start only backend
npm run server
```

## Project Structure

```
student-flat-finder/
├── src/                          # Frontend React application
│   ├── components/               # Reusable React components
│   │   ├── Navbar.jsx
│   │   └── Footer.jsx
│   ├── pages/                    # Page components
│   │   ├── Home.jsx
│   │   ├──AddProperty.jsx
        ├── Login.jsx
│   │   ├── Register.jsx
│   │   ├── FlatListing.jsx
│   │   ├── FlatDetails.jsx
│   │   ├── Dashboard.jsx
│   │   ├── BrokerDashboard.jsx
│   │   └── AddProperty.jsx
│   ├── context/                  # React context providers
│   │   └── AuthContext.jsx
│   ├── services/                 # API services
│   │   └── api.js
│   └── App.jsx                   # Main App component
├── server/                       # Backend Express application
│   ├── index.js                  # Main server file
│   └── uploads/                  # File upload directory
├── public/                       # Static files
├── package.json                  # Dependencies and scripts
└── README.md                     # This file
```

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

## Troubleshooting

### Common Issues:

1. **MongoDB Connection Error**

   - Ensure MongoDB is running
   - Check connection string in .env file
   - Verify network connectivity

2. **Port Already in Use**

   - Change PORT in .env file
   - Kill existing processes using the port

3. **Dependencies Issues**

   - Delete node_modules and package-lock.json
   - Run `npm install` again

4. **CORS Errors**
   - Ensure backend is running on port 5010
   - Check API base URL in src/services/api.js

### Useful Commands:

```bash
# Check if MongoDB is running
mongosh

# Check running processes on port 5010
lsof -i :5010

# Kill process on specific port
kill -9 $(lsof -t -i:5010)
```

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License


## Support

If you encounter any issues or have questions, please:

1. Check this README file
2. Search existing issues
3. Create a new issue with detailed information
