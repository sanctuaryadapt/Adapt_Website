'use client'

import ContentEditor from '@/components/admin/ContentEditor'

export default function AdminProducts() {
    return (
        <ContentEditor
            type="products"
            fields={[
                { name: 'title', label: 'Product Name', type: 'text' },
                { name: 'tagline', label: 'Tagline', type: 'text' },
                { name: 'slug', label: 'URL Slug', type: 'text' },
                { name: 'image', label: 'Card Image', type: 'image' },
                { name: 'description', label: 'Full Description', type: 'textarea' },
            ]}
        />
    )
}
