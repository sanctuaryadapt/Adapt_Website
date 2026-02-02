import { Metadata } from 'next'
import ContentPage, { generateStaticParamsFor } from '@/components/ContentPage'
import { getContent } from '@/lib/content'
import {
    SITE_URL,
    SITE_NAME,
    DEFAULT_OG_IMAGE,
    truncateText,
    generateProductSchema,
    generateBreadcrumbSchema
} from '@/lib/seo'

export async function generateStaticParams() {
    return generateStaticParamsFor('products')
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const slug = (await params).slug
    const products = await getContent('products')
    const product = (products as any[]).find((p: any) =>
        p.slug === slug ||
        p.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug ||
        p.id === slug
    )

    if (!product) {
        return {
            title: 'Product Not Found',
            description: 'The requested product could not be found.',
        }
    }

    const title = product.title
    const description = truncateText(product.tagline || product.description, 160)
    const image = product.image?.startsWith('http') ? product.image : `${SITE_URL}${product.image}`
    const url = `${SITE_URL}/products/${product.id}`

    return {
        title,
        description,
        alternates: {
            canonical: `/products/${product.id}`,
        },
        openGraph: {
            title: `${title} | ${SITE_NAME}`,
            description,
            url,
            siteName: SITE_NAME,
            images: [
                {
                    url: image,
                    width: 1200,
                    height: 630,
                    alt: title,
                },
            ],
            type: 'website',
        },
        twitter: {
            card: 'summary_large_image',
            title: `${title} | ${SITE_NAME}`,
            description,
            images: [image],
        },
        other: {
            'product:structured-data': JSON.stringify(generateProductSchema(product)),
        },
    }
}

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    return <ContentPage params={params} type="products" singularTitle="product" />
}
