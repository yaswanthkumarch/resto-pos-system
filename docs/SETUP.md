# Restaurant POS System Setup Guide

## Prerequisites

### System Requirements
- **Node.js**: 18.0.0 or higher
- **PostgreSQL**: 13.0 or higher
- **Redis**: 6.0 or higher (optional, for enhanced caching)
- **Git**: Latest version

### Operating System Support
- **Windows**: 10 or higher
- **macOS**: 10.15 or higher
- **Linux**: Ubuntu 18.04+ or equivalent

## Installation Steps

### 1. Clone the Repository
```bash
git clone <repository-url>
cd RESTO
```

### 2. Install Dependencies
```bash
# Install root dependencies
npm install

# Install all workspace dependencies
npm run install:all
```

### 3. Database Setup

#### PostgreSQL Installation
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install postgresql postgresql-contrib

# macOS (using Homebrew)
brew install postgresql
brew services start postgresql

# Windows
# Download from https://www.postgresql.org/download/windows/
```

#### Create Database
```bash
# Connect to PostgreSQL
sudo -u postgres psql

# Create database and user
CREATE DATABASE resto_pos;
CREATE USER resto_user WITH ENCRYPTED PASSWORD 'your_password';
GRANT ALL PRIVILEGES ON DATABASE resto_pos TO resto_user;
\q
```

### 4. Environment Configuration

#### Backend Configuration
```bash
cd backend
cp config/environment.example .env
```

Edit `.env` file with your database credentials:
```env
DATABASE_URL=postgresql://resto_user:your_password@localhost:5432/resto_pos
JWT_SECRET=your-super-secret-jwt-key-here
```

#### Frontend Configuration
```bash
cd frontend
echo "REACT_APP_API_URL=http://localhost:3001" > .env
```

### 5. Database Migration and Seeding

**IMPORTANT**: Run these commands from the **root directory** (RESTO), not from any subdirectory.

```bash
# Make sure you're in the root directory
cd C:\Users\kentn\Desktop\RESTO

# Run database schema
psql -U postgres -d resto_pos -f database/schema.sql

# Seed initial data
psql -U postgres -d resto_pos -f database/seed.sql
```

**Alternative for Windows (if psql is not in PATH):**
```bash
# If PostgreSQL is installed in default location
"C:\Program Files\PostgreSQL\14\bin\psql.exe" -U postgres -d resto_pos -f database\schema.sql
"C:\Program Files\PostgreSQL\14\bin\psql.exe" -U postgres -d resto_pos -f database\seed.sql
```

### 6. Build Shared Package
```bash
cd shared
npm run build
```

## Development Setup

### Start Development Servers
```bash
# Terminal 1: Backend API
cd backend
npm run dev

# Terminal 2: Frontend React App
cd frontend
npm start

# Terminal 3: Desktop Electron App
cd desktop
npm run dev
```

## Production Deployment

### Build for Production
```bash
# Build all packages
npm run build:all
```

### Deploy Backend
```bash
cd backend
npm run build
npm start
```

### Deploy Frontend
```bash
cd frontend
npm run build
# Serve build folder with your preferred web server
```

### Build Desktop App
```bash
cd desktop
npm run electron:dist
```

## Default Credentials

### Admin Account
- **Username**: admin
- **Password**: admin123
- **Role**: Super Admin

### Test Accounts
- **Manager**: manager1 / admin123
- **Cashier**: cashier1 / admin123
- **Staff**: staff1 / admin123

## Configuration

### Store Settings
Access the settings page to configure:
- Store name and details
- Tax rates
- Currency
- Receipt templates
- User permissions

### Database Backup
```bash
# Create backup
pg_dump -U postgres resto_pos > backup.sql

# Restore backup
psql -U postgres -d resto_pos < backup.sql
```

## Troubleshooting

### Common Issues

#### Database Connection Error
```bash
# Check PostgreSQL service
sudo systemctl status postgresql

# Restart if needed
sudo systemctl restart postgresql
```

#### Port Conflicts
- Backend: Default port 3001
- Frontend: Default port 3000
- Change ports in respective package.json files

#### Permission Issues
```bash
# Fix npm permissions
sudo chown -R $(whoami) ~/.npm
```

#### Windows-Specific Issues
- **psql not found**: Add PostgreSQL bin directory to PATH
- **Permission denied**: Run PowerShell as Administrator
- **Path issues**: Use backslashes (\) instead of forward slashes (/) in Windows

### Log Files
- Backend: `backend/logs/app.log`
- Desktop: Check Electron console for errors

## Development Tips

### Hot Reload
- Backend: Uses `ts-node-dev` for automatic restart
- Frontend: Uses React's built-in hot reload
- Desktop: Restart desktop app after main process changes

### Database Reset
```bash
# Reset database (WARNING: Deletes all data)
psql -U postgres -d resto_pos -c "DROP SCHEMA public CASCADE; CREATE SCHEMA public;"
psql -U postgres -d resto_pos -f database/schema.sql
psql -U postgres -d resto_pos -f database/seed.sql
```

## Features Overview

### Core Features
- ✅ User authentication with role-based access
- ✅ Product and category management
- ✅ Order processing and tracking
- ✅ Payment handling (cash, card, digital)
- ✅ Customer management
- ✅ Table management
- ✅ Real-time sync between devices
- ✅ Offline mode support
- ✅ Receipt printing
- ✅ Inventory tracking
- ✅ Sales reporting
- ✅ Dashboard analytics

### Technical Features
- ✅ Cross-platform desktop app (Electron)
- ✅ Responsive web interface
- ✅ Real-time WebSocket communication
- ✅ Local SQLite storage for offline mode
- ✅ PostgreSQL for centralized data
- ✅ JWT-based authentication
- ✅ Auto-updates for desktop app
- ✅ Data synchronization
- ✅ Conflict resolution

## Support

### Documentation
- [API Documentation](./API.md)
- [Frontend Components](./COMPONENTS.md)
- [Database Schema](./DATABASE.md)

### Contact
For technical support, create an issue in the repository or contact the development team.

## License
This project is licensed under the MIT License - see the LICENSE file for details. 