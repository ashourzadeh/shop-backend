// invoicesMongo.js
import express from 'express';
import mongoose from 'mongoose';
import Product from './productsMongoModel.js'; // مدل Product را import کن
// import Customer from './customersMongo.js'; // اگر از customer_id استفاده می‌کنید

const router = express.Router();

// 🔹 Invoice Schema
const invoiceItemSchema = new mongoose.Schema({
  product_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Product' },
  quantity: Number,
  price: Number
});

const invoiceSchema = new mongoose.Schema({
  invoice_no: String,
  customer_name: String,
  customer_id: { type: mongoose.Schema.Types.ObjectId, ref: 'Customer' },
  items: [invoiceItemSchema],
  subtotal: Number,
  tax: Number,
  discount: Number,
  total: Number,
  date: { type: Date, default: Date.now }
});

const Invoice = mongoose.model('Invoice', invoiceSchema);

// GET all invoices (summary)
router.get('/', async (req, res) => {
  try {
    const invoices = await Invoice.find().sort({ _id: -1 });
    res.json(invoices);
  } catch (err) {
    console.error('GET /api/invoices error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET invoice details
router.get('/:id', async (req, res) => {
  try {
    const invoice = await Invoice.findById(req.params.id).populate('items.product_id');
    if (!invoice) return res.status(404).json({ success: false, error: 'فاکتور پیدا نشد' });
    res.json({ success: true, invoice });
  } catch (err) {
    console.error('GET /api/invoices/:id error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// POST create invoice (بدون تراکنش)
router.post('/', async (req, res) => {
  try {
    const { invoice_no, customer_name, customer_id = null, tax = 0, discount = 0, items = [] } = req.body;

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ success: false, error: 'آیتم‌های فاکتور الزامی است' });
    }

    // محاسبه subtotal و total
    let subtotal = 0;
    items.forEach(it => { subtotal += Number(it.price) * Number(it.quantity); });
    const total = subtotal + Number(tax) - Number(discount);

    // کم کردن موجودی محصولات (سریالی)
    for (const it of items) {
      const product = await Product.findById(it.product_id);
      if (!product) throw new Error(`محصول با id=${it.product_id} پیدا نشد`);
      if (product.stock < it.quantity) throw new Error(`موجودی ناکافی برای محصول ${product.name}`);
      product.stock -= it.quantity;
      await product.save();
    }

    // ذخیره فاکتور
    const invoice = new Invoice({ invoice_no, customer_name, customer_id, items, subtotal, tax, discount, total });
    await invoice.save();

    res.json({ success: true, id: invoice._id });
  } catch (err) {
    console.error('POST /api/invoices error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// DELETE invoice
router.delete('/:id', async (req, res) => {
  try {
    const result = await Invoice.findByIdAndDelete(req.params.id);
    res.json({ success: !!result });
  } catch (err) {
    console.error('DELETE /api/invoices/:id error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
