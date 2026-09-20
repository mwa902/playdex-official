import { EventDetail } from '@/components/console';
export default async function Page({ params }: { params: Promise<{ id: string }> }) { const { id } = await params; return <EventDetail id={id} />; }
