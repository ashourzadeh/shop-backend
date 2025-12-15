import express from 'express';
import mongoose from 'mongoose';
import ExcelJS from 'exceljs';
import PDFDocument from 'pdfkit';

const router = express.Router();

const Invoice = mongoose.model('Invoice'); // فرض بر این است که Invoice قبلاً ساخته شده

// GET /api/reports
router.get('/', async (req, res) => {
  try {
    const { startDate, endDate, customerId } = req.query;
    const filter = {};

    if (startDate) filter.date = { $gte: new Date(startDate) };
    if (endDate) filter.date = { ...filter.date, $lte: new Date(endDate) };
    if (customerId && customerId !== 'all') filter.customer_id = mongoose.Types.ObjectId(customerId);

    const invoices = await Invoice.find(filter).sort({ _id: -1 });

    const data = invoices.map(r => ({
      id: r._id,
      invoice_no: r.invoice_no,
      customer_name: r.customer_name || '-',
      date: r.date ? r.date.toISOString().split('T')[0] : '-',
      total: r.total || 0
    }));

    const totalInvoices = data.length;
    const totalAmount = data.reduce((s, item) => s + (item.total || 0), 0);

    res.json({ success: true, summary: { totalInvoices, totalAmount }, data });
  } catch (err) {
    console.error('GET /api/reports error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/reports/export/excel
router.get('/export/excel', async (req, res) => {
  try {
    const { startDate, endDate, customerId } = req.query;
    const filter = {};

    if (startDate) filter.date = { $gte: new Date(startDate) };
    if (endDate) filter.date = { ...filter.date, $lte: new Date(endDate) };
    if (customerId && customerId !== 'all') filter.customer_id = mongoose.Types.ObjectId(customerId);

    const invoices = await Invoice.find(filter).sort({ _id: -1 });

    const workbook = new ExcelJS.Workbook();
    const ws = workbook.addWorksheet('Reports');

    ws.columns = [
      { header: 'ID', key: 'id', width: 8 },
      { header: 'Invoice No', key: 'invoice_no', width: 20 },
      { header: 'Customer', key: 'customer_name', width: 30 },
      { header: 'Date', key: 'date', width: 20 },
      { header: 'Total', key: 'total', width: 15 },
    ];

    invoices.forEach(r => {
      ws.addRow({
        id: r._id.toString(),
        invoice_no: r.invoice_no,
        customer_name: r.customer_name || '-',
        date: r.date ? r.date.toISOString().split('T')[0] : '',
        total: r.total || 0
      });
    });

    res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
    res.setHeader('Content-Disposition', `attachment; filename="reports_${Date.now()}.xlsx"`);

    await workbook.xlsx.write(res);
    res.end();
  } catch (err) {
    console.error('GET /api/reports/export/excel error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

// GET /api/reports/export/pdf
router.get('/export/pdf', async (req, res) => {
  try {
    const { startDate, endDate, customerId } = req.query;
    const filter = {};

    if (startDate) filter.date = { $gte: new Date(startDate) };
    if (endDate) filter.date = { ...filter.date, $lte: new Date(endDate) };
    if (customerId && customerId !== 'all') filter.customer_id = mongoose.Types.ObjectId(customerId);

    const invoices = await Invoice.find(filter).sort({ _id: -1 });

    const doc = new PDFDocument({ margin: 30, size: 'A4' });
    res.setHeader('Content-Type', 'application/pdf');
    res.setHeader('Content-Disposition', `attachment; filename=reports_${Date.now()}.pdf`);
    doc.font('Helvetica');

    doc.fontSize(16).text('گزارش فاکتورها', { align: 'center' });
    doc.moveDown(0.5);

    doc.fontSize(10);
    doc.text('ردیف', 40, doc.y, { continued: true });
    doc.text('شماره', 80, doc.y, { continued: true });
    doc.text('مشتری', 160, doc.y, { continued: true });
    doc.text('تاریخ', 340, doc.y, { continued: true });
    doc.text('مبلغ', 440, doc.y);
    doc.moveDown(0.5);

    let idx = 1;
    for (const r of invoices) {
      const dateText = r.date ? r.date.toISOString().split('T')[0] : '';
      doc.text(String(idx), 40, doc.y, { continued: true });
      doc.text(r.invoice_no || r._id.toString(), 80, doc.y, { continued: true });
      doc.text(r.customer_name || '-', 160, doc.y, { continued: true });
      doc.text(dateText, 340, doc.y, { continued: true });
      doc.text(Number(r.total || 0).toLocaleString(), 440, doc.y);
      doc.moveDown(0.2);
      idx++;
      if (doc.y > 750) doc.addPage();
    }

    doc.end();
    doc.pipe(res);
  } catch (err) {
    console.error('GET /api/reports/export/pdf error:', err);
    res.status(500).json({ success: false, error: err.message });
  }
});

export default router;
