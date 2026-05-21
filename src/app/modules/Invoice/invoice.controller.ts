import httpStatus from 'http-status';
import { Request } from 'express';
import { asyncHandler, sendResponse } from '../../utils';
import { InvoiceService } from './invoice.service';

const getBaseUrl = (req: Request) => {
  const forwardedProto = req.headers['x-forwarded-proto'];
  const protocol =
    typeof forwardedProto === 'string'
      ? forwardedProto.split(',')[0]
      : req.protocol;

  return `${protocol}://${req.get('host')}`;
};

const formatMoney = (value?: number) => `$${Number(value ?? 0).toFixed(2)}`;

const escapeHtml = (value: unknown) =>
  String(value ?? '')
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');

const renderInvoiceHtml = (invoice: any) => {
  const customer = invoice.customer ?? {};
  const order = invoice.order ?? {};
  const lineItems = invoice.lineItems ?? [];
  const generatedAt = invoice.generatedAt
    ? new Date(invoice.generatedAt).toLocaleString()
    : new Date().toLocaleString();

  return `<!doctype html>
<html>
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width,initial-scale=1" />
    <title>${escapeHtml(invoice.invoiceNumber)}</title>
    <style>
      body { font-family: Arial, sans-serif; color: #111827; margin: 0; background: #f8fafc; }
      .page { max-width: 760px; margin: 32px auto; background: #fff; padding: 32px; border-radius: 16px; }
      .top { display: flex; justify-content: space-between; gap: 24px; border-bottom: 1px solid #e5e7eb; padding-bottom: 24px; }
      h1 { margin: 0; color: #01A1FF; }
      .muted { color: #6b7280; font-size: 14px; }
      table { width: 100%; border-collapse: collapse; margin-top: 28px; }
      th, td { padding: 14px 10px; border-bottom: 1px solid #e5e7eb; text-align: left; }
      th { color: #6b7280; font-size: 13px; text-transform: uppercase; }
      .right { text-align: right; }
      .total { font-size: 22px; font-weight: 700; color: #01A1FF; }
      .actions { margin-top: 28px; }
      button { background: #01A1FF; color: #fff; border: 0; padding: 12px 18px; border-radius: 10px; font-weight: 700; }
      @media print { body { background: #fff; } .page { margin: 0; max-width: none; border-radius: 0; } .actions { display: none; } }
    </style>
  </head>
  <body>
    <main class="page">
      <section class="top">
        <div>
          <h1>SudsyGo Invoice</h1>
          <p class="muted">Invoice #${escapeHtml(invoice.invoiceNumber)}</p>
          <p class="muted">Generated ${escapeHtml(generatedAt)}</p>
        </div>
        <div>
          <strong>${escapeHtml(customer.name ?? 'Customer')}</strong>
          <p class="muted">${escapeHtml(customer.email ?? '')}</p>
          <p class="muted">${escapeHtml(customer.phone ?? '')}</p>
        </div>
      </section>
      <p class="muted">Order #${escapeHtml(order._id ?? invoice.order)}</p>
      <table>
        <thead>
          <tr><th>Item</th><th class="right">Qty</th><th class="right">Amount</th><th class="right">Line Total</th></tr>
        </thead>
        <tbody>
          ${lineItems
            .map(
              (item: any) => `<tr>
                <td>${escapeHtml(item.name)}</td>
                <td class="right">${escapeHtml(item.quantity)}</td>
                <td class="right">${formatMoney(item.amount)}</td>
                <td class="right">${formatMoney(Number(item.amount ?? 0) * Number(item.quantity ?? 0))}</td>
              </tr>`,
            )
            .join('')}
        </tbody>
      </table>
      <p class="right total">Total ${formatMoney(invoice.total)}</p>
      <p class="muted">Payment status: ${invoice.paid ? 'Paid' : 'Unpaid'}</p>
      <div class="actions">
        <button onclick="window.print()">Download / Print PDF</button>
      </div>
    </main>
  </body>
</html>`;
};

// 1. getInvoiceByOrderId
const getInvoiceByOrderId = asyncHandler(async (req, res) => {
  const doc = await InvoiceService.getInvoiceByOrderIdFromDB(
    String(req.params.orderId),
  );

  if (!doc) {
    return sendResponse(res, {
      statusCode: httpStatus.NOT_FOUND,
      message: 'Invoice not found!',
      data: null,
    });
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Invoice fetched successfully!',
    data: doc,
  });
});

// 2. getInvoiceByNumber
const getInvoiceByNumber = asyncHandler(async (req, res) => {
  const doc = await InvoiceService.getInvoiceByNumberFromDB(
    String(req.params.invoiceNumber),
  );

  if (!doc) {
    return sendResponse(res, {
      statusCode: httpStatus.NOT_FOUND,
      message: 'Invoice not found!',
      data: null,
    });
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Invoice fetched successfully!',
    data: doc,
  });
});

const createInvoiceDownloadLink = asyncHandler(async (req, res) => {
  const invoice = await InvoiceService.getAuthorizedInvoiceByOrderIdFromDB(
    String(req.params.orderId),
    String(req.user._id),
    req.user.role,
  );
  const token = InvoiceService.createInvoiceDownloadToken(
    String(invoice.order),
    String(req.user._id),
  );

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Invoice download link created successfully!',
    data: {
      invoice,
      downloadUrl: `${getBaseUrl(req)}/api/v1/invoices/download/${token}`,
      expiresIn: 600,
    },
  });
});

const downloadInvoice = asyncHandler(async (req, res) => {
  const invoice = await InvoiceService.getInvoiceFromDownloadToken(
    String(req.params.token),
  );
  const html = renderInvoiceHtml(invoice);

  res
    .status(httpStatus.OK)
    .setHeader('Content-Type', 'text/html; charset=utf-8')
    .setHeader(
      'Content-Disposition',
      `inline; filename="${invoice.invoiceNumber}.html"`,
    )
    .send(html);
});

// 3. createInvoice
const createInvoice = asyncHandler(async (req, res) => {
  const doc = await InvoiceService.createInvoiceIntoDB(
    String(req.params.orderId),
  );

  if (!doc) {
    return sendResponse(res, {
      statusCode: httpStatus.NOT_FOUND,
      message: 'Order not found!',
      data: null,
    });
  }

  sendResponse(res, {
    statusCode: httpStatus.OK,
    message: 'Invoice created successfully!',
    data: doc,
  });
});

export const InvoiceController = {
  getInvoiceByOrderId,
  getInvoiceByNumber,
  createInvoiceDownloadLink,
  downloadInvoice,
  createInvoice,
};
