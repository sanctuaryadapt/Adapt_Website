import { getContent } from '@/lib/content'
import PageRenderer from '@/components/PageRenderer'

export const dynamic = 'force-static'

export async function generateStaticParams() {
    const items = await getContent('blogs')
    return items.map((item: any) => ({
        slug: item.slug || item.id,
    }))
}


export default async function BlogPage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const slug = (await params).slug
    const items = await getContent('blogs')
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
                This is a placeholder page for the {slug} blog post.
                Here you would read the full article.
            </p>
            <a href="/" className="mt-8 hover:underline">← Back to Home</a>
        </div>
    )
}
