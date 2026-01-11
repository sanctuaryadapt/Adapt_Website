import { NextRequest, NextResponse } from 'next/server'
import { writeFile, mkdir } from 'fs/promises'
import path from 'path'

export async function POST(req: NextRequest) {
    if (process.env.NODE_ENV !== 'development') {
        return new NextResponse('Forbidden', { status: 403 })
    }

    const formData = await req.formData()
    const file = formData.get('file') as File | null
    const folder = formData.get('folder') as string || ''

    if (!file) {
        return NextResponse.json({ error: 'No file received.' }, { status: 400 })
    }

    const buffer = Buffer.from(await file.arrayBuffer())

    // Ensure filename is safe
    const filename = file.name.replace(/[^a-zA-Z0-9.-]/g, '_')
    const uploadDir = path.join(process.cwd(), 'public/assets', folder)

    // Create dir if not exists
    await mkdir(uploadDir, { recursive: true })

    const filePath = path.join(uploadDir, filename)
    await writeFile(filePath, buffer)

    return NextResponse.json({
        success: true,
        path: folder ? `/assets/${folder}/${filename}` : `/assets/${filename}`
    })
}
