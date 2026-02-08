# Project Structure Guide

Complete file structure and explanation of the Amidaddy project.

```
amidaddy/
│
├── 📄 README.md                    # Project overview & quick start
├── 📄 QUICK_DEPLOY.md             # 4-step deployment guide (START HERE!)
├── 📄 GITHUB_SETUP.md             # Detailed GitHub & deployment setup
├── 📄 DEPLOYMENT.md               # Complete deployment documentation
├── 📄 PRODUCTION_CHECKLIST.md     # Pre-launch checklist
├── 📄 PROJECT_STRUCTURE.md        # This file
├── 📄 package.json                # Root dependencies (if any)
├── 📄 .gitignore                  # Git ignore rules
│
├── 📁 frontend/                   # Next.js React Application
│   ├── 📄 package.json           # Dependencies: next, react, three.js, tailwind
│   ├── 📄 next.config.js         # Next.js configuration
│   ├── 📄 tailwind.config.js     # Tailwind CSS configuration
│   ├── 📄 postcss.config.js      # PostCSS configuration
│   ├── 📄 .env.local             # Frontend environment (local dev)
│   │
│   ├── 📁 src/
│   │   ├── 📁 app/               # Next.js App Router pages
│   │   │   ├── 📄 page.jsx       # Homepage with 3D showcase
│   │   │   ├── 📄 layout.jsx     # Root layout & global styles
│   │   │   ├── 📄 globals.css    # Global styles
│   │   │   ├── 📁 admin/
│   │   │   │   └── 📄 page.jsx   # Admin dashboard
│   │   │   ├── 📁 cart/
│   │   │   │   └── 📄 page.jsx   # Shopping cart page
│   │   │   ├── 📁 checkout/
│   │   │   │   └── 📄 page.jsx   # Checkout page
│   │   │   ├── 📁 login/
│   │   │   │   └── 📄 page.jsx   # Login page
│   │   │   ├── 📁 register/
│   │   │   │   └── 📄 page.jsx   # Registration page
│   │   │   ├── 📁 order-confirmation/
│   │   │   │   └── 📄 page.jsx   # Order success page
│   │   │   └── 📁 product/
│   │   │       └── 📁 [id]/
│   │   │           └── 📄 page.jsx # Product detail page with 3D viewer
│   │   │
│   │   ├── 📁 components/        # Reusable React components
│   │   │   ├── 📄 Navbar.jsx              # Navigation bar
│   │   │   ├── 📄 Footer.jsx              # Footer component
│   │   │   ├── 📄 ProductCard.jsx         # Product grid card
│   │   │   ├── 📄 ProductPreview3D.jsx    # Mini 3D preview
│   │   │   ├── 📄 ProductViewer3D.jsx     # Basic 3D viewer
│   │   │   ├── 📄 ProductViewer3DEnhanced.jsx # Advanced 3D viewer with controls
│   │   │   ├── 📄 ProductShowcase3D.jsx   # Hero 3D showcase
│   │   │   └── 📄 ProductGallery3D.jsx    # 3D product grid
│   │   │
│   │   ├── 📁 services/          # API & external services
│   │   │   └── 📄 api.js         # Axios API client
│   │   │
│   │   └── 📁 styles/            # Additional styles
│   │       └── (Tailwind CSS handles most)
│   │
│   └── 📁 public/                # Static assets
│       └── (favicon, images, etc)
│
├── 📁 backend/                    # Express.js API Server
│   ├── 📄 package.json           # Dependencies: express, cors, jwt, stripe, etc
│   ├── 📄 .env                   # Backend environment variables
│   ├── 📄 .env.example           # Environment template
│   ├── 📄 data.json              # JSON Database (auto-created by seed)
│   │
│   ├── 📁 src/
│   │   ├── 📄 app.js             # Express app configuration & middleware
│   │   ├── 📄 server.js          # Server entry point (starts on port 5000)
│   │   │
│   │   ├── 📁 config/
│   │   │   └── 📄 db.js          # JSON database utilities (readDb, writeDb)
│   │   │
│   │   ├── 📁 models/            # Data models with business logic
│   │   │   ├── 📄 User.js        # User model (create, findOne, auth)
│   │   │   ├── 📄 Product.js     # Product model (CRUD, search, filter)
│   │   │   └── 📄 Order.js       # Order model (create, find, update)
│   │   │
│   │   ├── 📁 controllers/       # Route handlers
│   │   │   ├── 📄 authController.js      # Login, register, verify
│   │   │   ├── 📄 productController.js   # Get products, search
│   │   │   ├── 📄 orderController.js     # Create, get orders
│   │   │   ├── 📄 paymentController.js   # Stripe payment intent
│   │   │   └── 📄 uploadController.js    # File uploads
│   │   │
│   │   ├── 📁 routes/            # API route definitions
│   │   │   ├── 📄 authRoutes.js       # /api/auth/*
│   │   │   ├── 📄 productRoutes.js    # /api/products/*
│   │   │   ├── 📄 orderRoutes.js      # /api/orders/*
│   │   │   ├── 📄 paymentRoutes.js    # /api/payments/*
│   │   │   └── 📄 uploadRoutes.js     # /api/uploads/*
│   │   │
│   │   ├── 📁 middleware/        # Express middleware
│   │   │   ├── 📄 authMiddleware.js    # JWT verification
│   │   │   └── 📄 errorMiddleware.js   # Error handling
│   │   │
│   │   ├── 📁 utils/             # Utility functions
│   │   │   ├── 📄 asyncHandler.js      # Async error wrapper
│   │   │   └── 📄 generateToken.js     # JWT token generation
│   │   │
│   │   ├── 📁 data/
│   │   │   └── 📄 sampleProducts.js    # Seed data for products
│   │   │
│   │   └── 📄 seed.js            # Database initialization script
│   │
│   ├── 📁 uploads/               # User uploaded files
│   │   └── .gitkeep
│   │
│   └── 📁 products/              # Product images (committed to GitHub)
│       ├── 📷 billionaire.jpeg
│       ├── 📷 coldwar.jpeg
│       ├── 📷 heavenly.jpeg
│       └── 📷 old love.jpeg
│
├── 📁 .github/                    # GitHub configuration
│   └── 📁 workflows/
│       └── 📄 deploy.yml         # GitHub Actions for auto-deploy
│
├── 📁 products/                   # Product images (root level)
│   ├── 📷 billionaire.jpeg       # Billionaire fragrance
│   ├── 📷 coldwar.jpeg           # Cold War fragrance
│   ├── 📷 heavenly.jpeg          # Heavenly fragrance
│   └── 📷 old love.jpeg          # Old Love fragrance
│
└── 📄 index.html                 # (Optional) Static landing page
└── 📄 product.html               # (Optional) Static product page
└── 📄 styles.css                 # (Optional) Static styles
```

