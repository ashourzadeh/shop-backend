import cors from 'cors';
import express from 'express';
import dotenv from 'dotenv';
import pool from './db.js';

import productsMongoRouter from './routes/productsMongo.js';
import invoicesMongoRouter from './routes/invoicesMongo.js';
import customersMongoRouter from './routes/customersMongo.js';
import reportsMongoRouter from './routes/reportsMongo.js';
import mongoose from 'mongoose';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config();

// mongoose.connect('mongodb://127.0.0.1:27017/myshop')
//   .then(() => console.log('✅ Connected to MongoDB'))
//   .catch(err => console.error('❌ MongoDB connection error:', err));
mongoose.connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch(err => console.error("❌ Mongo Error:", err));


const app = express();
app.use(cors());
app.use(express.json());
app.use(express.static('public'));
app.use(express.static('qrcodes'));
app.use(express.urlencoded({ extended: true }));
app.use('/api/products', productsMongoRouter);
app.use('/api/invoices', invoicesMongoRouter);
app.use('/api/customers', customersMongoRouter);
app.use('/api/reports', reportsMongoRouter);
app.use('/qrcodes', express.static('public/qrcodes'));
app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'dashboard.html'));
});

app.get('/reports', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'reports.html'));
});

app.get('/stock', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'stock.html'));
});

app.get('/qr', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'qrcodes.html'));
});

app.get('/products', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'products.html'));
});

app.get('/invoices', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'invoices.html'));
});

app.get('/customers', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'customers.html'));
});


const PORT = process.env.PORT || 3000;

// ✅ تست اتصال به سرور
app.get('/api/test', async (req, res) => {
  try {
    const [rows] = await pool.query('SELECT NOW() AS serverTime');
    res.json({ success: true, serverTime: rows[0].serverTime });
  } catch (error) {
    res.status(500).json({ success: false, error: error.message });
  }
});


app.listen(PORT, () => {
  console.log(`✅ Server running on http://localhost:${PORT}`);
});
