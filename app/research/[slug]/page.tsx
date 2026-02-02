import { Metadata } from 'next'
import ContentPage, { generateStaticParamsFor } from '@/components/ContentPage'
import { getContent } from '@/lib/content'
import {
    SITE_URL,
    SITE_NAME,
    truncateText
} from '@/lib/seo'

export async function generateStaticParams() {
    return generateStaticParamsFor('research')
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const slug = (await params).slug
    const research = await getContent('research')
    const item = (research as any[]).find((r: any) =>
        r.slug === slug ||
        r.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug ||
        r.id === slug
    )

    if (!item) {
        return {
            title: 'Research Project Not Found',
            description: 'The requested research project could not be found.',
        }
    }

    const title = item.title
    const description = truncateText(item.description || item.title, 160)
    const image = item.image?.startsWith('http') ? item.image : `${SITE_URL}${item.image}`
    const url = `${SITE_URL}/research/${item.id}`

    return {
        title,
        description,
        alternates: {
            canonical: `/research/${item.id}`,
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
    }
}

export default function ResearchPage({ params }: { params: Promise<{ slug: string }> }) {
    return <ContentPage params={params} type="research" singularTitle="research project" />
}
