# Gramin Seva

A comprehensive, minimalistic complaint management system designed for rural India with MongoDB backend and React frontend.

## 🎯 Features

### Core Functionality
- **Multilingual Support**: Hindi, English, and 8 regional languages
- **OTP-Based Authentication**: Secure login with test OTP (123456)
- **Role-Based Access**: Citizen, Technician, and Admin roles
- **Complaint Management**: Create, track, assign, and resolve complaints
- **Photo Upload**: Support for multiple images per complaint
- **Real-time Status Tracking**: Track complaints from submission to resolution
- **Reporting**: Comprehensive monthly reports and analytics
- **Responsive Design**: Works on mobile, tablet, and desktop

### User Roles

#### 🧑 Citizen
- Register new complaints with photos
- Track complaint status
- View complaint history
- Receive notifications

#### 🔧 Technician
- View assigned complaints
- Update complaint status
- Upload resolution photos
- Track performance metrics

#### 👔 Admin
- Dashboard with analytics
- Assign complaints to technicians
- Manage technicians
- Generate monthly reports
- View all complaints with filters

## 🛠️ Technology Stack

### Backend
- **Node.js** + Express.js
- **MongoDB** with Mongoose ODM
- **JWT** for authentication
- **Multer** for file uploads
- **bcryptjs** for password hashing

### Frontend
- **React** 18
- **Lucide React** for icons
- **Axios** for API calls
- **React Router** for navigation
- **Custom CSS** (no framework dependencies)

## 📁 Project Structure

```
rural-complaint-portal/
├── backend/
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── complaintController.js
│   │   ├── technicianController.js
│   │   └── reportController.js
│   ├── models/
│   │   ├── User.js
│   │   ├── Complaint.js
│   │   └── Technician.js
│   ├── routes/
│   │   ├── auth.js
│   │   ├── complaints.js
│   │   ├── technicians.js
│   │   └── reports.js
│   ├── middleware/
│   │   ├── auth.js
│   │   └── upload.js
│   ├── uploads/ (auto-created)
│   ├── .env.example
│   ├── package.json
│   └── server.js
└── frontend/
    ├── public/
    │   └── index.html
    ├── src/
    │   ├── utils/
    │   │   └── api.js
    │   ├── context/
    │   │   └── AuthContext.js
    │   ├── App.js
    │   ├── index.js
    │   └── index.css
    └── package.json
```

## 🚀 Installation & Setup

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (v5 or higher)
- npm or yarn

### Backend Setup

1. **Navigate to backend directory**
   ```bash
   cd backend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment variables**
   ```bash
   touch .env
   ```
   
   Edit `.env` file:
   ```env
   MONGODB_URI=your_MongoDB_URI
   PORT=5000
   JWT_SECRET=your_super_secret_jwt_key_change_in_production
   TEST_OTP=123456
   ```

4. **Start the backend server**
   ```bash
   npm start
   # or for development with auto-reload
   npm run dev
   ```

   Server will run on `http://localhost:5000`

### Frontend Setup

1. **Navigate to frontend directory**
   ```bash
   cd frontend
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Start the development server**
   ```bash
   npm start
   ```

   Application will open at `http://localhost:3000`

## 🔑 Test Credentials

### OTP Authentication
- **Test OTP**: `123456`
- **Any 10-digit phone number** starting with 6-9

### Test Users
Login with any phone number and select role:
- **Citizen**: Regular user who can file complaints
- **Technician**: Field worker who resolves complaints
- **Admin**: Administrator with full access

## 📊 API Endpoints

### Authentication
```
POST   /api/auth/send-otp          - Send OTP to phone
POST   /api/auth/verify-otp        - Verify OTP and login
GET    /api/auth/profile           - Get user profile (protected)
PUT    /api/auth/profile           - Update user profile (protected)
```

