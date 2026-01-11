import fs from 'fs/promises'
import path from 'path'

const contentDir = path.join(process.cwd(), 'content')

export async function getContent(type: 'products' | 'research' | 'blogs') {
    const filePath = path.join(contentDir, `${type}.json`)
    try {
        const fileContent = await fs.readFile(filePath, 'utf-8')
        return JSON.parse(fileContent)
    } catch (error) {
        console.error(`Error reading ${type} content:`, error)
        return []
    }
}

export async function saveContent(type: 'products' | 'research' | 'blogs', data: any[]) {
    const filePath = path.join(contentDir, `${type}.json`)
    try {
        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8')
        return true
    } catch (error) {
        console.error(`Error saving ${type} content:`, error)
        return false
    }
}
