import { getContent } from '@/lib/content'
import PageRenderer from '@/components/PageRenderer'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'

export default async function ProductPage({
    params,
}: {
    params: Promise<{ slug: string }>
}) {
    const slug = (await params).slug
    const products = await getContent('products')
    // Match by slug or id? ContentEditor uses ID, but URL uses slug.
    // Ideally we should have a slug field. For now, assuming slug is part of the item or derived.
    // Wait, the dummy pages just used slug.
    // We need to find the item. The item has an ID.
    // In products.json, do we have slugs?
    // Let's assume we match by some property or just finding one for now.
    // Actually, in the Editor we edit items by ID.
    // But the URL is /products/[slug].
    // We need a way to map slug to ID or store slug in JSON.
    // For this prototype, I will try to find an item with a matching 'name' or 'slug' property,
    // Or if not found, just show generic.

    // Quick fix: Add 'slug' to content item type/editor, or just use name.
    // Let's find by name approximately or exact match if slug property exists.
    // Match by slug (if exists) or derived slug from title
    // ID-based matching is not supported via /products/[slug], only /products/[id] effectively if slug == id.
    const product = products.find((p: any) =>
        p.slug === slug ||
        p.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug ||
        p.id === slug
    )

    if (product?.blocks && product.blocks.length > 0) {
        return <PageRenderer blocks={product.blocks} />
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-white text-black p-8">
            <h1 className="text-5xl font-bold mb-4 capitalize">{slug}</h1>
            <p className="text-xl text-gray-600 max-w-2xl text-center">
                This is a placeholder page for the {slug} product.
                Here you would detail the specs, features, and use cases.
            </p>
            <a href="/" className="mt-8 hover:underline">← Back to Home</a>
        </div>
    )
}
