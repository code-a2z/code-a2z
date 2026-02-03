import { sendResponse } from '../../utils/response.js';
import nodemailer from 'nodemailer';
import crypto from 'crypto';

const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;

    // Validate email
    if (!email) {
      return sendResponse(res, 400, 'Email is required');
    }

    // TODO: Check if user exists in database
    // const user = await User.findOne({ email });
    // if (!user) {
    //   return sendResponse(res, 404, 'User not found');
    // }

    // Generate reset token
    const resetToken = crypto.randomBytes(32).toString('hex');
    const resetTokenExpiry = Date.now() + 3600000; // 1 hour

    // TODO: Save token to database
    // user.passwordResetToken = resetToken;
    // user.passwordResetExpires = resetTokenExpiry;
    // await user.save();

    // Create reset URL
    const resetUrl = `${process.env.FRONTEND_URL || 'http://localhost:5173'}/reset-password/${resetToken}`;

    // Configure email transporter
    const transporter = nodemailer.createTransport({
      host: process.env.EMAIL_HOST || 'smtp.gmail.com',
      port: process.env.EMAIL_PORT || 587,
      secure: false,
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD,
      },
    });

    // Email content
    const mailOptions = {
      from: `"Code A2Z" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: 'Password Reset Request',
      html: `
        <div style="font-family: Arial, sans-serif; padding: 20px;">
          <h2>Password Reset Request</h2>
          <p>You requested a password reset for your Code A2Z account.</p>
          <p>Click the link below to reset your password:</p>
          <a href="${resetUrl}" style="display: inline-block; padding: 10px 20px; background-color: #4CAF50; color: white; text-decoration: none; border-radius: 5px;">Reset Password</a>
          <p style="margin-top: 20px;">This link will expire in 1 hour.</p>
          <p>If you didn't request this, please ignore this email.</p>
        </div>
      `,
    };

    // Send email
    await transporter.sendMail(mailOptions);

    console.log('Password reset email sent to:', email);

    return sendResponse(
      res,
      200,
      'Password reset link sent successfully to your email'
    );
  } catch (err) {
    console.error('Forgot password error:', err);
    return sendResponse(
      res,
      500,
      err.message || 'Failed to send reset link. Please try again later.'
    );
  }
};

export default forgotPassword;
