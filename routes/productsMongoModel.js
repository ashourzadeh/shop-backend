// productsMongoModel.js
import mongoose from 'mongoose';

const productSchema = new mongoose.Schema({
  sku: String,
  name: { type: String, required: true },
  description: String,
  price: Number,
  attributes: Object,
  stock: Number,
  qr_code: String,
  created_at: { type: Date, default: Date.now }
});

const Product = mongoose.model('Product', productSchema);
export default Product;
