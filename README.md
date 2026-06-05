# SewerGuard - Smart Sewer Management System

A complete, production-ready sewer management system with real-time monitoring, alerts, and reporting capabilities.

## Features

### 🎯 Core Features
- **Real-time Monitoring**: Track sewer systems with IoT sensors
- **Alert Management**: Automatic alerts for anomalies
- **Role-Based Access**: Admin, Supervisor, and Worker roles
- **Data Visualization**: Charts and analytics dashboards
- **Report Generation**: PDF reports for analysis
- **Device Management**: Monitor and manage IoT devices
- **Worker Management**: Assign and track field workers
- **Task Management**: Create and track maintenance tasks

### 🔐 Security
- JWT token-based authentication
- Role-based access control (RBAC)
- Password hashing with bcrypt
- CORS enabled
- Input validation

### 📊 Dashboards
- **Admin**: Full system overview, device management, user management
- **Supervisor**: Team management, alert monitoring, task assignment
- **Worker**: Personal dashboard, assigned device monitoring

## Quick Start

### Prerequisites
- Node.js 16+ 
- npm or yarn

### Installation

1. **Clone or navigate to the project**
```bash
cd d:\sewer_guard\sewerguard
```

2. **Backend Setup**
```bash
cd backend
npm install
npm run dev
```
Backend runs on `http://localhost:5000`

3. **Frontend Setup** (in a new terminal)
```bash
cd frontend
npm install
npm run dev
```
Frontend runs on `http://localhost:3000`

## Demo Accounts

Login with any of these demo accounts:

### Admin
- **Email**: admin@sewerguard.com
- **Password**: admin123

### Supervisor
- **Email**: supervisor@sewerguard.com
- **Password**: supervisor123

### Supervisor 2
- **Email**: supervisor2@sewerguard.com
- **Password**: supervisor123

### Worker 1
- **Email**: worker@sewerguard.com
- **Password**: worker123

### Worker 2
- **Email**: worker2@sewerguard.com
- **Password**: worker123

## API Endpoints

### Authentication
- `POST /api/auth/login` - Login user
- `POST /api/auth/register` - Register new user
- `POST /api/auth/verify` - Verify token
- `GET /api/auth/demo-users` - Get demo users

### Dashboard
- `GET /api/dashboard/stats` - Get dashboard statistics
- `GET /api/dashboard/overview` - Get system overview
- `GET /api/dashboard/recent-alerts` - Get recent alerts
- `GET /api/dashboard/device-health` - Get device health

### Alerts
- `GET /api/alerts` - Get all alerts
- `GET /api/alerts/:id` - Get alert by ID
- `POST /api/alerts` - Create alert
- `PATCH /api/alerts/:id/status` - Update alert status
- `DELETE /api/alerts/:id` - Delete alert

### Devices
- `GET /api/devices` - Get all devices
- `GET /api/devices/:id` - Get device by ID
- `POST /api/devices` - Create device
- `PUT /api/devices/:id` - Update device
- `DELETE /api/devices/:id` - Delete device

### Sensors
- `GET /api/sensors` - Get all sensors
- `GET /api/sensors/:id` - Get sensor by ID
- `GET /api/sensors/:id/readings` - Get sensor readings
- `POST /api/sensors/:id/reading` - Add reading
- `POST /api/sensors` - Create sensor

### Workers
- `GET /api/workers` - Get all workers
- `GET /api/workers/:id` - Get worker by ID
- `POST /api/workers` - Create worker
- `PUT /api/workers/:id` - Update worker
- `DELETE /api/workers/:id` - Delete worker

### Reports
- `GET /api/reports` - Get all reports
- `POST /api/reports/generate/monthly` - Generate monthly report
- `POST /api/reports/generate/health` - Generate health report
- `POST /api/reports/generate/alert-analysis` - Generate alert analysis

### Supervisors
- `GET /api/supervisors` - Get all supervisors
- `POST /api/supervisors` - Create supervisor
- `PUT /api/supervisors/:id` - Update supervisor
- `DELETE /api/supervisors/:id` - Delete supervisor

## Project Structure

```
sewerguard/
├── backend/
│   ├── config/
│   │   └── db.js              # In-memory database
│   ├── middleware/
│   │   └── auth.js            # JWT authentication
│   ├── routes/
│   │   ├── auth.js
│   │   ├── alerts.js
│   │   ├── devices.js
│   │   ├── sensors.js
│   │   ├── workers.js
│   │   ├── supervisors.js
│   │   ├── reports.js
│   │   └── dashboard.js
│   ├── server.js              # Main server file
│   ├── package.json
│   └── vercel.json
├── frontend/
│   ├── src/
│   │   ├── api/               # API client
│   │   ├── components/        # Reusable components
│   │   ├── context/           # Auth context
│   │   ├── pages/
│   │   │   ├── Login.jsx
│   │   │   ├── admin/         # Admin pages
│   │   │   ├── supervisor/    # Supervisor pages
│   │   │   └── worker/        # Worker pages
│   │   ├── App.jsx
│   │   └── main.jsx
│   ├── index.html
│   ├── package.json
│   ├── vite.config.js
│   └── tailwind.config.js
└── README.md
```

## Deployment

### Vercel Deployment

1. **Backend (Vercel)**
```bash
cd backend
vercel deploy
```

2. **Frontend (Vercel)**
```bash
cd frontend
vercel deploy
```

Update frontend `.env` with backend URL after deployment.

### Docker Deployment

Create a Dockerfile for backend:

```dockerfile
FROM node:18
WORKDIR /app
COPY backend/ .
RUN npm install
EXPOSE 5000
CMD ["npm", "start"]
```

## Technologies Used

### Backend
- **Node.js** - Runtime environment
- **Express.js** - Web framework
- **JWT** - Authentication
- **Bcrypt** - Password hashing
- **CORS** - Cross-origin requests

### Frontend
- **React** - UI library
- **Vite** - Build tool
- **Tailwind CSS** - Styling
- **Recharts** - Data visualization
- **Lucide React** - Icons
- **React Router** - Navigation
- **Axios** - HTTP client

## Features Breakdown

### Admin Dashboard
- View all devices and their status
- Manage workers and supervisors
- Create and manage alerts
- Generate reports
- System settings and monitoring
- View real-time device health

### Supervisor Dashboard
- Monitor team members
- Assign tasks to workers
- View and resolve alerts
- Track team performance
- Monitor device metrics

### Worker Dashboard
- View assigned devices
- Monitor sensor data
- Accept assigned tasks
- Track personal performance
- View device locations

## Browser Support
- Chrome/Edge 90+
- Firefox 88+
- Safari 14+

## Environment Variables

### Backend (.env)
```
PORT=5000
NODE_ENV=development
JWT_SECRET=your-secret-key
```

### Frontend (.env)
```
VITE_API_URL=http://localhost:5000/api
```

## License

MIT License - See LICENSE file for details

## Support

For support, create an issue on the project repository or contact the development team.

---

**SewerGuard v1.0.0** - Smart Sewer Management Made Easy
