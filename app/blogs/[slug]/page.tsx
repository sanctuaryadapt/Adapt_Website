import { Metadata } from 'next'
import ContentPage, { generateStaticParamsFor } from '@/components/ContentPage'
import { getContent } from '@/lib/content'
import {
    SITE_URL,
    SITE_NAME,
    DEFAULT_OG_IMAGE,
    truncateText,
    generateArticleSchema
} from '@/lib/seo'

export async function generateStaticParams() {
    return generateStaticParamsFor('blogs')
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
    const slug = (await params).slug
    const blogs = await getContent('blogs')
    const blog = (blogs as any[]).find((b: any) =>
        b.slug === slug ||
        b.title?.toLowerCase().replace(/[^a-z0-9]+/g, '-') === slug ||
        b.id === slug
    )

    if (!blog) {
        return {
            title: 'Blog Post Not Found',
            description: 'The requested blog post could not be found.',
        }
    }

    const title = blog.title
    const description = truncateText(blog.excerpt || blog.title, 160)
    const image = blog.image?.startsWith('http') ? blog.image : `${SITE_URL}${blog.image}`
    const url = `${SITE_URL}/blogs/${blog.slug || blog.id}`

    return {
        title,
        description,
        alternates: {
            canonical: `/blogs/${blog.slug || blog.id}`,
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
            type: 'article',
        },
        twitter: {
            card: 'summary_large_image',
            title: `${title} | ${SITE_NAME}`,
            description,
            images: [image],
        },
        other: {
            'article:structured-data': JSON.stringify(generateArticleSchema(blog)),
        },
    }
}

export default function BlogPage({ params }: { params: Promise<{ slug: string }> }) {
    return <ContentPage params={params} type="blogs" singularTitle="blog post" />
}
