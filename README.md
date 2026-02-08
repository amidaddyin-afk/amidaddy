# 🌟 Amidaddy.in - 3D Ecommerce Platform

A full-stack Shopify-like ecommerce store with immersive **3D product visualization**, built with modern web technologies. Features JWT authentication, Stripe payments, and an intuitive admin dashboard.

**✨ Key Features:**
- 🎨 Interactive 3D product rendering (React Three Fiber + Three.js)
- 🔐 Secure JWT authentication with bcryptjs
- 💳 Stripe payment integration
- 📦 Product catalog with search & filtering
- 👨‍💼 Admin dashboard
- 📱 Fully responsive design (Tailwind CSS)
- 🚀 **Zero external dependencies** - JSON-based database works anywhere!

## 🚀 Deploy Live

Deploy to **Vercel** (Frontend) + **Render/Railway** (Backend) - both free!

**→ [See Deployment Guide](./DEPLOYMENT.md)**

## 📋 Tech Stack

| Component | Tech |
|-----------|------|
| **Frontend** | Next.js 14, React 18, Three.js, Tailwind CSS |
| **Backend** | Node.js, Express, JSON Database |
| **Authentication** | JWT + bcryptjs |
| **Payments** | Stripe API |
| **3D Graphics** | Three.js, React Three Fiber, Drei |

## 📁 Project Structure

```
amidaddy/
├── frontend/               # Next.js application
│   ├── src/app/           # Next.js app router pages
│   ├── src/components/    # React components (ProductCard, 3D viewers)
│   ├── src/services/      # API client
│   └── package.json
├── backend/               # Express API server
│   ├── src/
│   │   ├── app.js         # Express app config
│   │   ├── server.js      # Server entry point
│   │   ├── models/        # Data models (User, Product, Order)
│   │   ├── routes/        # API routes
│   │   ├── controllers/   # Route handlers
│   │   └── middleware/    # Auth, error handling
│   ├── data.json          # JSON database (auto-created)
│   ├── products/          # Product images
│   └── package.json
├── DEPLOYMENT.md          # Deployment instructions
└── README.md
```

## 🛠️ Local Development

