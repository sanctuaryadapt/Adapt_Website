import path from 'path'
import { promises as fs } from 'fs'

export async function getContent(type: 'products' | 'research' | 'blogs') {
    // Determine the path to the content directory
    const contentDir = path.join(process.cwd(), 'content')
    const filePath = path.join(contentDir, `${type}.json`)

    try {
        const fileContents = await fs.readFile(filePath, 'utf8')
        return JSON.parse(fileContents)
    } catch (error) {
        console.error(`Error reading ${type} content:`, error)
        return []
    }
}



