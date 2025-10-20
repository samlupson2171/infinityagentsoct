import { Metadata } from 'next';
import EventForm from '@/components/admin/EventForm';

export const metadata: Metadata = {
  title: 'Create Event | Admin',
  description: 'Create a new event',
};

export default function NewEventPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Create New Event</h1>
        <p className="text-gray-600 mt-1">
          Add a new event that will be available for enquiry forms
        </p>
      </div>
      <EventForm />
    </div>
  );
}
