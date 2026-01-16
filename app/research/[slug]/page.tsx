import ContentPage, { generateStaticParamsFor } from '@/components/ContentPage'







export async function generateStaticParams() {
    return generateStaticParamsFor('research')
}

export default function ResearchPage({ params }: { params: Promise<{ slug: string }> }) {
    return <ContentPage params={params} type="research" singularTitle="research project" />
}
