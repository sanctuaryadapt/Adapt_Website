import { getContent } from '@/lib/content'
import PageRenderer from '@/components/PageRenderer'

export const dynamic = 'force-dynamic'

export default async function ResearchPage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const slug = (await params).slug
    const items = await getContent('research')
    const item = items.find((p: any) =>
        p.slug === slug ||
        p.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug ||
        p.id === slug
    )

    if (item?.blocks && item.blocks.length > 0) {
        return <PageRenderer blocks={item.blocks} />
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-white text-black p-8">
            <h1 className="text-5xl font-bold mb-4 capitalize">{slug}</h1>
            <p className="text-xl text-gray-600 max-w-2xl text-center">
                This is a placeholder page for the {slug} research project.
                Here you would share abstract, methodology, and results.
            </p>
            <a href="/" className="mt-8 hover:underline">← Back to Home</a>
        </div>
    )
}
