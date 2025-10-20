import { Metadata } from 'next';
import CategoryManager from '@/components/admin/CategoryManager';

export const metadata: Metadata = {
  title: 'Event Categories | Admin',
  description: 'Manage event categories',
};

export default function CategoriesPage() {
  return (
    <div className="container mx-auto px-4 py-8">
      <CategoryManager />
    </div>
  );
}
