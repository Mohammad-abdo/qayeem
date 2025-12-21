# Frontend Setup Instructions

## Quick Start

1. **Install Dependencies**
   ```bash
   cd frontend
   npm install
   ```

2. **Create Environment File**
   
   Create a `.env.local` file in the `frontend` directory:
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:5000/api
   ```

3. **Start Development Server**
   ```bash
   npm run dev
   ```

4. **Open Browser**
   
   Navigate to [http://localhost:3000](http://localhost:3000)

## Important Notes

### Backend Connection
- Make sure the backend server is running on port 5000
- Update `NEXT_PUBLIC_API_URL` if your backend runs on a different port

### Authentication
- Default login page: `/login`
- Register page: `/register`
- After login, users are redirected to `/dashboard`

### Features Implemented

✅ **Authentication**
- Login page with email/password
- Register page
- Forgot password page
- JWT token management

✅ **Dashboard**
- Responsive sidebar navigation
- Dark mode toggle
- User profile display
- Protected routes

✅ **Pages Created**
- Dashboard home (`/dashboard`)
- Books management (`/dashboard/books`)
- Payments (`/dashboard/payments`)
- Evaluations (`/dashboard/evaluations`)
- Users management (`/dashboard/users`) - Admin only
- Settings (`/dashboard/settings`)

✅ **Features**
- RTL (Right-to-Left) support for Arabic
- Dark mode support
- Responsive design
- Form validation
- API integration

## Next Steps

1. Complete remaining pages:
   - Book detail page
   - Book form (create/edit)
   - Evaluation detail page
   - Evaluation form (create/edit)

2. Enhance existing pages:
   - Add pagination
   - Improve search functionality
   - Add filters
   - Add charts and analytics

3. Add more features:
   - File uploads
   - Real-time notifications
   - Advanced search
   - Export functionality

## Troubleshooting

### Issue: Cannot connect to backend
- Check if backend is running on port 5000
- Verify `NEXT_PUBLIC_API_URL` in `.env.local`
- Check browser console for CORS errors

### Issue: Authentication not working
- Check if cookies are enabled
- Verify JWT token is being stored
- Check backend authentication endpoint

### Issue: RTL not working
- Verify `dir="rtl"` in layout.js
- Check Tailwind CSS configuration
- Ensure Arabic fonts are loaded


