import { MetadataRoute } from 'next'
import { SITE_URL } from '@/lib/seo'

/**
 * Robots.txt configuration for Adapt Robotics
 * Controls how search engines crawl the site
 */
export default function robots(): MetadataRoute.Robots {
    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: ['/admin/', '/api/'],
            },
        ],
        sitemap: `${SITE_URL}/sitemap.xml`,
    }
}