---

## Key Files Explained

### Frontend Core Files

**`src/app/page.jsx`**
- Homepage with 3D product showcase
- Featured products grid
- Hero section with ProductShowcase3D

**`src/app/product/[id]/page.jsx`**
- Individual product detail page
- Uses ProductViewer3DEnhanced for 3D rendering
- Shows price, description, add to cart button

**`src/components/ProductViewer3DEnhanced.jsx`**
- Advanced 3D viewer with drag/zoom controls
- Auto-rotation when idle
- Professional lighting setup (ambient + directional + point lights)
- Falls back to 2D image if no 3D model

**`src/services/api.js`**
- Axios instance configured with backend base URL
- Exports functions: getProducts(), getProduct(), etc.

### Backend Core Files

**`src/app.js`**
- Express app configuration
- CORS setup for frontend
- Static file serving for products & uploads
- Route mounting for all API endpoints
- Error handling middleware

**`src/server.js`**
- Entry point - initializes database and starts Express server
- Runs on port 5000

**`src/config/db.js`**
- JSON database utilities
- readDb() - reads data.json
- writeDb() - writes to data.json
- initializeDatabase() - creates data.json if missing

**`src/models/User.js`**
- User data model with methods:
  - create() - register new user
  - findOne() - find by email
  - findById() - find by ID
  - matchPassword() - verify password with bcrypt

**`src/models/Product.js`**
- Product data model with methods:
  - find() - list all products with search/filter
  - findById() - get single product
  - create() - add new product
  - update() - modify product
  - deleteOne() - delete product

**`src/models/Order.js`**
- Order data model with methods:
  - create() - create new order
  - find() - get orders for a user
  - update() - update order status

**`src/seed.js`**
- Initializes database with sample data
- Creates admin user
- Adds 4 sample products from sampleProducts.js
- Run with: `npm run seed`

---

## Technology Stack Details

### Frontend Dependencies

