import { Metadata } from 'next';
import EventForm from '@/components/admin/EventForm';

export const metadata: Metadata = {
  title: 'Edit Event | Admin',
  description: 'Edit an existing event',
};

export default function EditEventPage({ params }: { params: { id: string } }) {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Edit Event</h1>
        <p className="text-gray-600 mt-1">
          Update event details and settings
        </p>
      </div>
      <EventForm eventId={params.id} />
    </div>
  );
}
