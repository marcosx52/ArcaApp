import { InvoiceDetailScreen } from '@/features/invoices/components/invoice-detail-screen';

export default function InvoiceDetailPage({ params }: { params: { id: string } }) {
  return <InvoiceDetailScreen invoiceId={params.id} />;
}
