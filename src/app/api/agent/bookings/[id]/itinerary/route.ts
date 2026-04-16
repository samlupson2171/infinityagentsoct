import { NextRequest, NextResponse } from 'next/server';
import { getToken } from 'next-auth/jwt';
import { connectDB } from '@/lib/mongodb';
import Enquiry from '@/models/Enquiry';
import Quote from '@/models/Quote';

export const dynamic = 'force-dynamic';

function generateItineraryHTML(booking: any, enquiry: any): string {
  const currencySymbol = booking.currency === 'GBP' ? '£' : booking.currency === 'EUR' ? '€' : '$';
  const arrivalDate = new Date(booking.arrivalDate);
  const departureDate = new Date(arrivalDate);
  departureDate.setDate(departureDate.getDate() + booking.numberOfNights);

  const formatDate = (d: Date) => d.toLocaleDateString('en-GB', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' });

  let eventsHTML = '';
  if (booking.selectedEvents?.length > 0) {
    eventsHTML = `
      <div style="margin-top:24px;">
        <h3 style="color:#ea580c;font-size:16px;margin-bottom:12px;border-bottom:2px solid #fed7aa;padding-bottom:8px;">Events & Activities</h3>
        <table style="width:100%;border-collapse:collapse;">
          ${booking.selectedEvents.map((e: any) => `
            <tr style="border-bottom:1px solid #f3f4f6;">
              <td style="padding:8px 0;font-weight:500;">${e.eventName}</td>
              <td style="padding:8px 0;text-align:right;color:#6b7280;">${e.pricePerPerson ? 'Per person' : 'Flat rate'}: ${currencySymbol}${e.eventPrice}</td>
            </tr>
          `).join('')}
        </table>
      </div>`;
  }

  let packageHTML = '';
  if (booking.linkedPackage) {
    packageHTML = `
      <div style="margin-top:24px;background:#fff7ed;border:1px solid #fed7aa;border-radius:8px;padding:16px;">
        <h3 style="color:#ea580c;font-size:16px;margin-bottom:8px;">Package Details</h3>
        <p style="margin:4px 0;"><strong>Package:</strong> ${booking.linkedPackage.packageName}</p>
        <p style="margin:4px 0;"><strong>Group Size:</strong> ${booking.linkedPackage.selectedTier?.tierLabel || 'N/A'}</p>
        <p style="margin:4px 0;"><strong>Period:</strong> ${booking.linkedPackage.selectedPeriod || 'N/A'}</p>
      </div>`;
  }

  return `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"><title>Itinerary - ${booking.leadName}</title></head>
<body style="font-family:'Segoe UI',Tahoma,Geneva,Verdana,sans-serif;max-width:800px;margin:0 auto;padding:40px 20px;color:#1f2937;">
  <div style="text-align:center;margin-bottom:32px;border-bottom:3px solid #ea580c;padding-bottom:24px;">
    <h1 style="color:#ea580c;font-size:28px;margin:0;">Infinity Weekends</h1>
    <p style="color:#6b7280;font-size:14px;margin-top:4px;">Your Holiday Itinerary</p>
  </div>

  <div style="background:#f9fafb;border-radius:12px;padding:24px;margin-bottom:24px;">
    <h2 style="font-size:22px;margin:0 0 4px 0;">${booking.title || booking.leadName}'s Trip</h2>
    <p style="color:#6b7280;margin:0;">Reference: Q${booking._id.toString().slice(-8).toUpperCase()}</p>
  </div>

  <div style="display:grid;grid-template-columns:1fr 1fr;gap:16px;margin-bottom:24px;">
    <div style="background:white;border:1px solid #e5e7eb;border-radius:8px;padding:16px;">
      <p style="color:#6b7280;font-size:12px;text-transform:uppercase;margin:0 0 4px 0;">Destination</p>
      <p style="font-size:18px;font-weight:600;margin:0;">${booking.destination || enquiry?.firstChoiceDestination || 'TBC'}</p>
    </div>
    <div style="background:white;border:1px solid #e5e7eb;border-radius:8px;padding:16px;">
      <p style="color:#6b7280;font-size:12px;text-transform:uppercase;margin:0 0 4px 0;">Hotel</p>
      <p style="font-size:18px;font-weight:600;margin:0;">${booking.hotelName}</p>
    </div>
    <div style="background:white;border:1px solid #e5e7eb;border-radius:8px;padding:16px;">
      <p style="color:#6b7280;font-size:12px;text-transform:uppercase;margin:0 0 4px 0;">Arrival</p>
      <p style="font-size:16px;font-weight:600;margin:0;">${formatDate(arrivalDate)}</p>
    </div>
    <div style="background:white;border:1px solid #e5e7eb;border-radius:8px;padding:16px;">
      <p style="color:#6b7280;font-size:12px;text-transform:uppercase;margin:0 0 4px 0;">Departure</p>
      <p style="font-size:16px;font-weight:600;margin:0;">${formatDate(departureDate)}</p>
    </div>
  </div>

  <div style="display:grid;grid-template-columns:1fr 1fr 1fr;gap:12px;margin-bottom:24px;">
    <div style="text-align:center;background:#fff7ed;border-radius:8px;padding:12px;">
      <p style="font-size:24px;font-weight:700;color:#ea580c;margin:0;">${booking.numberOfPeople}</p>
      <p style="color:#6b7280;font-size:12px;margin:4px 0 0 0;">Guests</p>
    </div>
    <div style="text-align:center;background:#fff7ed;border-radius:8px;padding:12px;">
      <p style="font-size:24px;font-weight:700;color:#ea580c;margin:0;">${booking.numberOfNights}</p>
      <p style="color:#6b7280;font-size:12px;margin:4px 0 0 0;">Nights</p>
    </div>
    <div style="text-align:center;background:#fff7ed;border-radius:8px;padding:12px;">
      <p style="font-size:24px;font-weight:700;color:#ea580c;margin:0;">${booking.numberOfRooms}</p>
      <p style="color:#6b7280;font-size:12px;margin:4px 0 0 0;">Rooms</p>
    </div>
  </div>

  ${booking.whatsIncluded ? `
  <div style="margin-top:24px;">
    <h3 style="color:#ea580c;font-size:16px;margin-bottom:12px;border-bottom:2px solid #fed7aa;padding-bottom:8px;">What's Included</h3>
    <div style="white-space:pre-line;color:#374151;line-height:1.6;">${booking.whatsIncluded}</div>
  </div>` : ''}

  ${booking.transferIncluded ? `
  <div style="margin-top:16px;background:#ecfdf5;border:1px solid #a7f3d0;border-radius:8px;padding:12px;">
    <p style="margin:0;color:#065f46;font-weight:500;">✓ Airport transfers included</p>
  </div>` : ''}

  ${eventsHTML}
  ${packageHTML}

  <div style="margin-top:32px;background:linear-gradient(135deg,#ea580c,#f97316);border-radius:12px;padding:24px;text-align:center;color:white;">
    <p style="font-size:14px;margin:0 0 4px 0;opacity:0.9;">Total Price</p>
    <p style="font-size:36px;font-weight:700;margin:0;">${currencySymbol}${booking.totalPrice.toLocaleString()}</p>
    <p style="font-size:12px;margin:8px 0 0 0;opacity:0.8;">${currencySymbol}${Math.round(booking.totalPrice / booking.numberOfPeople)} per person</p>
  </div>

  <div style="margin-top:32px;text-align:center;color:#9ca3af;font-size:12px;border-top:1px solid #e5e7eb;padding-top:16px;">
    <p>Infinity Weekends &middot; 0800 994 9934 &middot; emma@infinityweekends.co.uk</p>
  </div>
</body>
</html>`;
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const token = await getToken({ req: request });
    if (!token || !token.isApproved) {
      return NextResponse.json({ success: false, error: 'Unauthorized' }, { status: 401 });
    }

    await connectDB();

    const quote = await Quote.findById(params.id).lean();
    if (!quote) {
      return NextResponse.json({ success: false, error: 'Booking not found' }, { status: 404 });
    }

    // Verify this quote belongs to an enquiry by this agent
    const enquiry = await Enquiry.findOne({
      _id: (quote as any).enquiryId,
      submittedBy: token.sub,
    }).lean();

    if (!enquiry) {
      return NextResponse.json({ success: false, error: 'Not authorized' }, { status: 403 });
    }

    const html = generateItineraryHTML(quote, enquiry);

    return new NextResponse(html, {
      headers: {
        'Content-Type': 'text/html',
        'Content-Disposition': `attachment; filename="itinerary-${(quote as any).leadName.replace(/\s+/g, '-').toLowerCase()}.html"`,
      },
    });
  } catch (error: any) {
    console.error('Error generating itinerary:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to generate itinerary' },
      { status: 500 }
    );
  }
}
