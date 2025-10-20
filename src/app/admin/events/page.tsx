import { Metadata } from 'next';
import EventsManager from '@/components/admin/EventsManager';

export const metadata: Metadata = {
  title: 'Events Management | Admin',
  description: 'Manage events for enquiry forms',
};

export default function EventsPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <EventsManager />
    </div>
  );
}
