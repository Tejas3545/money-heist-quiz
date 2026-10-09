import type { Metadata } from 'next';
import AdminApp from '@/components/admin/AdminApp';

export const metadata: Metadata = { title: 'HQ', robots: { index: false, follow: false } };

export default function Page() {
  return <AdminApp />;
}
