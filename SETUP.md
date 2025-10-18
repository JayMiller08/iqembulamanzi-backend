# iqembulamanzi-backend

## 🚀 Quick Start

### Prerequisites
- Node.js (v16 or higher)
- MongoDB (local or cloud)
- Twilio account (for WhatsApp integration)

### Installation

1. **Clone and install dependencies:**
   ```bash
   cd iqembulamanzi-backend
   npm install
   ```

2. **Set up environment variables:**
   ```bash
   cp .env.example .env
   # Edit .env with your actual values
   ```

3. **Create logs directory:**
   ```bash
   mkdir logs
   ```

4. **Start the server:**
   ```bash
   # Development
   npm run dev
   
   # Production
   npm start
   ```

### Environment Variables

Copy `.env.example` to `.env` and configure:

```env
# Server
PORT=2000
NODE_ENV=development

# Database
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/database

# Security
JWT_SECRET=your_super_secure_jwt_secret_key
BCRYPT_ROUNDS=12

# Twilio
TWILIO_ACCOUNT_SID=your_account_sid
TWILIO_AUTH_TOKEN=your_auth_token
TWILIO_WHATSAPP_FROM=+14155238886

# CORS
CORS_ORIGIN=http://localhost:3000
```

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Run with coverage
npm test -- --coverage
```

## 🔧 Development

```bash
# Lint code
npm run lint

# Fix linting issues
npm run lint:fix

# Development server with auto-reload
npm run dev
```

## 📁 Project Structure

```
iqembulamanzi-backend/
├── src/
│   ├── controllers/     # Route handlers
│   ├── middleware/      # Custom middleware
│   ├── models/         # Mongoose models
│   ├── routes/         # Express routes
│   ├── services/       # Business logic
│   ├── utils/          # Utility functions
│   └── validators/     # Input validation
├── tests/              # Test files
├── logs/               # Log files
├── public/             # Static files
├── config/             # Configuration files
└── docs/               # Documentation
```

## 🔒 Security Features

- ✅ JWT authentication
- ✅ Password hashing with bcrypt
- ✅ Rate limiting
- ✅ CORS protection
- ✅ Security headers (Helmet)
- ✅ Input validation
- ✅ Error handling
- ✅ Request logging

## 📱 API Endpoints

### Authentication
- `POST /login` - User login
- `POST /submit` - User registration

### Users
- `GET /users` - Get all users (protected)

### Incidents
- `POST /whatsapp` - WhatsApp webhook
- `GET /api/incidents` - Get incidents (protected)
- `PUT /api/incidents/:id` - Update incident (protected)
- `PUT /api/incidents/verify/:id` - Verify incident (protected)

## 🐛 Troubleshooting

### Common Issues

1. **MongoDB Connection Error**
   - Check your MONGODB_URI in .env
   - Ensure MongoDB is running
   - Verify network connectivity

2. **JWT Token Errors**
   - Ensure JWT_SECRET is set in .env
   - Check token expiration (24h default)

3. **Twilio Integration Issues**
   - Verify Twilio credentials in .env
   - Check webhook URL configuration
   - Ensure WhatsApp Business API is enabled

### Logs

Check the `logs/` directory for:
- `error.log` - Error logs only
- `combined.log` - All logs

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests
5. Submit a pull request

## 📄 License

MIT License - see LICENSE file for details