### Prerequisites
- **Node.js 18+** ([Download](https://nodejs.org/))
- **Git**
- That's it! No MongoDB, Docker, or other external services needed.

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/amidaddy.git
   cd amidaddy
   ```

2. **Setup Backend**
   ```bash
   cd backend
   npm install
   npm run seed
   ```

3. **Setup Frontend** (in new terminal)
   ```bash
   cd frontend
   npm install
   ```

### Running Locally

**Terminal 1 - Start Backend:**
```bash
cd backend
npm run dev
# Server runs on http://localhost:5000
```

**Terminal 2 - Start Frontend:**
```bash
cd frontend
npm run dev
# App runs on http://localhost:3000
```

Open http://localhost:3000 in your browser.

### Demo Credentials
- **Email:** admin@amidaddy.in
- **Password:** Admin@123

## 📚 API Endpoints

### Products
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `GET /api/products?search=term` - Search products
- `GET /api/products?category=Premium` - Filter by category

### Authentication
- `POST /api/auth/register` - Create account
- `POST /api/auth/login` - Login user
- `POST /api/auth/verify` - Verify JWT token

### Orders
- `POST /api/orders` - Create order
- `GET /api/orders/:userId` - Get user orders

### Payments
- `POST /api/payments/intent` - Create Stripe payment intent

## 🔒 Environment Variables

### Backend (.env)
```properties
PORT=5000
JWT_SECRET=your_random_secret_key_min_32_chars
STRIPE_SECRET_KEY=sk_test_your_stripe_key
NODE_ENV=development
```

### Frontend (.env.local)
```properties
NEXT_PUBLIC_API_URL=http://localhost:5000
```

## 📦 Database

This project uses a **JSON-based database** for zero dependencies:
- `data.json` stores all users, products, and orders
- No MongoDB or PostgreSQL required
- Perfect for development and GitHub deployment
- Data persists automatically on the server

### Seed Data
```bash
npm run seed
```
Initializes the database with sample products and admin user.

## 🎨 3D Components

The project includes three advanced 3D components:

1. **ProductViewer3DEnhanced** - Interactive 3D bottle viewer with:
   - Drag to rotate, scroll to zoom
   - Auto-rotation when idle
   - Advanced lighting (3-point setup)
   - Fallback to 2D image if no 3D model

2. **ProductShowcase3D** - Hero section with:
   - Animated rotating bottle
   - Professional staging
   - Environment mapping

3. **ProductGallery3D** - Product grid with:
   - Responsive card layout
   - 3D preview on hover
   - Image fallback

## 🚀 Deployment

See the complete [Deployment Guide](./DEPLOYMENT.md) for:
- ✅ GitHub setup
- ✅ Vercel (Frontend)
- ✅ Render or Railway (Backend)
- ✅ Environment configuration
- ✅ Troubleshooting

**Quick Deploy:**
1. Push to GitHub
2. Connect Vercel (frontend folder)
3. Deploy backend to Render
4. Update environment variables
5. Done! 🎉

## 📖 Documentation

- [Deployment Guide](./DEPLOYMENT.md) - Production deployment steps
- [API Documentation](#api-endpoints) - Available endpoints
- [Troubleshooting](./DEPLOYMENT.md#troubleshooting) - Common issues

## 🤝 Contributing

Pull requests are welcome! Please:
1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is open source and available under the MIT License.

## 💡 Project Highlights

- **No External Services** - Works with just Node.js
- **3D Ready** - Built for Three.js and WebGL
- **Production Ready** - JWT, CORS, error handling
- **Easy to Deploy** - Free tier options (Vercel + Render)
- **Scalable Structure** - Clean separation of concerns
- **SEO Friendly** - Next.js built-in optimization

## 🎯 Roadmap

- [ ] Add MongoDB integration option
- [ ] Implement order history visualization
- [ ] Add product reviews with images
- [ ] Create mobile app with React Native
- [ ] Add inventory management dashboard
- [ ] Implement real-time notifications

## 🐛 Troubleshooting

**Issue: Images not loading**
- Check backend is running on port 5000
- Verify CORS configuration
- Check browser console for errors

**Issue: Database empty after restart**
- Run `npm run seed` again
- Consider migrating to MongoDB Atlas

**Issue: Frontend can't connect to backend**
- Check `NEXT_PUBLIC_API_URL` environment variable
- Ensure backend server is running

See [DEPLOYMENT.md](./DEPLOYMENT.md#troubleshooting) for more solutions.

## 📞 Support

- 📧 Email: support@amidaddy.in
- 🐛 Issues: GitHub Issues
- 💬 Discussions: GitHub Discussions

## ⭐ Show Your Support

If you find this project useful, please star ⭐ the repository!

### 3. Login

- **Admin Email:** `admin@amidaddy.in`
- **Admin Password:** `Admin@123`

## How It Works

- **Database:** JSON file (`data.json`) - no external services needed
- **Authentication:** JWT tokens stored in localStorage
- **Products:** Seeded from `backend/src/data/sampleProducts.js`
- **3D Models:** Upload `.glb` or `.gltf` files via admin panel

## GitHub Actions

This project automatically:
- ✅ Installs dependencies
- ✅ Seeds the database  
- ✅ Builds the frontend
- ✅ Verifies everything works

Commits and PRs will run tests automatically.

## Uploading 3D Models

- Upload `.glb` or `.gltf` via `POST /api/uploads` (admin only).
- Save the returned URL in `product.model3D`.
- The `ProductViewer3D` component will load the model automatically.

## Stripe Payments

- Backend endpoint: `POST /api/payments/intent`
- Provide `amount` in paise (₹1 = 100).
- Integrate Stripe Elements on the frontend using the client secret.
- Update your Stripe test keys in `backend/.env`

## Deployment

- **Frontend:** Vercel (`npm run build` then deploy)
- **Backend:** Any Node.js host (Render, Railway, Heroku, etc.)
- **Database:** Data persists in `data.json` file (commit to repo for demos)

## Notes

- The 3D viewer falls back to a static image if no model is supplied.
- For production, add rate limiting, validation, and file type checks.
- Data is stored in `data.json` - version control it for persistence or add to `.gitignore` for ephemeral data.

## Support

Run `npm run seed` anytime to reset the database to initial state.

