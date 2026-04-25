# SmartSeason Field Monitoring System

A full-stack web application for tracking crop progress across multiple fields during a growing season. Built with Django (backend) and React (frontend).

## Overview

SmartSeason helps agricultural coordinators and field agents monitor crop development through a clean, intuitive interface. The system supports two user roles:

- **Admin (Coordinator)**: Manage all fields, assign them to agents, and monitor progress across the operation
- **Field Agent**: Update field status, add observations, and track assigned fields

## Features

### Core Functionality
- **User Authentication**: Secure JWT-based authentication with role-based access control
- **Field Management**: Create, view, and manage fields with crop type, planting date, and current stage
- **Field Updates**: Agents can update field stages and add notes/observations
- **Status Tracking**: Automatic field status calculation (Active, At Risk, Completed)
- **Dashboard**: Role-specific dashboards with field summaries and visual insights
- **Field Stages**: Planted → Growing → Ready → Harvested

### Field Status Logic

The system automatically calculates field status based on:

1. **Completed**: Field is in "Harvested" stage
2. **At Risk**: Field has been in "Planted" stage for more than 30 days (indicates potential issues)
3. **Active**: All other fields in progress

This logic can be extended in `core/models.py` with more sophisticated rules (weather data, soil conditions, etc.).

## Tech Stack

### Backend
- **Framework**: Django 5.2
- **API**: Django REST Framework
- **Authentication**: JWT (djangorestframework-simplejwt)
- **Database**: SQLite (development)
- **CORS**: django-cors-headers

### Frontend
- **Framework**: React 19
- **Styling**: Tailwind CSS 4
- **UI Components**: shadcn/ui
- **Routing**: Wouter
- **HTTP Client**: Axios
- **Charts**: Recharts
- **State Management**: React Context API

## Project Structure

```
smartseason/
├── backend/                 # Django project settings
│   ├── settings.py         # Configuration
│   ├── urls.py             # URL routing
│   └── wsgi.py             # WSGI application
├── core/                    # Django app with models and views
│   ├── models.py           # Database models
│   ├── views.py            # API views
│   ├── serializers.py      # DRF serializers
│   ├── migrations/         # Database migrations
│   └── admin.py            # Django admin configuration
├── manage.py               # Django management script
├── db.sqlite3              # SQLite database
└── requirements.txt        # Python dependencies

frontend/                    # React application
├── client/
│   ├── src/
│   │   ├── pages/          # Page components
│   │   ├── components/     # Reusable components
│   │   ├── contexts/       # React contexts
│   │   ├── App.tsx         # Main app component
│   │   ├── index.css       # Global styles
│   │   └── main.tsx        # Entry point
│   ├── public/             # Static assets
│   └── index.html          # HTML template
├── package.json            # Node dependencies
└── vite.config.ts          # Vite configuration
```

## Setup Instructions

### Backend Setup

1. **Install Python dependencies**:
   ```bash
   cd smartseason
   pip install django djangorestframework django-cors-headers djangorestframework-simplejwt
   ```

2. **Run migrations**:
   ```bash
   python manage.py migrate
   ```

3. **Create initial data** (optional - already included in migrations):
   ```bash
   python manage.py shell
   # Then run the commands from the setup script
   ```

4. **Start the development server**:
   ```bash
   python manage.py runserver 8000
   ```

The backend will be available at `http://localhost:8000/api/`

### Frontend Setup

1. **Install Node dependencies**:
   ```bash
   cd frontend
   pnpm install
   ```

2. **Start the development server**:
   ```bash
   pnpm dev
   ```

The frontend will be available at `http://localhost:3000`

## Demo Credentials

Use these credentials to test the application:

### Admin Account
- **Username**: `admin`
- **Password**: `admin123`

### Field Agent Account
- **Username**: `agent`
- **Password**: `agent123`

## API Endpoints

### Authentication
- `POST /api/token/` - Obtain JWT tokens
- `POST /api/token/refresh/` - Refresh access token

