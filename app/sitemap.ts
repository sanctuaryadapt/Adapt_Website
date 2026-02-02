import { MetadataRoute } from 'next'
import { getContent } from '@/lib/content'
import { SITE_URL } from '@/lib/seo'

/**
 * Dynamic sitemap generator for Adapt Robotics
 * Includes all static and dynamic pages for search engine discovery
 */
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    // Fetch all content
    const [products, blogs, research] = await Promise.all([
        getContent('products'),
        getContent('blogs'),
        getContent('research'),
    ])

    const now = new Date()

    // Static pages
    const staticPages: MetadataRoute.Sitemap = [
        {
            url: SITE_URL,
            lastModified: now,
            changeFrequency: 'weekly',
            priority: 1.0,
        },
    ]

    // Product pages
    const productPages: MetadataRoute.Sitemap = (products as any[]).map((product) => ({
        url: `${SITE_URL}/products/${product.slug || product.id}`,
        lastModified: now,
        changeFrequency: 'monthly' as const,
        priority: 0.8,
    }))

    // Blog pages
    const blogPages: MetadataRoute.Sitemap = (blogs as any[]).map((blog) => ({
        url: `${SITE_URL}/blogs/${blog.slug || blog.id}`,
        lastModified: now,
        changeFrequency: 'monthly' as const,
        priority: 0.7,
    }))

    // Research pages
    const researchPages: MetadataRoute.Sitemap = (research as any[]).map((item) => ({
        url: `${SITE_URL}/research/${item.slug || item.id}`,
        lastModified: now,
        changeFrequency: 'monthly' as const,
        priority: 0.6,
    }))

    return [...staticPages, ...productPages, ...blogPages, ...researchPages]
}
