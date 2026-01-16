export async function getContent(type: 'products' | 'research' | 'blogs') {
    // Only run on server (Node.js environment)
    if (typeof window !== 'undefined') return []

    try {
        const path = (await import('path')).default
        const fs = (await import('fs/promises'))

        // Determine the path to the content directory
        const contentDir = path.join(process.cwd(), 'content')
        const filePath = path.join(contentDir, `${type}.json`)

        const fileContents = await fs.readFile(filePath, 'utf8')
        return JSON.parse(fileContents)
    } catch (error) {
        console.error(`Error reading ${type} content:`, error)
        return []
    }
}



