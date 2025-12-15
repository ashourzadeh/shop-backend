import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

// 🔹 Customer Schema
const customerSchema = new mongoose.Schema({
  name: { type: String, required: true },
  phone: String,
  email: String,
  address: String,
  birthday: Date,
  created_at: { type: Date, default: Date.now }
});

const Customer = mongoose.model('Customer', customerSchema);

// GET /api/customers  -> لیست همه مشتری‌ها
router.get('/', async (req, res) => {
  try {
    const customers = await Customer.find().sort({ _id: -1 });
    res.json(customers);
  } catch (err) {
    console.error('GET /api/customers error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/customers/:id -> جزئیات مشتری
router.get('/:id', async (req, res) => {
  try {
    const customer = await Customer.findById(req.params.id);
    if (!customer) return res.status(404).json({ success: false, error: 'مشتری پیدا نشد' });
    res.json({ success: true, customer });
  } catch (err) {
    console.error('GET /api/customers/:id error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST /api/customers -> افزودن مشتری جدید
router.post('/', async (req, res) => {
  try {
    const { name, phone = '', email = '', address = '', birthday = null } = req.body;
    if (!name || String(name).trim() === '') {
      return res.status(400).json({ success: false, error: 'نام مشتری الزامی است' });
    }

    const newCustomer = new Customer({
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      birthday: birthday || null
    });

    await newCustomer.save();
    res.json({ success: true, id: newCustomer._id });
  } catch (err) {
    console.error('POST /api/customers error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// PUT /api/customers/:id -> ویرایش مشتری
router.put('/:id', async (req, res) => {
  try {
    const { name, phone = '', email = '', address = '', birthday = null } = req.body;
    if (!name || String(name).trim() === '') {
      return res.status(400).json({ success: false, error: 'نام مشتری الزامی است' });
    }

    await Customer.findByIdAndUpdate(req.params.id, {
      name: name.trim(),
      phone: phone.trim(),
      email: email.trim(),
      address: address.trim(),
      birthday: birthday || null
    });

    res.json({ success: true });
  } catch (err) {
    console.error('PUT /api/customers/:id error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE /api/customers/:id -> حذف مشتری
router.delete('/:id', async (req, res) => {
  try {
    const result = await Customer.findByIdAndDelete(req.params.id);
    res.json({ success: !!result });
  } catch (err) {
    console.error('DELETE /api/customers/:id error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
