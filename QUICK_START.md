# Quick Start Guide - Restaurant POS System

## 🚀 Immediate Setup (Windows)

### 1. Prerequisites Check
Make sure you have:
- ✅ Node.js 18+ installed
- ✅ PostgreSQL installed and running
- ✅ Git installed

### 2. Database Setup (Choose One Option)

#### Option A: Use the Setup Script (Recommended)
```bash
# From the root directory (RESTO)
setup-database.bat
```

#### Option B: Manual Setup
```bash
# From the root directory (RESTO)
psql -U postgres -c "CREATE DATABASE resto_pos;"
psql -U postgres -d resto_pos -f database/schema.sql
psql -U postgres -d resto_pos -f database/seed.sql
```

### 3. Install Dependencies
```bash
# From the root directory (RESTO)
npm install
npm run install:all
```

### 4. Build Shared Package
```bash
cd shared
npm run build
cd ..
```

### 5. Start Development Servers

Open **3 separate terminal windows** and run:

**Terminal 1 - Backend:**
```bash
cd backend
npm run dev
```

**Terminal 2 - Frontend:**
```bash
cd frontend
npm start
```

**Terminal 3 - Desktop (Optional):**
```bash
cd desktop
npm run dev
```

### 6. Access the Application

- **Web App**: http://localhost:3000
- **API**: http://localhost:3001
- **Desktop App**: Will open automatically

### 7. Login Credentials
- **Username**: `admin`
- **Password**: `admin123`

## 🔧 Troubleshooting

### Database Connection Issues
```bash
# Check if PostgreSQL is running
# Windows: Check Services app for "postgresql-x64-14" service
# Or run: net start postgresql-x64-14
```

### Port Already in Use
```bash
# Check what's using the ports
netstat -ano | findstr :3000
netstat -ano | findstr :3001

# Kill the process if needed
taskkill /PID <process_id> /F
```

### Missing Dependencies
```bash
# Clear npm cache and reinstall
npm cache clean --force
rm -rf node_modules
npm install
```

## 📁 Project Structure
```
RESTO/
├── backend/          # Express API server
├── frontend/         # React web app
├── desktop/          # Electron desktop app
├── shared/           # Common types & utilities
├── database/         # Database schema & seed data
└── docs/            # Documentation
```

## 🎯 Next Steps

1. **Explore the Features**:
   - Dashboard analytics
   - Product management
   - Order processing
   - Customer management

2. **Customize for Your Restaurant**:
   - Update store settings
   - Add your products
   - Configure tax rates
   - Set up payment methods

3. **Production Deployment**:
   - See `docs/SETUP.md` for production setup
   - Configure environment variables
   - Set up SSL certificates
   - Deploy to your server

## 📞 Support

If you encounter any issues:
1. Check the troubleshooting section above
2. Review the logs in `backend/logs/`
3. Check the browser console for frontend errors
4. Refer to `docs/SETUP.md` for detailed instructions

---

**Happy coding! 🍕🍔🍟** 