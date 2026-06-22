import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import connectDB from './config/db.js';
import authRoutes from './routes/authRoutes.js';

dotenv.config();

connectDB();

const app = express();

app.use(express.json());

app.use(cors()); 

app.use('/api/auth', authRoutes);

app.get('/', (req, res) => {
    res.send('server Running Successfully')
})

app.listen(process.env.PORT, () => {
    console.log(`Server Running on Port ${process.env.PORT}`);
});