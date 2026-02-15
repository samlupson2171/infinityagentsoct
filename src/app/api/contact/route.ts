import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import nodemailer from 'nodemailer';

export const dynamic = 'force-dynamic';

const contactSchema = z.object({
  name: z.string().min(1, 'Name is required').max(100),
  email: z.string().email('Valid email is required'),
  phone: z.string().max(30).optional(),
  company: z.string().max(100).optional(),
  message: z.string().min(1, 'Message is required').max(2000),
});

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const data = contactSchema.parse(body);

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: process.env.SMTP_SECURE === 'true',
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASSWORD,
      },
    });

    await transporter.sendMail({
      from: process.env.SMTP_FROM || process.env.SMTP_USER,
      to: 'emma@infinityweekends.co.uk',
      replyTo: data.email,
      subject: `New Website Enquiry from ${data.name}${data.company ? ` (${data.company})` : ''}`,
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #f97316;">New Website Enquiry</h2>
          <table style="width: 100%; border-collapse: collapse;">
            <tr><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eee;">Name</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${data.name}</td></tr>
            <tr><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eee;">Email</td><td style="padding: 8px; border-bottom: 1px solid #eee;"><a href="mailto:${data.email}">${data.email}</a></td></tr>
            ${data.phone ? `<tr><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eee;">Phone</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${data.phone}</td></tr>` : ''}
            ${data.company ? `<tr><td style="padding: 8px; font-weight: bold; border-bottom: 1px solid #eee;">Company</td><td style="padding: 8px; border-bottom: 1px solid #eee;">${data.company}</td></tr>` : ''}
          </table>
          <h3 style="margin-top: 20px;">Message</h3>
          <p style="background: #f9fafb; padding: 16px; border-radius: 8px; white-space: pre-wrap;">${data.message}</p>
          <hr style="margin-top: 30px; border: none; border-top: 1px solid #eee;" />
          <p style="color: #9ca3af; font-size: 12px;">Sent from the Infinity Weekends website contact form</p>
        </div>
      `,
    });

    return NextResponse.json({ success: true, message: 'Message sent successfully' });
  } catch (error: any) {
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid form data', details: error.errors },
        { status: 400 }
      );
    }
    console.error('Contact form error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to send message. Please try again or contact us directly.' },
      { status: 500 }
    );
  }
}
