import { NextResponse } from 'next/server'
import { readdir } from 'fs/promises'
import path from 'path'

export async function GET() {
    try {
        const uploadDir = path.join(process.cwd(), 'public/assets')
        // Read root assets, we could make this recursive later or accept a query param for folders
        const files = await readdir(uploadDir, { withFileTypes: true })

        // Filter for files and directories (maybe exclude system files)
        const assets = files
            .filter(f => !f.name.startsWith('.')) // hide hidden files
            .map(f => ({
                name: f.name,
                type: f.isDirectory() ? 'folder' : 'file',
                path: `/assets/${f.name}`
            }))

        return NextResponse.json(assets)
    } catch (error) {
        console.error('Failed to list assets', error)
        return NextResponse.json({ error: 'Failed to list assets' }, { status: 500 })
    }
}