### Complaints
```
POST   /api/complaints             - Create new complaint
GET    /api/complaints             - Get all complaints (with filters)
GET    /api/complaints/:id         - Get complaint by ID
GET    /api/complaints/track/:id   - Track complaint (public)
PATCH  /api/complaints/:id/status  - Update complaint status
POST   /api/complaints/:id/assign  - Assign to technician (admin)
POST   /api/complaints/:id/resolve - Mark as resolved (technician)
POST   /api/complaints/:id/notes   - Add internal note (admin)
GET    /api/complaints/stats/overview - Get statistics (admin)
```

### Technicians
```
GET    /api/technicians            - Get all technicians
GET    /api/technicians/:id        - Get technician by ID
POST   /api/technicians            - Create technician (admin)
PUT    /api/technicians/:id        - Update technician
DELETE /api/technicians/:id        - Delete technician (admin)
GET    /api/technicians/:id/stats  - Get technician stats
POST   /api/technicians/location   - Update location (technician)
```

### Reports
```
GET    /api/reports/monthly        - Get monthly report (admin)
GET    /api/reports/dashboard      - Get dashboard overview (admin)
```

## 🎨 Design System

### Color Palette
- **Primary**: `#2B5A3D` (Earth Green)
- **Secondary**: `#D97F3B` (Terracotta Orange)
- **Background**: `#FAFAF9` (Off White)
- **Surface**: `#FFFFFF` (Pure White)

### Typography
- **Primary Font**: DM Sans
- **Monospace Font**: IBM Plex Sans

### Status Colors
- **Submitted**: Yellow (`#FEF3C7`)
- **Assigned**: Blue (`#DBEAFE`)
- **In Progress**: Orange (`#FED7AA`)
- **Resolved**: Green (`#D1FAE5`)
- **Rejected**: Red (`#FEE2E2`)

## 📱 Responsive Design

The application is fully responsive with breakpoints:
- **Mobile**: < 768px
- **Tablet**: 768px - 1024px
- **Desktop**: > 1024px

All buttons are touch-friendly (minimum 48x48px) and the interface works smoothly on 2G/3G networks.

## 🔒 Security Features

- JWT-based authentication
- OTP verification for login
- Role-based access control (RBAC)
- File upload validation
- Input sanitization
- CORS protection
- Password hashing (for future enhancements)

## 📈 Performance Optimizations

- Lazy loading of images
- Pagination for large datasets
- Indexed MongoDB queries
- Optimized bundle size
- Minimal CSS (no framework overhead)
- Efficient re-renders with React

## 🧪 Testing

### Backend Testing
```bash
cd backend
npm test
```

### Frontend Testing
```bash
cd frontend
npm test
```

## 🚢 Deployment

### Backend Deployment (Example: Heroku)
```bash
heroku create rural-complaint-backend
git subtree push --prefix backend heroku main
```

### Frontend Deployment (Example: Vercel)
```bash
cd frontend
vercel deploy
```

### Environment Variables (Production)
Update the following for production:
- Change `JWT_SECRET` to a strong random string
- Set `NODE_ENV=production`
- Update `MONGODB_URI` to production database
- Remove `TEST_OTP` or use real OTP service

## 📝 Future Enhancements (Phase 2)

- [ ] WhatsApp Bot integration
- [ ] AI-based auto-assignment
- [ ] Citizen feedback/rating system
- [ ] Advanced analytics dashboard
- [ ] Push notifications
- [ ] Multi-language voice input
- [ ] Offline mode with sync
- [ ] Integration with state portals
- [ ] Bulk complaint upload
- [ ] Chatbot for FAQs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Commit your changes
4. Push to the branch
5. Open a pull request

## 📄 License

This project is licensed under the MIT License.

## 👥 Support

For support, email support@ruralcomplaint.in or join our Slack channel.

## 🙏 Acknowledgments

- Icons by Lucide React
- Fonts by Google Fonts
- Inspiration from various government e-governance projects

---

**Made with ❤️ for Rural India**
