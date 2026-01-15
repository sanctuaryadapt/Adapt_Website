
import productsData from '@/content/products.json'
import researchData from '@/content/research.json'
import blogsData from '@/content/blogs.json'
import { NextResponse } from 'next/server'

export async function getContent(type: 'products' | 'research' | 'blogs') {
    switch (type) {
        case 'products':
            return productsData
        case 'research':
            return researchData
        case 'blogs':
            return blogsData
        default:
            return []
    }
}



