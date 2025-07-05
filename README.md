# 🍽️ Restaurant POS System

A modern, full-stack Point of Sale (POS) system built with React, Node.js, and PostgreSQL. Features real-time order management, payment processing, and comprehensive reporting.

## ✨ Features

- **📱 Modern UI/UX** - Clean, responsive interface with Tailwind CSS
- **🔄 Real-time Updates** - WebSocket integration for live order status
- **💳 Payment Processing** - Multiple payment methods support
- **📊 Comprehensive Reports** - Sales analytics and performance metrics
- **👥 Customer Management** - Customer profiles and order history
- **🛍️ Product Management** - Inventory and category management
- **📋 Order Management** - Status tracking and modification
- **🖨️ Receipt Printing** - Digital and physical receipt generation
- **🔐 Authentication** - Secure user login and role management
- **📈 Dashboard** - Real-time business insights

## 🏗️ Architecture

```
RESTO/
├── frontend/          # React + TypeScript + Tailwind CSS
├── backend/           # Node.js + Express + PostgreSQL
├── desktop/           # Electron desktop app
├── shared/            # Shared types and utilities
└── database/          # Database schema and seeds
```

## 🚀 Quick Start

### Prerequisites

- Node.js (v16 or higher)
- PostgreSQL (v12 or higher)
- Git

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/resto-pos-system.git
   cd resto-pos-system
   ```

2. **Install dependencies**
   ```bash
   # Install root dependencies
   npm install
   
   # Install frontend dependencies
   cd frontend && npm install
   
   # Install backend dependencies
   cd ../backend && npm install
   
   # Install shared dependencies
   cd ../shared && npm install
   ```

3. **Set up the database**
   ```bash
   # Navigate to backend
   cd ../backend
   
   # Run database setup
   npm run db:setup
   
   # Apply optimizations
   npm run db:optimize
   ```

4. **Configure environment variables**
   ```bash
   # Copy example environment file
   cp config/environment.example config/environment
   
   # Edit with your database credentials
   # Update database connection details
   ```

5. **Start the development servers**
   ```bash
   # Start backend (from backend directory)
   npm run dev
   
   # Start frontend (from frontend directory)
   npm start
   ```

## 📁 Project Structure

### Frontend (`/frontend`)
- **Components/** - Reusable UI components
- **Pages/** - Main application pages
- **Contexts/** - React context providers
- **Hooks/** - Custom React hooks
- **Services/** - API service layer

### Backend (`/backend`)
- **Routes/** - API route handlers
- **Middleware/** - Express middleware
- **Database/** - Database connection and queries
- **Scripts/** - Database setup and maintenance
- **WebSocket/** - Real-time communication

### Shared (`/shared`)
- **Types/** - TypeScript type definitions
- **Utils/** - Shared utility functions
- **Constants/** - Application constants

## 🛠️ Development

### Available Scripts

#### Backend
```bash
npm run dev          # Start development server
npm run build        # Build for production
npm run start        # Start production server
npm run db:setup     # Setup database schema
npm run db:seed      # Seed database with sample data
npm run db:optimize  # Apply database optimizations
npm run perf:test    # Run performance tests
```

#### Frontend
```bash
npm start            # Start development server
npm run build        # Build for production
npm run test         # Run tests
npm run analyze      # Analyze bundle size
```

### Database Management

```bash
# Setup database
npm run db:setup

# Reset database
npm run db:reset

# Seed with sample data
npm run db:seed

# Apply optimizations
npm run db:optimize
```

## 🔧 Configuration

### Environment Variables

Create a `config/environment` file in the backend directory:

```env
# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=resto_pos
DB_USER=your_username
DB_PASSWORD=your_password

# Server
PORT=3001
NODE_ENV=development

# JWT Secret
JWT_SECRET=your_jwt_secret_key

# CORS
CORS_ORIGIN=http://localhost:3000
```

## 📊 Database Schema

The system uses PostgreSQL with the following main tables:
- **users** - User accounts and authentication
- **products** - Product catalog and inventory
- **categories** - Product categories
- **orders** - Order records and status
- **order_items** - Individual items in orders
- **customers** - Customer information
- **tables** - Restaurant table management
- **payments** - Payment transaction records

## 🔐 Authentication

The system uses JWT-based authentication with role-based access control:
- **Admin** - Full system access
- **Manager** - Order and customer management
- **Cashier** - Basic POS operations

## 📱 API Endpoints

### Authentication
- `POST /api/auth/login` - User login
- `POST /api/auth/logout` - User logout

### Orders
- `GET /api/orders` - Get all orders
- `POST /api/orders` - Create new order
- `PUT /api/orders/:id` - Update order
- `DELETE /api/orders/:id` - Delete order
- `PATCH /api/orders/:id/status` - Update order status

### Products
- `GET /api/products` - Get all products
- `POST /api/products` - Create product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product

### Customers
- `GET /api/customers` - Get all customers
- `POST /api/customers` - Create customer
- `PUT /api/customers/:id` - Update customer

## 🚀 Deployment

### Production Build

1. **Build frontend**
   ```bash
   cd frontend
   npm run build
   ```

2. **Build backend**
   ```bash
   cd backend
   npm run build
   ```

3. **Deploy to your preferred hosting service**

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:
- Create an issue on GitHub
- Check the documentation in `/docs`
- Review the setup guide in `QUICK_START.md`

## 🔄 Version Control Workflow

### Daily Development
```bash
# Pull latest changes
git pull origin main

# Create feature branch
git checkout -b feature/your-feature-name

# Make changes and commit
git add .
git commit -m "Add your feature description"

# Push to GitHub
git push origin feature/your-feature-name

# Create Pull Request on GitHub
```

### Syncing Between Computers
```bash
# On new computer
git clone https://github.com/YOUR_USERNAME/resto-pos-system.git
cd resto-pos-system
npm install
cd frontend && npm install
cd ../backend && npm install
cd ../shared && npm install

# Setup database and environment
# Follow installation steps above
```

---

**Built with ❤️ using React, Node.js, and PostgreSQL** 