### Fields
- `GET /api/fields/` - List fields (filtered by role)
- `POST /api/fields/` - Create field (admin only)
- `GET /api/fields/{id}/` - Get field details
- `PUT /api/fields/{id}/` - Update field (admin only)
- `DELETE /api/fields/{id}/` - Delete field (admin only)
- `POST /api/fields/{id}/update_stage/` - Update field stage and add notes

### Users
- `GET /api/users/me/` - Get current user profile
- `GET /api/users/agents/` - List all agents (admin only)

## Design Decisions

### 1. Authentication & Authorization
- **JWT Tokens**: Stateless authentication allows easy scaling and deployment
- **Role-Based Access**: Simple two-role system (Admin/Agent) covers the requirements
- **Token Refresh**: Implemented for better security and user experience

### 2. Database Schema
- **UserProfile**: Extends Django's User model with role information
- **Field**: Stores field information with foreign key to assigned agent
- **FieldUpdate**: Maintains history of all field stage changes and notes

### 3. Field Status Logic
- **Simple but Extensible**: Current logic based on stage and time, can be enhanced with:
  - Weather data integration
  - Soil condition monitoring
  - Historical patterns
  - ML-based predictions

### 4. Frontend Architecture
- **Context API**: Chosen over Redux for simplicity (no complex state needed)
- **Component Structure**: Separation of pages, components, and contexts for maintainability
- **Responsive Design**: Mobile-first approach with Tailwind CSS

### 5. API Design
- **RESTful**: Standard HTTP methods for CRUD operations
- **Filtering**: Automatic filtering based on user role
- **Nested Resources**: Field updates accessed through field endpoint

## Assumptions Made

1. **Single Growing Season**: System assumes one growing season at a time
2. **Field Assignment**: Each field is assigned to exactly one agent
3. **No Concurrent Edits**: No conflict resolution for simultaneous updates
4. **Simple Status Logic**: Status calculation doesn't require external data sources
5. **SQLite for Development**: Production deployment would use PostgreSQL
6. **CORS Enabled**: Development setup allows all origins (should be restricted in production)

## Future Enhancements

1. **Weather Integration**: Real-time weather data to inform field status
2. **Image Upload**: Allow agents to upload field photos with updates
3. **Notifications**: Alert admins when fields reach "At Risk" status
4. **Advanced Analytics**: Trend analysis and predictive modeling
5. **Mobile App**: Native mobile application for field agents
6. **Multi-Season Support**: Track fields across multiple growing seasons
7. **Export Reports**: Generate PDF reports of field progress
8. **User Management**: Admin interface for creating and managing users

## Testing

### Manual Testing Checklist
- [ ] Login with admin credentials
- [ ] View all fields on admin dashboard
- [ ] Create a new field and assign to agent
- [ ] Login with agent credentials
- [ ] View assigned fields
- [ ] Update field stage with notes
- [ ] Verify status calculations
- [ ] Check role-based access control
- [ ] Test logout functionality

## Deployment

### Backend Deployment (Django)
```bash
# Set DEBUG=False in settings.py
# Configure ALLOWED_HOSTS
# Use PostgreSQL instead of SQLite
# Set up environment variables for SECRET_KEY
# Deploy to Heroku, AWS, DigitalOcean, etc.
```

### Frontend Deployment (React)
```bash
# Build production bundle
pnpm build

# Deploy to Vercel, Netlify, or any static hosting
```

## Troubleshooting

### CORS Issues
If you see CORS errors, ensure:
- Backend is running on `http://localhost:8000`
- `CORS_ALLOW_ALL_ORIGINS = True` in `settings.py`
- Frontend API calls use correct base URL

### Database Errors
If migrations fail:
```bash
python manage.py migrate --run-syncdb
```

### Port Already in Use
- Backend: `python manage.py runserver 8001`
- Frontend: `pnpm dev -- --port 3001`

## License

MIT License - Feel free to use this project for learning and development.

## Support

For issues or questions, please refer to the documentation or create an issue in the repository.
