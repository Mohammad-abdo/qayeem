# Qayeem Frontend - Next.js Application

نظام قيم - Frontend built with Next.js, Tailwind CSS, and JavaScript (no TypeScript).

## Features

- ✅ Authentication (Login, Register, Forgot Password)
- ✅ Dashboard with sidebar navigation
- ✅ Books Management
- ✅ Payments Management
- ✅ Evaluations Management
- ✅ RTL Support for Arabic
- ✅ Dark Mode Support
- ✅ Responsive Design

## Getting Started

### Prerequisites

- Node.js 18+ installed
- Backend API running on `http://localhost:5000`

### Installation

1. Install dependencies:
```bash
cd frontend
npm install
```

2. Create `.env.local` file:
```bash
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

3. Run the development server:
```bash
npm run dev
```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

## Project Structure

```
frontend/
├── app/                    # Next.js App Router pages
│   ├── login/             # Login page
│   ├── register/          # Register page
│   ├── dashboard/         # Dashboard pages
│   │   ├── books/         # Books management
│   │   ├── payments/      # Payments management
│   │   └── evaluations/   # Evaluations management
│   └── layout.js          # Root layout
├── components/            # Reusable components
│   └── DashboardLayout.js # Main dashboard layout
├── context/               # React Context providers
│   ├── AuthContext.js     # Authentication context
│   └── ThemeContext.js    # Theme (dark/light) context
├── lib/                   # Utilities
│   └── api.js             # API client
└── package.json
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm start` - Start production server
- `npm run lint` - Run ESLint

## Environment Variables

Create a `.env.local` file in the `frontend` directory:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Features

### Authentication
- Login/Register pages with form validation
- JWT token management with cookies
- Protected routes
- Forgot password flow

### Dashboard
- Responsive sidebar navigation
- Dark mode toggle
- User profile display
- Notification center (UI ready)

### Books Management
- List all books
- Search functionality
- Admin: Create, Edit, Delete books
- View book details

### Payments Management
- List all payments (Admin) or user payments
- Filter by status
- Admin: Update payment status
- Payment history

### Evaluations Management
- List all evaluations
- Create, Edit, Delete evaluations
- Clone evaluations
- Archive evaluations
- View evaluation details

## Notes

- All pages support RTL (Right-to-Left) for Arabic
- Dark mode is supported throughout the application
- The app uses `react-hot-toast` for notifications
- Form validation uses `react-hook-form` and `zod`
- API client uses `axios` with interceptors for authentication

## Next Steps

1. Complete remaining pages (Book detail, Book form, Evaluation detail, etc.)
2. Add more advanced features (search, filters, pagination)
3. Implement real-time notifications
4. Add more charts and analytics
5. Implement file upload functionality


