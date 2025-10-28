import { NextResponse } from 'next/server';

/**
 * Debug endpoint to check if SMTP environment variables are configured
 * This endpoint does NOT expose sensitive data - only checks if variables exist
 * 
 * Access: /api/debug/check-smtp-config
 */
export async function GET() {
  try {
    const smtpConfig = {
      SMTP_HOST: {
        configured: !!process.env.SMTP_HOST,
        value: process.env.SMTP_HOST ? `${process.env.SMTP_HOST.substring(0, 10)}...` : 'NOT SET'
      },
      SMTP_PORT: {
        configured: !!process.env.SMTP_PORT,
        value: process.env.SMTP_PORT || 'NOT SET'
      },
      SMTP_USER: {
        configured: !!process.env.SMTP_USER,
        value: process.env.SMTP_USER ? `${process.env.SMTP_USER.substring(0, 5)}...@...` : 'NOT SET'
      },
      SMTP_PASS: {
        configured: !!process.env.SMTP_PASS,
        value: process.env.SMTP_PASS ? '***' + process.env.SMTP_PASS.slice(-2) : 'NOT SET'
      },
      SMTP_SECURE: {
        configured: !!process.env.SMTP_SECURE,
        value: process.env.SMTP_SECURE || 'NOT SET'
      },
      EMAIL_FROM_NAME: {
        configured: !!process.env.EMAIL_FROM_NAME,
        value: process.env.EMAIL_FROM_NAME || 'NOT SET'
      },
      EMAIL_FROM_ADDRESS: {
        configured: !!process.env.EMAIL_FROM_ADDRESS,
        value: process.env.EMAIL_FROM_ADDRESS ? `${process.env.EMAIL_FROM_ADDRESS.substring(0, 5)}...` : 'NOT SET'
      }
    };

    const requiredVars = ['SMTP_HOST', 'SMTP_PORT', 'SMTP_USER', 'SMTP_PASS'];
    const allConfigured = requiredVars.every(key => smtpConfig[key as keyof typeof smtpConfig].configured);

    return NextResponse.json({
      status: allConfigured ? 'OK' : 'INCOMPLETE',
      message: allConfigured 
        ? 'All required SMTP environment variables are configured' 
        : 'Some required SMTP environment variables are missing',
      configuration: smtpConfig,
      timestamp: new Date().toISOString(),
      environment: process.env.NODE_ENV || 'unknown'
    });
  } catch (error) {
    return NextResponse.json({
      status: 'ERROR',
      message: 'Failed to check SMTP configuration',
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
