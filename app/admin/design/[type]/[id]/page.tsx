import PageBuilder from '@/components/admin/PageBuilder'

import { getContent } from '@/lib/content'

export async function generateStaticParams() {
    const types = ['products', 'research', 'blogs'] as const
    let params: { type: string; id: string }[] = []

    for (const type of types) {
        const items = await getContent(type)
        items.forEach((item: any) => {
            params.push({ type, id: item.id })
        })
    }
    return params
}

export default async function DesignPage({
    params
}: {
    params: Promise<{ type: string; id: string }>
}) {
    const { type, id } = await params
    return <PageBuilder type={type} id={id} />
}
