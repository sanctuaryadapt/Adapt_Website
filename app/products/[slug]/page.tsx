import ContentPage, { generateStaticParamsFor } from '@/components/ContentPage'







export async function generateStaticParams() {
    return generateStaticParamsFor('products')
}

export default function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
    return <ContentPage params={params} type="products" singularTitle="product" />
}
