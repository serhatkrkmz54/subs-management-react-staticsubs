import { Metadata } from 'next';

export const metadata: Metadata = {
    title: 'Statik Abonelikler',
    description: 'Statik abonelikleri yönetin',
};

export default function SubscriptionsLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    return <>{children}</>;
} 