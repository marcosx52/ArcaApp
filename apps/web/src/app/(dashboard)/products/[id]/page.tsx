import { ProductDetailScreen } from '@/features/products/components/product-detail-screen';

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const { id } = params;
  return <ProductDetailScreen productId={id} />;
}
