import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || 'smtp.gmail.com',
  port: process.env.SMTP_PORT || 587,
  secure: false,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

export const sendEmail = async (to, subject, html) => {
  try {
    await transporter.sendMail({
      from: `"GadgetZone" <${process.env.SMTP_USER || 'noreply@gadgetzone.com'}>`,
      to, subject, html,
    });
    return { success: true };
  } catch (error) {
    console.error('Email send error:', error.message);
    return { success: false, error: error.message };
  }
};

export const sendOrderConfirmation = (email, order) => sendEmail(email, `Order Confirmed - ${order.orderNumber}`, `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f9f9f9">
    <h2 style="color:#2563eb">Order Confirmed!</h2>
    <p>Your order <strong>${order.orderNumber}</strong> has been confirmed.</p>
    <p><strong>Total:</strong> ₹${order.total.toLocaleString()}</p>
    <p><strong>Payment:</strong> ${order.paymentMethod.toUpperCase()}</p>
    <p><strong>Est. Delivery:</strong> ${order.estimatedDelivery ? new Date(order.estimatedDelivery).toLocaleDateString() : '3-5 business days'}</p>
    <hr/><p style="color:#666;font-size:12px">Thank you for shopping with GadgetZone!</p>
  </div>`);

export const sendShippingUpdate = (email, order, status) => sendEmail(email, `Shipping Update - ${order.orderNumber}`, `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f9f9f9">
    <h2 style="color:#2563eb">Shipping Update</h2>
    <p>Order <strong>${order.orderNumber}</strong> status: <strong>${status.replace(/_/g, ' ').toUpperCase()}</strong></p>
    <p>Track your order in your account dashboard.</p>
    <hr/><p style="color:#666;font-size:12px">GadgetZone - Your Electronics Destination</p>
  </div>`);

export const sendDeliveryConfirmation = (email, order) => sendEmail(email, `Delivered - ${order.orderNumber}`, `
  <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;padding:20px;background:#f9f9f9">
    <h2 style="color:#16a34a">Order Delivered!</h2>
    <p>Your order <strong>${order.orderNumber}</strong> has been delivered.</p>
    <p>We hope you enjoy your purchase! Please rate your experience.</p>
  </div>`);
