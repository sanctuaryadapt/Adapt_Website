/**
 * SEO Utility Library for Adapt Robotics
 * Provides helpers for generating structured data and metadata
 */

// Production URL - used for canonical URLs, sitemaps, and Open Graph
export const SITE_URL = 'https://adapt-robotics.pages.dev'

// Site metadata constants
export const SITE_NAME = 'Adapt Robotics'
export const SITE_DESCRIPTION = 'Adapt Robotics specializes in advanced autonomous service robots and AI-powered automation solutions. Our flagship product tBot provides intelligent guidance, multilingual support, and seamless navigation for enhanced visitor experiences.'
export const SITE_KEYWORDS = ['robotics', 'autonomous robots', 'service robots', 'tBot', 'AI automation', 'SLAM navigation', 'robot guidance', 'India robotics', 'Adapt Robotics']

// Default OG image - 1200x630 banner for optimal social sharing
export const DEFAULT_OG_IMAGE = `${SITE_URL}/assets/og-banner.png`

/**
 * Strips HTML tags from content for use in meta descriptions
 */
export function stripHtml(html: string): string {
    return html
        .replace(/<[^>]*>/g, '') // Remove HTML tags
        .replace(/&nbsp;/g, ' ') // Replace &nbsp; with space
        .replace(/&amp;/g, '&')  // Replace &amp; with &
        .replace(/&lt;/g, '<')   // Replace &lt; with <
        .replace(/&gt;/g, '>')   // Replace &gt; with >
        .replace(/\s+/g, ' ')    // Collapse multiple spaces
        .trim()
}

/**
 * Truncates text to a max length, adding ellipsis if needed
 * Tries to break at word boundaries
 */
export function truncateText(text: string, maxLength: number = 160): string {
    const cleaned = stripHtml(text)
    if (cleaned.length <= maxLength) return cleaned

    const truncated = cleaned.substring(0, maxLength - 3)
    const lastSpace = truncated.lastIndexOf(' ')

    return (lastSpace > maxLength * 0.5 ? truncated.substring(0, lastSpace) : truncated) + '...'
}

/**
 * Generates Organization structured data (JSON-LD)
 */
export function generateOrganizationSchema() {
    return {
        '@context': 'https://schema.org',
        '@type': 'Organization',
        name: SITE_NAME,
        description: SITE_DESCRIPTION,
        url: SITE_URL,
        logo: `${SITE_URL}/assets/pics/AdaptLogo.png`,
        sameAs: [
            // Add social media URLs when available
        ],
        contactPoint: {
            '@type': 'ContactPoint',
            contactType: 'customer service',
            email: 'contact@adaptrobotics.com' // Update with actual email
        }
    }
}

/**
 * Generates Product structured data (JSON-LD)
 */
export function generateProductSchema(product: {
    id: string
    title: string
    description: string
    image: string
    tagline?: string
}) {
    return {
        '@context': 'https://schema.org',
        '@type': 'Product',
        name: product.title,
        description: stripHtml(product.description),
        image: product.image.startsWith('http') ? product.image : `${SITE_URL}${product.image}`,
        brand: {
            '@type': 'Brand',
            name: SITE_NAME
        },
        manufacturer: {
            '@type': 'Organization',
            name: SITE_NAME,
            url: SITE_URL
        },
        url: `${SITE_URL}/products/${product.id}`
    }
}

/**
 * Generates Article/BlogPosting structured data (JSON-LD)
 */
export function generateArticleSchema(article: {
    id: string
    title: string
    excerpt: string
    image: string
    slug?: string
}) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BlogPosting',
        headline: article.title,
        description: stripHtml(article.excerpt),
        image: article.image.startsWith('http') ? article.image : `${SITE_URL}${article.image}`,
        author: {
            '@type': 'Organization',
            name: SITE_NAME,
            url: SITE_URL
        },
        publisher: {
            '@type': 'Organization',
            name: SITE_NAME,
            logo: {
                '@type': 'ImageObject',
                url: `${SITE_URL}/assets/pics/AdaptLogo.png`
            }
        },
        url: `${SITE_URL}/blogs/${article.slug || article.id}`,
        mainEntityOfPage: {
            '@type': 'WebPage',
            '@id': `${SITE_URL}/blogs/${article.slug || article.id}`
        }
    }
}

/**
 * Generates BreadcrumbList structured data (JSON-LD)
 */
export function generateBreadcrumbSchema(items: { name: string; url: string }[]) {
    return {
        '@context': 'https://schema.org',
        '@type': 'BreadcrumbList',
        itemListElement: items.map((item, index) => ({
            '@type': 'ListItem',
            position: index + 1,
            name: item.name,
            item: item.url.startsWith('http') ? item.url : `${SITE_URL}${item.url}`
        }))
    }
}
