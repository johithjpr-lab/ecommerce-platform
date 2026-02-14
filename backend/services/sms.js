// SMS Service - integrates with SMS gateway (Twilio/MSG91/similar)
// In production, replace with actual SMS API calls

export const sendSMS = async (phone, message) => {
  try {
    console.log(`[SMS] To: ${phone} | Message: ${message}`);
    // In production: call actual SMS API
    // const response = await fetch('https://api.smsgateway.com/send', {
    //   method: 'POST',
    //   headers: { 'Authorization': `Bearer ${process.env.SMS_API_KEY}` },
    //   body: JSON.stringify({ to: phone, message, sender: process.env.SMS_SENDER })
    // });
    return { success: true, messageId: `sms_${Date.now()}` };
  } catch (error) {
    console.error('SMS send error:', error.message);
    return { success: false, error: error.message };
  }
};

export const sendOrderConfirmationSMS = (phone, orderNumber) =>
  sendSMS(phone, `GadgetZone: Your order ${orderNumber} is confirmed! Track it in your account. Thank you for shopping!`);

export const sendShippingUpdateSMS = (phone, orderNumber, status) =>
  sendSMS(phone, `GadgetZone: Order ${orderNumber} update - ${status.replace(/_/g, ' ')}. Track live at your dashboard.`);

export const sendDeliveryConfirmationSMS = (phone, orderNumber) =>
  sendSMS(phone, `GadgetZone: Order ${orderNumber} delivered! Rate your experience in the app. Thank you!`);
