import nodemailer from "nodemailer";
import ejs from "ejs";
import path from "path";

import {
  EMAIL_SMTP_HOST,
  EMAIL_SMTP_PASS,
  EMAIL_SMTP_PORT,
  EMAIL_SMTP_SECURE,
  EMAIL_SMTP_USER,
} from "../env";

const transporter = nodemailer.createTransport({
  host: EMAIL_SMTP_HOST,
  port: EMAIL_SMTP_PORT,
  secure: EMAIL_SMTP_SECURE,
  auth: {
    user: EMAIL_SMTP_USER,
    pass: EMAIL_SMTP_PASS,
  },
});

transporter.verify((error, success) => {
  if (error) {
    console.log("SMTP Error:", error);
  } else {
    console.log("SMTP Ready:", success);
  }
});

export interface ISendMail {
  from: string;
  to: string;
  subject: string;
  html: string;
}

export const sendMail = async ({ from, to, subject, html }: ISendMail) => {
  const res = await transporter.sendMail({
    from,
    to,
    subject,
    html,
  });
  return res;
};

export const renderMailHtml = async (
  template: string,
  data: any,
): Promise<string> => {
  const content = await ejs.renderFile(
    path.join(__dirname, `templates/${template}`),
    data,
  );
  return content as string;
};
