import { CustomerDetailScreen } from '@/features/customers/components/customer-detail-screen';

export default function CustomerDetailPage({ params }: { params: { id: string } }) {
  return <CustomerDetailScreen customerId={params.id} />;
}
