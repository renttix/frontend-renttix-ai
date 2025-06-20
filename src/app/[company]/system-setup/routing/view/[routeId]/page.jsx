import dynamic from 'next/dynamic';

const RouteDetailsView = dynamic(
  () => import('@/components/Routing/RouteDetailsView'),
  { ssr: false }
);

export default RouteDetailsView;