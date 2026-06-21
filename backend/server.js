import express from 'express';
import dotenv from 'dotenv';
import connectDB from './config/db.js';
import authRoutes from './authRoutes.js';

dotenv.config();

connectDB();

const app=express();

app.use(express.json());

app.get('/', (req, res) => {
    res.send('Home Page');
});

app.use('/api/auth', authRoutes);

app.get('/test',(req,res)=>{
    res.send('server Running Successfully')
})
app.listen(process.env.PORT,()=>{
     console.log(`Server Running on Port ${process.env.PORT}`);
});