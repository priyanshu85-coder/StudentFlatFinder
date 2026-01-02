# MERN Application Setup Checklist

## Pre-Setup
- [ ] Read QUICK_START.md (5 min read)
- [ ] Create MongoDB Atlas account
- [ ] Have Node.js 16+ installed
- [ ] Have npm or yarn available
- [ ] Clone/download this project

## MongoDB Atlas Setup
- [ ] Go to https://www.mongodb.com/cloud/atlas
- [ ] Create free account
- [ ] Create new project
- [ ] Create free cluster (M0)
- [ ] Add database user (e.g., admin / password)
- [ ] Whitelist IP (0.0.0.0/0 for development)
- [ ] Copy connection string
- [ ] Replace username/password in connection string
- [ ] Connection string format: mongodb+srv://user:pass@cluster.mongodb.net/merndb

## Backend Setup
- [ ] Navigate to backend directory: `cd backend`
- [ ] Install dependencies: `npm install`
- [ ] Create `.env` file
- [ ] Add MONGODB_URI to .env
- [ ] Add JWT_SECRET to .env
- [ ] Add PORT=5000 to .env
- [ ] Verify .env is in .gitignore
- [ ] Start backend: `npm run dev`
- [ ] Verify "Server running on port 5000"
- [ ] Test health endpoint: curl http://localhost:5000/api/health

## Frontend Setup (New Terminal)
- [ ] Navigate to project root
- [ ] Install dependencies: `npm install`
- [ ] Create `.env` file
- [ ] Add VITE_API_URL=http://localhost:5000/api
- [ ] Start frontend: `npm run dev`
- [ ] Verify "VITE v5.x.x building for development..."
- [ ] Browser opens http://localhost:5173

## Local Testing
- [ ] Access http://localhost:5173 in browser
- [ ] Click "Create one" to go to registration
- [ ] Register with test account
  - [ ] Name: Test User
  - [ ] Email: test@example.com
  - [ ] Password: test1234
  - [ ] Confirm: test1234
- [ ] Click "Sign Up"
- [ ] Verify redirected to Dashboard
- [ ] Verify user name shows in header
- [ ] Click "Create New Todo"
- [ ] Add test todo
  - [ ] Title: "Buy groceries"
  - [ ] Description: "Milk, eggs, bread"
  - [ ] Priority: High
- [ ] Click "Create Todo"
- [ ] Verify todo appears in list
- [ ] Click checkbox to mark complete
- [ ] Verify todo shows completed state
- [ ] Click delete (X) button
- [ ] Click OK to confirm
- [ ] Verify todo is deleted
- [ ] Click Logout
- [ ] Verify redirected to login page
- [ ] Login with same credentials
- [ ] Verify dashboard shows (old data not there - new session)

## Frontend Build Test
- [ ] Open new terminal at project root
- [ ] Run: `npm run build`
- [ ] Verify build succeeds
- [ ] Check dist/ folder created
- [ ] Verify files: index.html, assets/

## Code Review Checklist
- [ ] All files have comments
- [ ] Backend routes are clearly named
- [ ] Controllers have business logic separated
- [ ] Models have proper validation
- [ ] Middleware handles auth correctly
- [ ] Frontend pages are styled consistently
- [ ] Error messages are user-friendly
- [ ] Loading states are shown
- [ ] Console has no errors
- [ ] Network requests use JWT token

## Security Checklist
- [ ] Passwords are hashed (check bcryptjs)
- [ ] JWT token is generated on login
- [ ] Token is stored in localStorage
- [ ] Protected routes check authentication
- [ ] User can only access their own todos
- [ ] CORS is configured
- [ ] Environment variables not exposed
- [ ] .env files not in git
- [ ] API errors don't leak sensitive info

## API Endpoints Verification
Test these endpoints with curl or Postman:

### Authentication
- [ ] POST /api/auth/register - Creates new account
- [ ] POST /api/auth/login - Returns JWT token
- [ ] GET /api/auth/me - Returns current user (needs token)

### Todos
- [ ] GET /api/todos - Get all todos (needs token)
- [ ] POST /api/todos - Create new todo (needs token)
- [ ] PUT /api/todos/:id - Update todo (needs token)
- [ ] DELETE /api/todos/:id - Delete todo (needs token)

## Documentation Review
- [ ] Read QUICK_START.md
- [ ] Read MERN_README.md
- [ ] Read DEPLOYMENT.md
- [ ] Read ARCHITECTURE.md
- [ ] Read PROJECT_SUMMARY.md

## Deployment Preparation (When Ready)
- [ ] Create Render account
- [ ] Create Vercel account
- [ ] Review DEPLOYMENT.md
- [ ] Set up environment variables on Render
- [ ] Set up environment variables on Vercel
- [ ] Deploy backend to Render
- [ ] Get backend URL from Render
- [ ] Update VITE_API_URL in Vercel
- [ ] Deploy frontend to Vercel
- [ ] Test production app
- [ ] Monitor logs for errors

## Production Checklist
- [ ] Change JWT_SECRET to strong random string
- [ ] Enable HTTPS (automatic on Vercel/Render)
- [ ] Add database backups
- [ ] Monitor error logs
- [ ] Test all authentication flows
- [ ] Test all CRUD operations
- [ ] Verify token expiration works
- [ ] Test logout functionality
- [ ] Check mobile responsiveness
- [ ] Verify CORS works from production domain

## Optional Enhancements
- [ ] Add email verification
- [ ] Add password reset
- [ ] Add todo categories
- [ ] Add todo sharing
- [ ] Add due dates filtering
- [ ] Add search functionality
- [ ] Add dark mode
- [ ] Add notifications
- [ ] Add rate limiting
- [ ] Add API documentation (Swagger)

## Troubleshooting Checklist
If something doesn't work:
- [ ] Check browser console (F12) for errors
- [ ] Check backend terminal for errors
- [ ] Verify backend is running (localhost:5000)
- [ ] Verify frontend can reach backend
- [ ] Check .env files have correct values
- [ ] Verify MongoDB connection string
- [ ] Test API with curl/Postman
- [ ] Check network tab in DevTools
- [ ] Verify token is being sent
- [ ] Check logs for 401/403 errors

## Clean Up Before Deployment
- [ ] Remove console.log statements
- [ ] Remove test data from MongoDB
- [ ] Review error messages
- [ ] Test in production mode (npm run build + preview)
- [ ] Check bundle size
- [ ] Optimize images
- [ ] Remove unused dependencies

## Final Verification
- [ ] ✅ Backend runs without errors
- [ ] ✅ Frontend builds successfully
- [ ] ✅ Can register new user
- [ ] ✅ Can login to dashboard
- [ ] ✅ Can create todos
- [ ] ✅ Can update todos
- [ ] ✅ Can delete todos
- [ ] ✅ Can logout
- [ ] ✅ All 7 API endpoints work
- [ ] ✅ Responsive design looks good
- [ ] ✅ No console errors
- [ ] ✅ Ready for deployment!

## Resources
- MongoDB Atlas: https://www.mongodb.com/cloud/atlas
- Render: https://render.com
- Vercel: https://vercel.com
- Express Docs: https://expressjs.com
- React Docs: https://react.dev
- Mongoose Docs: https://mongoosejs.com

---

**Status: READY FOR USE!** 🎉

Once you've completed this checklist, your MERN application is fully functional and ready to share or deploy to production.
