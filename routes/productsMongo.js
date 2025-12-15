// productsMongo.js
import express from 'express';
import mongoose from 'mongoose';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';
import Product from './productsMongoModel.js'; // فقط مدل ایمپورت شد

const router = express.Router();

// GET all products
router.get('/', async (req, res) => {
  try {
    const products = await Product.find();
    res.json(products);
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST add new product + generate QR
router.post('/', async (req, res) => {
  try {
    let { sku, name, description = '', price = 0, attributes = {}, stock = 0 } = req.body;
    if (!name) return res.status(400).json({ success: false, error: 'نام محصول الزامی است' });
    if (!sku || sku.trim() === '') sku = `PRD-${Date.now()}`;

    const newProduct = new Product({ sku, name, description, price, attributes, stock });
    await newProduct.save();

    // QR code
    const qrDir = path.resolve('public/qrcodes');
    if (!fs.existsSync(qrDir)) fs.mkdirSync(qrDir, { recursive: true });

    const qrPath = path.join(qrDir, `product_${newProduct._id}.png`);
    await QRCode.toFile(qrPath, sku, { width: 300 });

    newProduct.qr_code = `qrcodes/product_${newProduct._id}.png`;
    await newProduct.save();

    res.json({ success: true, id: newProduct._id, qr_code: newProduct.qr_code, sku });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT edit product
router.put('/:id', async (req, res) => {
  try {
    const { sku, name, description, price, attributes, stock } = req.body;
    await Product.findByIdAndUpdate(req.params.id, { sku, name, description, price, attributes, stock });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE product
router.delete('/:id', async (req, res) => {
  try {
    const Invoice = mongoose.model('Invoice');
    const used = await Invoice.findOne({ 'items.product_id': req.params.id });
    if (used) return res.status(400).json({ success: false, error: 'این محصول در فاکتورها استفاده شده است' });

    const result = await Product.findByIdAndDelete(req.params.id);
    res.json({ success: !!result });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

// PATCH update stock
router.patch('/:id/stock', async (req, res) => {
  try {
    const { stock } = req.body;
    await Product.findByIdAndUpdate(req.params.id, { stock });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
