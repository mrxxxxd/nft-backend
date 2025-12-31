const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');
require('dotenv').config();

const app = express();

// ========== MIDDLEWARE ==========
app.use(helmet({
    contentSecurityPolicy: false,
    crossOriginEmbedderPolicy: false
}));

const corsOptions = {
    origin: process.env.FRONTEND_URL || [
        'http://localhost:3000',
        'https://your-frontend.railway.app'
    ],
    credentials: true,
    optionsSuccessStatus: 200
};
app.use(cors(corsOptions));
app.use(express.json());
app.use(morgan('combined'));

// ========== HEALTH CHECK (REQUIRED FOR RAILWAY) ==========
app.get('/api/health', (req, res) => {
    res.json({ 
        status: 'OK', 
        timestamp: new Date().toISOString(),
        service: 'NFT Shop API'
    });
});

// ========== BASIC API ROUTES ==========
// User routes (to be expanded)
app.get('/api/users', (req, res) => {
    res.json([{ id: 1, username: 'testuser', email: 'test@example.com' }]);
});

// NFT routes
app.get('/api/nfts', (req, res) => {
    res.json([
        { id: 1, name: 'Cyber Punk #1', price: 0.5, image: 'https://placehold.co/400x400' },
        { id: 2, name: 'Digital Dream', price: 0.8, image: 'https://placehold.co/400x400' },
        { id: 3, name: 'Crypto Alien', price: 1.2, image: 'https://placehold.co/400x400' }
    ]);
});

// ========== 404 HANDLER ==========
app.use('*', (req, res) => {
    res.status(404).json({ message: 'Route not found' });
});

// ========== ERROR HANDLER ==========
app.use((err, req, res, next) => {
    console.error(err.stack);
    res.status(500).json({ 
        message: 'Something went wrong!',
        ...(process.env.NODE_ENV === 'development' && { error: err.message })
    });
});

// ========== START SERVER ==========
const PORT = process.env.PORT || 5000;
app.listen(PORT, '0.0.0.0', () => {
    console.log(`✅ NFT Shop Backend running on port ${PORT}`);
    console.log(`📡 Health check: http://localhost:${PORT}/api/health`);
});
