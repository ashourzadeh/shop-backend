import { MongoClient } from 'mongodb';
import dotenv from 'dotenv';
dotenv.config();

const uri = process.env.MONGO_URI || 'mongodb://127.0.0.1:27017';
const client = new MongoClient(uri);

async function initDB() {
  try {
    await client.connect();
    const db = client.db('pos_db_mongo');

    // 🗑️ پاک کردن دیتابیس قبلی
    await db.dropDatabase();
    console.log('🗑️ دیتابیس قبلی پاک شد ✅');

    // -------------------------------
    // 1️⃣ کالکشن Customers
    await db.collection('customers').insertMany([
      { id: 1, name: 'مروارید', phone: '0911', email: '', address: 'رشت', birthday: null, created_at: new Date('2025-11-05T17:20:05') },
      { id: 2, name: 'مهسا', phone: '0936', email: '', address: 'گیلان', birthday: null, created_at: new Date('2025-11-09T18:47:59') }
    ]);
    console.log('📂 Customers ساخته شد ✅');

    // -------------------------------
    // 2️⃣ کالکشن Products
    await db.collection('products').insertMany([
      { id: 1, sku: '00001', name: 'جوراب ساق کوتاه', description: 'طرح دار', price: 65000, attributes: {}, stock: 6, created_at: new Date('2025-11-12T17:07:36'), qr_code: 'qrcodes/product_1.png' },
      { id: 2, sku: '00002', name: 'پیراهن', description: 'تینیجری', price: 200000, attributes: {}, stock: 10, created_at: new Date('2025-11-12T17:34:23'), qr_code: 'qrcodes/product_2.png' },
      { id: 3, sku: null, name: 'کفش', description: 'سیاه - سفید', price: 450000, attributes: {}, stock: 10, created_at: new Date('2025-11-12T17:35:05'), qr_code: 'qrcodes/product_3.png' },
      { id: 4, sku: '00004', name: 'جوراب ساق بلند', description: 'ساده', price: 70000, attributes: {}, stock: 9, created_at: new Date('2025-11-12T17:38:12'), qr_code: 'qrcodes/product_4.png' }
    ]);
    console.log('📂 Products ساخته شد ✅');

    // -------------------------------
    // 3️⃣ کالکشن Invoices
    await db.collection('invoices').insertMany([
      { id: 1, customer_id: null, invoice_no: 'INV-1763325607408', customer_name: 'مهسا', date: new Date('2025-11-17T00:10:07'), subtotal: 515000, tax: 0, discount: 0, total: 515000 },
      { id: 2, customer_id: null, invoice_no: 'INV-1763497576193', customer_name: 'مهسا', date: new Date('2025-11-18T23:56:16'), subtotal: 200000, tax: 0, discount: 0, total: 200000 },
      { id: 3, customer_id: null, invoice_no: 'INV-1763497614306', customer_name: 'سارا', date: new Date('2025-11-18T23:56:54'), subtotal: 330000, tax: 0, discount: 0, total: 330000 },
      { id: 4, customer_id: null, invoice_no: 'INV-1763497661905', customer_name: 'نیلوفر', date: new Date('2025-11-18T23:57:41'), subtotal: 515000, tax: 0, discount: 0, total: 515000 }
    ]);
    console.log('📂 Invoices ساخته شد ✅');

    // -------------------------------
    // 4️⃣ کالکشن InvoiceItems
    await db.collection('invoice_items').insertMany([
      { id: 1, invoice_id: 1, product_id: 1, quantity: 1, price: 65000 },
      { id: 2, invoice_id: 1, product_id: 3, quantity: 1, price: 450000 },
      { id: 3, invoice_id: 2, product_id: 2, quantity: 1, price: 200000 },
      { id: 4, invoice_id: 3, product_id: 1, quantity: 2, price: 65000 },
      { id: 5, invoice_id: 3, product_id: 2, quantity: 1, price: 200000 },
      { id: 6, invoice_id: 4, product_id: 1, quantity: 1, price: 65000 },
      { id: 7, invoice_id: 4, product_id: 3, quantity: 1, price: 450000 }
    ]);
    console.log('📂 InvoiceItems ساخته شد ✅');

    // -------------------------------
    // 5️⃣ کالکشن Sales
    await db.collection('sales').insertMany([
      { id: 1, invoice_no: 'INV-1763325607408', customer_name: 'مهسا', total: 515000, tax: 0, discount: 0, created_at: new Date() },
      { id: 2, invoice_no: 'INV-1763497576193', customer_name: 'مهسا', total: 200000, tax: 0, discount: 0, created_at: new Date() }
    ]);
    console.log('📂 Sales ساخته شد ✅');

    // -------------------------------
    // 6️⃣ کالکشن SaleItems
    await db.collection('sale_items').insertMany([
      { id: 1, sale_id: 1, product_id: 1, quantity: 1, price: 65000 },
      { id: 2, sale_id: 1, product_id: 3, quantity: 1, price: 450000 }
    ]);
    console.log('📂 SaleItems ساخته شد ✅');

    // -------------------------------
    // 7️⃣ کالکشن Users
    await db.collection('users').insertMany([
      { id: 1, username: 'admin', password: '123456', role: 'admin', created_at: new Date() },
      { id: 2, username: 'seller', password: '123456', role: 'seller', created_at: new Date() }
    ]);
    console.log('📂 Users ساخته شد ✅');

    console.log('🎉 تمام دیتابیس با موفقیت ساخته شد!');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
}

initDB();
