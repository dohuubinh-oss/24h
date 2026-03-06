import sgMail from '@sendgrid/mail';

// Cấu hình API Key cho SendGrid
sgMail.setApiKey(process.env.SENDGRID_API_KEY);

const sendEmail = async (options) => {
  const msg = {
    to: options.email, // Người nhận
    from: {
       name: process.env.SENDGRID_FROM_NAME, // Changed for clarity
       email: process.env.SENDGRID_FROM_EMAIL // Changed for clarity
   }, // Người gửi đã được xác thực trên SendGrid
   subject: options.subject, // Chủ đề email
   text: options.message, // Nội dung text
   // html: '<strong>and easy to do anywhere, even with Node.js</strong>', // Bạn cũng có thể dùng nội dung HTML
 };

  try {
    await sgMail.send(msg);
    console.log('Email sent successfully');
  } catch (error) {
    console.error('Error sending email', error);

    if (error.response) {
      console.error(error.response.body)
    }
    // Ném lỗi để controller có thể bắt và xử lý
    throw new Error('Email could not be sent');
  }
};

export default sendEmail;
