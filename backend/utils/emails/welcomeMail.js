// Import the necessary modules here
import nodemailer from "nodemailer";

export const sendWelcomeEmail = async (user) => {
  // Write your code here
  const transporter = nodemailer.createTransport({
    service: process.env.SMPT_SERVICE,
    auth: {
      user: process.env.STORFLEET_SMPT_MAIL,
      pass: process.env.STORFLEET_SMPT_MAIL_PASSWORD,
    },
  });

  const mailOptions = {
    from: `"Storefleet" <${process.env.STORFLEET_SMPT_MAIL}>`,
    to: user.email,
    subject: "Welcome to Storefleet!",
    html: `
        <!DOCTYPE html>
        <html lang="en">
          <head>
            <meta charset="UTF-8" />
            <meta name="viewport" content="width=device-width, initial-scale=1.0" />
            <title>Document</title>

            <style>
              body {
                font-family: Arial, Helvetica, sans-serif;
                background-color: #f9f9f9;
                margin: 0;
                padding: 0;
              }

              .container {
                max-width: 600px;
                margin: 20px auto;
                background-color: #ffffff;
                padding: 30px;
                border-radius: 8px;
                box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
              }

              .header {
                text-align: center;
              }

              .logo {
                width: 120px;
                margin-bottom: 20px;
              }

              h1 {
                color: #333333;
              }

              p {
                color: #333333;
                font-size: 16px;
              }

              .btn {
                text-align: center;
              }

              .button {
                display: inline-block;
                margin-top: 20px;
                padding: 12px 24px;
                background-color: purple;
                color: white;
                text-decoration: none;
                font-weight: bold;
                border-radius: 5px;
              }
            </style>
          </head>
          <body>
            <div class="container">
              <div class="header">
                <img
                  src="https://files.codingninjas.in/logo1-32230.png"
                  alt="Storefleet Logo"
                  class="logo"
                />
                <h1>Welcome to Storefleet</h1>
              </div>

              <p>Hello <strong>${user.name}</strong>,</p>
              <p>
                Thank you for registering with Storefleet. We are excited to have you as
                a new member of our community.
              </p>

              <div class="btn">
                <a href="" class="button" target="_blank">Get Started</a>
              </div>
            </div>
          </body>
        </html>
    `,
  };

  await transporter.sendMail(mailOptions);
};
