import ContentPage, { generateStaticParamsFor } from '@/components/ContentPage'

export const dynamic = 'force-static'

export async function generateStaticParams() {
    return generateStaticParamsFor('blogs')
}

export default function BlogPage({ params }: { params: Promise<{ slug: string }> }) {
    return <ContentPage params={params} type="blogs" singularTitle="blog post" />
}