```json
{
  "next": "14.2.5",                    // React framework
  "react": "18.3.1",                   // UI library
  "react-dom": "18.3.1",               // DOM rendering
  "three": "0.167.1",                  // 3D graphics
  "@react-three/fiber": "8.17.10",     // React wrapper for Three.js
  "@react-three/drei": "9.108.4",      // Three.js utilities
  "axios": "1.7.7",                    // HTTP client
  "tailwindcss": "3.4.10"              // CSS framework
}
```

### Backend Dependencies

```json
{
  "express": "4.19.2",                 // Web framework
  "cors": "2.8.5",                     // CORS handling
  "dotenv": "16.4.5",                  // Environment variables
  "jsonwebtoken": "9.0.2",             // JWT tokens
  "bcryptjs": "2.4.3",                 // Password hashing
  "stripe": "16.0.0",                  // Payment processing
  "multer": "1.4.5-lts.1",            // File uploads
  "uuid": "9.0.1"                      // Unique IDs
}
```

---

## Database Schema (data.json)

```javascript
{
  "users": [
    {
      "id": "uuid",
      "name": "Admin",
      "email": "admin@amidaddy.in",
      "password": "$2a$10$...", // bcrypt hash
      "role": "customer",
      "createdAt": timestamp,
      "updatedAt": timestamp
    }
  ],
  "products": [
    {
      "id": "uuid",
      "name": "Billionaire",
      "description": "...",
      "price": 2499,
      "stock": 28,
      "category": "Premium",
      "images": ["/products/billionaire.jpeg"],
      "model3D": null,  // Future: 3D model URL
      "createdAt": timestamp,
      "updatedAt": timestamp
    }
  ],
  "orders": [
    {
      "id": "uuid",
      "userId": "uuid",
      "items": [...],
      "total": 5000,
      "status": "completed",
      "paymentId": "stripe_id",
      "createdAt": timestamp,
      "updatedAt": timestamp
    }
  ]
}
```

---

## API Endpoints Reference

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get one product
- `GET /api/products?search=term` - Search
- `GET /api/products?category=Premium` - Filter

### Authentication
- `POST /api/auth/register` - Sign up
- `POST /api/auth/login` - Sign in
- `POST /api/auth/verify` - Verify token

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/:userId` - Get user orders

### Payments
- `POST /api/payments/intent` - Stripe intent

---

## Deployment Files

**`.github/workflows/deploy.yml`**
- GitHub Actions workflow
- Auto-builds and deploys on push to main
- Runs tests and checks

**`QUICK_DEPLOY.md`**
- 4-step deployment guide
- Start here for fastest setup

**`GITHUB_SETUP.md`**
- Detailed step-by-step instructions
- Includes screenshots
- Covers Vercel, Render setup

**`DEPLOYMENT.md`**
- Complete deployment documentation
- Troubleshooting guide
- Best practices

**`PRODUCTION_CHECKLIST.md`**
- Pre-launch checklist
- Security checklist
- Performance optimization
- Testing procedures

---

## Environment Configuration

### Development (.env)

```properties
PORT=5000
JWT_SECRET=dev_secret
STRIPE_SECRET_KEY=sk_test_123...
NODE_ENV=development
```

### Production (.env on Render)

```properties
PORT=5000
JWT_SECRET=<32-char-random-string>
STRIPE_SECRET_KEY=sk_test_123... (or sk_live_...)
NODE_ENV=production
CORS_ORIGIN=https://amidaddy.vercel.app
```

---

## Important Directories

### Source Code
- `frontend/src/` - All React/Next.js code
- `backend/src/` - All Express code

### Configuration
- `frontend/` - Next.js config files
- `backend/` - Environment & package config

### Data
- `backend/data.json` - Main database
- `backend/products/` - Product images (committed to GitHub)
- `backend/uploads/` - User uploads (not committed)

### Documentation
- `QUICK_DEPLOY.md` - Start here!
- `GITHUB_SETUP.md` - Detailed setup
- `DEPLOYMENT.md` - Full guide
- `PRODUCTION_CHECKLIST.md` - Pre-launch

---

## File Naming Conventions

- **Pages:** PascalCase (`page.jsx`)
- **Components:** PascalCase (`ProductCard.jsx`)
- **Files:** camelCase or kebab-case
- **Database Models:** PascalCase (`User.js`)
- **Routes:** kebab-case (`/api/auth/login`)

---

## Next Steps

1. Review [QUICK_DEPLOY.md](./QUICK_DEPLOY.md) for deployment
2. Explore the frontend components
3. Check backend routes and controllers
4. Run locally to test
5. Push to GitHub and deploy!

---

**Questions?** Check the detailed documentation files or create a GitHub issue!
