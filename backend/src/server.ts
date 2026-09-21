import express from 'express';
import connectToDB from './config/connectToDB';
import dotenv from 'dotenv';
import cors from 'cors';

dotenv.config();

const app = express();

const allowedOrigins = [
    'http://localhost:3000',
    'http://localhost:3001',
    'https://chatabd.netlify.app',
    process.env.CLIENT_URL,
].filter((origin): origin is string => Boolean(origin));

app.use(cors({
    origin: (origin, callback) => {
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
            return;
        }

        callback(new Error('Not allowed by CORS'));
    },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
}));

app.use(express.json());

connectToDB();

app.get('/', (req, res) => {
    res.send('Hello, World!');
});

import authRoutes from './routes/auth.routes';
import uploadRoutes from './routes/upload.routes';  
import chatRoutes from './routes/chat.routes';
app.use('/api/auth', authRoutes);
app.use('/api/upload', uploadRoutes);
app.use('/api/chat', chatRoutes);

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
});
