import nodemailer from "nodemailer";
import path from "path";
import Email from "email-templates";

interface SendMailOptions {
  to: string; // Recipient email address
  subject: string; // Email subject
  template: string; // Template name (e.g., 'welcome')
  variables: Record<string, any>; // Variables to inject into the template (optional)
}

/**
 * Utility function to send templated emails
 * @param {SendMailOptions} options - The mail options (to, subject, template, variables)
 * @returns {Promise<void>}
 */
export const sendMail = async (options: SendMailOptions): Promise<void> => {
  try {
    // Create a transporter using SMTP and environment variables
    const transporter = nodemailer.createTransport({
      host: process.env.MAIL_HOST,
      port: Number(process.env.MAIL_PORT) || 587,
      secure: process.env.MAIL_ENCRYPTION === "ssl",
      auth: {
        user: process.env.MAIL_USERNAME,
        pass: process.env.MAIL_PASSWORD,
      },
      tls: {
        rejectUnauthorized: false, // Allows working with self-signed certificates if needed
      },
    });

    const template = path.join(__dirname, "..", "views", "emails");

    console.log("template",template);
    

    // Create an instance of the Email template engine
    const email = new Email({
      message: {
        from: `"${process.env.MAIL_FROM_NAME}" <${process.env.MAIL_FROM_ADDRESS}>`,
      },
      transport: transporter,
      send: true,
      views: {
        root: template, //path.join(__dirname, "..", "..", "views", "emails"), // Adjust path to your template location
        options: {
          extension: "ejs", // Using EJS as the template engine
        },
      },
    });

    // Send the email using the defined template and variables
    await email.send({
      template: options.template, // e.g., 'welcome' (refers to 'src/views/emails/welcome.ejs')
      message: {
        to: options.to, // Recipient email address
        subject: options.subject, // Subject of the email
      },
      locals: options.variables, // Variables to inject into the template
    });

    console.log(`Email sent to ${options.to}`);
  } catch (error) {
    console.error(`Error sending email: ${error}`);
    throw new Error("Failed to send email");
  }
};
