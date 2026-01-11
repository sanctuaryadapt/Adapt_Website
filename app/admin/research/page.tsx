'use client'

import ContentEditor from '@/components/admin/ContentEditor'

export default function AdminResearch() {
    return (
        <ContentEditor
            type="research"
            fields={[
                { name: 'title', label: 'Project Name', type: 'text' },
                { name: 'slug', label: 'URL Slug', type: 'text' },
                { name: 'image', label: 'Cover Image', type: 'image' },
                { name: 'description', label: 'Description', type: 'textarea' },
            ]}
        />
    )
}
