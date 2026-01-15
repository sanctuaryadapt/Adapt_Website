
import { getContent } from '@/lib/content'
import PageRenderer from '@/components/PageRenderer'
import { notFound } from 'next/navigation'

export const dynamic = 'force-static'

type ContentType = 'products' | 'blogs' | 'research'

interface ContentPageProps {
    params: Promise<{ slug: string }>
    type: ContentType
    singularTitle: string // e.g. "product", "blog post", "research project"
}

export async function generateStaticParamsFor(type: ContentType) {
    const items = await getContent(type)
    return items.map((item: any) => ({
        slug: item.slug || item.id,
    }))
}

export default async function ContentPage({ params, type, singularTitle }: ContentPageProps) {
    const slug = (await params).slug
    const items = await getContent(type)

    // Find item by slug, id, or approximately by title
    const item = items.find((p: any) =>
        p.slug === slug ||
        p.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug ||
        p.id === slug
    )

    // Note: If strictly required, we could check !item and return notFound() here.
    // However, the original code fell through to a placeholder if not found (or if found but no blocks).
    // The original logic was:
    // "if (item?.blocks && item.blocks.length > 0) return renderer"
    // "else return placeholder"

    // If item is not found at all, the original code would probably crash on 'item?.blocks' check 
    // or just render the placeholder with the slug as title. 
    // The placeholder uses `slug` from params, so it works even if item is undefined.
    // I will preserve this behavior.

    if (item && (item as any).blocks && (item as any).blocks.length > 0) {
        return <PageRenderer blocks={(item as any).blocks} />
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-white text-black p-8">
            <h1 className="text-5xl font-bold mb-4 capitalize">{slug}</h1>
            <p className="text-xl text-gray-600 max-w-2xl text-center">
                This is a placeholder page for the {slug} {singularTitle}.
                {type === 'products' && " Here you would detail the specs, features, and use cases."}
                {type === 'blogs' && " Here you would read the full article."}
                {type === 'research' && " Here you would share abstract, methodology, and results."}
            </p>
            <a href="/" className="mt-8 hover:underline">← Back to Home</a>
        </div>
    )
}
