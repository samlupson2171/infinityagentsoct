import { NextRequest, NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/auth-middleware';
import { sendTestEmail } from '@/lib/email';
import { z } from 'zod';


export const dynamic = 'force-dynamic';
const emailSettingsSchema = z.object({
  fromEmail: z.string().email('Valid from email is required'),
  fromName: z.string().min(1, 'From name is required'),
  // Optional SMTP fields for backward compatibility
  smtpHost: z.string().optional(),
  smtpPort: z.number().optional(),
  smtpUser: z.string().optional(),
  smtpPassword: z.string().optional(),
  enableTLS: z.boolean().optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Verify admin authorization
    const adminToken = await requireAdmin(request);

    // Parse and validate request body
    const body = await request.json();
    const emailSettings = emailSettingsSchema.parse(body);

    // Send test email using SMTP
    await sendTestEmail({
      toEmail: emailSettings.fromEmail, // Send test email to the from address
      fromEmail: emailSettings.fromEmail,
      fromName: emailSettings.fromName,
    });

    return NextResponse.json({
      success: true,
      message: 'Test email sent successfully',
    });
  } catch (error: any) {
    console.error('Error sending test email:', error);

    // Handle auth errors
    if (error instanceof NextResponse) {
      return error;
    }

    // Handle validation errors
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'VALIDATION_ERROR',
            message: 'Invalid email settings',
            details: error.errors,
          },
        },
        { status: 400 }
      );
    }

    // Handle SMTP errors
    if (error.message?.includes('authentication') || error.message?.includes('auth')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'SMTP_AUTH_ERROR',
            message:
              'SMTP authentication failed. Please check your SMTP_USER and SMTP_PASS environment variables.',
          },
        },
        { status: 400 }
      );
    }

    if (error.message?.includes('connection') || error.message?.includes('ECONNREFUSED')) {
      return NextResponse.json(
        {
          success: false,
          error: {
            code: 'SMTP_CONNECTION_ERROR',
            message:
              'Could not connect to SMTP server. Please check your SMTP_HOST and SMTP_PORT settings.',
          },
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      {
        success: false,
        error: {
          code: 'EMAIL_TEST_ERROR',
          message: error.message || 'Failed to send test email',
        },
      },
      { status: 500 }
    );
  }
}
