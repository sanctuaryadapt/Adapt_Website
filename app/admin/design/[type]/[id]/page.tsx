import PageBuilder from '@/components/admin/PageBuilder'

export default async function DesignPage({
    params
}: {
    params: Promise<{ type: string; id: string }>
}) {
    const { type, id } = await params
    return <PageBuilder type={type} id={id} />
}
