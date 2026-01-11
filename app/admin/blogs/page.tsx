'use client'

import ContentEditor from '@/components/admin/ContentEditor'

export default function AdminBlogs() {
    return (
        <ContentEditor
            type="blogs"
            fields={[
                { name: 'title', label: 'Blog Title', type: 'text' },
                { name: 'slug', label: 'URL Slug', type: 'text' },
                { name: 'image', label: 'Cover Image', type: 'image' },
                { name: 'excerpt', label: 'Short Excerpt', type: 'textarea' },
                // Note: For full blog content we'd want a richer editor, 
                // but this covers the "cards" on the homepage for now.
            ]}
        />
    )
}
