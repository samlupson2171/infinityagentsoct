import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    // Only allow authenticated admin users to trigger test emails
    const token = await getToken({ req: request });

    if (!token) {
      return NextResponse.json(
        { success: false, error: 'Authentication required' },
        { status: 401 }
      );
    }

    if (token.role !== 'admin') {
      return NextResponse.json(
        { success: false, error: 'Admin access required' },
        { status: 403 }
      );
    }

    const adminEmail =
      process.env.ADMIN_NOTIFICATION_EMAIL || 'sam@resort-experts.com';

    // Dynamically import to avoid issues with email module
    const { sendEnquiryNotificationEmail } = await import('@/lib/email');

    await sendEnquiryNotificationEmail({
      enquiryId: 'TEST-' + Date.now(),
      leadName: 'Test Lead',
      tripType: 'stag',
      firstChoiceDestination: 'Benidorm',
      secondChoiceDestination: 'Marbella',
      thirdChoiceDestination: undefined,
      resort: undefined,
      travelDate: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000), // 90 days from now
      arrivalAirport: 'Manchester',
      numberOfNights: 3,
      numberOfGuests: 12,
      eventsRequested: ['Pool Party', 'Bar Crawl'],
      accommodationType: 'hotel',
      boardType: 'All Inclusive',
      budgetPerPerson: 500,
      additionalNotes: 'This is a TEST notification email to verify delivery.',
      agentName: 'Test Agent',
      agentCompany: 'Test Company Ltd',
      agentEmail: 'test@example.com',
    });

    return NextResponse.json({
      success: true,
      message: `Test notification email sent to ${adminEmail}`,
    });
  } catch (error: any) {
    console.error('Test email failed:', error);
    return NextResponse.json(
      {
        success: false,
        error: error.message || 'Failed to send test email',
        details: error.code || undefined,
      },
      { status: 500 }
    );
  }
}
