import dynamic from 'next/dynamic';

const RouteEditForm = dynamic(
  () => import('@/components/Routing/RouteEditForm'),
  { ssr: false }
);

export default RouteEditForm;