const getOTPVerificationTemplate = (otp) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Email Verification - ExamCoach</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #f4f7fb;
                margin: 0;
                padding: 0;
                -webkit-font-smoothing: antialiased;
            }
            .container {
                max-width: 600px;
                margin: 40px auto;
                background-color: #ffffff;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
            }
            .header {
                background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
                padding: 30px 20px;
                text-align: center;
            }
            .header h1 {
                color: #ffffff;
                margin: 0;
                font-size: 28px;
                font-weight: 700;
                letter-spacing: 1px;
            }
            .content {
                padding: 40px 30px;
                color: #333333;
                text-align: center;
            }
            .content h2 {
                color: #2d3748;
                font-size: 22px;
                font-weight: 600;
                margin-top: 0;
                margin-bottom: 20px;
            }
            .content p {
                font-size: 16px;
                line-height: 1.6;
                color: #4a5568;
                margin-bottom: 30px;
            }
            .otp-box {
                background-color: #f7fafc;
                border: 2px dashed #cbd5e0;
                border-radius: 8px;
                padding: 20px;
                margin: 0 auto 30px;
                max-width: 300px;
            }
            .otp-code {
                font-family: 'Courier New', Courier, monospace;
                font-size: 36px;
                font-weight: 700;
                color: #764ba2;
                letter-spacing: 8px;
                margin: 0;
            }
            .footer {
                background-color: #f8fafc;
                padding: 20px;
                text-align: center;
                border-top: 1px solid #edf2f7;
            }
            .footer p {
                color: #718096;
                font-size: 14px;
                margin: 0;
            }
            .note {
                font-size: 13px;
                color: #a0aec0;
                margin-top: 10px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>ExamCoach</h1>
            </div>
            <div class="content">
                <h2>Verify Your Email Address</h2>
                <p>Hello,</p>
                <p>Thank you for registering with ExamCoach! Please use the following One-Time Password (OTP) to complete your email verification.</p>
                
                <div class="otp-box">
                    <p class="otp-code">${otp}</p>
                </div>
                
                <p>This code is valid for <strong>10 minutes</strong>. Do not share this code with anyone.</p>
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} ExamCoach. All rights reserved.</p>
                <p class="note">If you did not request this verification, please ignore this email.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

const getPasswordResetTemplate = (resetUrl) => {
    return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>Reset Your Password - ExamCoach</title>
        <style>
            body {
                font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
                background-color: #f4f7fb;
                margin: 0;
                padding: 0;
                -webkit-font-smoothing: antialiased;
            }
            .container {
                max-width: 600px;
                margin: 40px auto;
                background-color: #ffffff;
                border-radius: 12px;
                overflow: hidden;
                box-shadow: 0 4px 15px rgba(0, 0, 0, 0.05);
            }
            .header {
                background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
                padding: 30px 20px;
                text-align: center;
            }
            .header h1 {
                color: #ffffff;
                margin: 0;
                font-size: 28px;
                font-weight: 700;
                letter-spacing: 1px;
            }
            .content {
                padding: 40px 30px;
                color: #333333;
                text-align: center;
            }
            .content h2 {
                color: #2d3748;
                font-size: 22px;
                font-weight: 600;
                margin-top: 0;
                margin-bottom: 20px;
            }
            .content p {
                font-size: 16px;
                line-height: 1.6;
                color: #4a5568;
                margin-bottom: 30px;
                text-align: left;
            }
            .btn-container {
                margin: 35px 0;
            }
            .btn {
                display: inline-block;
                background: linear-gradient(135deg, #4facfe 0%, #00f2fe 100%);
                color: #ffffff;
                font-weight: 600;
                font-size: 16px;
                text-decoration: none;
                padding: 15px 35px;
                border-radius: 50px;
                box-shadow: 0 4px 10px rgba(0, 242, 254, 0.3);
                transition: transform 0.2s, box-shadow 0.2s;
            }
            .btn:hover {
                transform: translateY(-2px);
                box-shadow: 0 6px 15px rgba(0, 242, 254, 0.4);
            }
            .link-text {
                font-size: 13px;
                color: #718096;
                word-break: break-all;
                text-align: left;
                background-color: #f7fafc;
                padding: 15px;
                border-radius: 6px;
                margin-top: 20px;
            }
            .footer {
                background-color: #f8fafc;
                padding: 20px;
                text-align: center;
                border-top: 1px solid #edf2f7;
            }
            .footer p {
                color: #718096;
                font-size: 14px;
                margin: 0;
            }
            .note {
                font-size: 13px;
                color: #a0aec0;
                margin-top: 10px;
            }
        </style>
    </head>
    <body>
        <div class="container">
            <div class="header">
                <h1>ExamCoach</h1>
            </div>
            <div class="content">
                <h2>Password Reset Request</h2>
                <p>Hello,</p>
                <p>We received a request to reset the password for your ExamCoach account. If you made this request, please click the button below to securely set a new password.</p>
                
                <div class="btn-container">
                    <a href="${resetUrl}" class="btn" style="color: white !important;">Reset My Password</a>
                </div>
                
                <p>This password reset link will expire in <strong>10 minutes</strong>. If you did not request a password reset, no further action is required and your account remains secure.</p>
                
                <div class="link-text">
                    If the button doesn't work, copy and paste this link into your browser:<br>
                    <a href="${resetUrl}" style="color: #4facfe;">${resetUrl}</a>
                </div>
            </div>
            <div class="footer">
                <p>&copy; ${new Date().getFullYear()} ExamCoach. All rights reserved.</p>
            </div>
        </div>
    </body>
    </html>
    `;
};

module.exports = {
    getOTPVerificationTemplate,
    getPasswordResetTemplate
};
