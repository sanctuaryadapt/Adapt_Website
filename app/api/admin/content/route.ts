import { NextRequest, NextResponse } from 'next/server'

import { getContent } from '@/lib/content'
import { saveContent } from '@/lib/content-admin'







export async function GET(req: NextRequest) {


    if (process.env.NODE_ENV !== 'development') {
        return new NextResponse('Not Found', { status: 404 })
    }
    // if (process.env.NODE_ENV !== 'development') {
    //     return new NextResponse('Forbidden', { status: 403 })
    // }
    const { searchParams } = new URL(req.url)
    const type = searchParams.get('type') as 'products' | 'research' | 'blogs'

    if (!['products', 'research', 'blogs'].includes(type)) {
        return new NextResponse('Invalid type', { status: 400 })
    }

    const data = await getContent(type)
    return NextResponse.json(data)
}


// POST /api/admin/content
// Body: { type: 'products', data: [...] }
export async function POST(req: NextRequest) {
    if (process.env.NODE_ENV !== 'development') {
        return new NextResponse('Not Found', { status: 404 })
    }

    // if (process.env.NODE_ENV !== 'development') {
    //     return new NextResponse('Forbidden', { status: 403 })
    // }
    const body = await req.json()
    const { type, data } = body

    if (!['products', 'research', 'blogs'].includes(type)) {
        return new NextResponse('Invalid type', { status: 400 })
    }

    const success = await saveContent(type, data)
    if (success) {
        return NextResponse.json({ success: true })
    } else {
        return new NextResponse('Error saving content', { status: 500 })
    }
}
