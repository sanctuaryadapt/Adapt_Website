
export async function getContent(type: 'products' | 'research' | 'blogs') {
    try {
        const path = (await import('path')).default;
        const fs = (await import('fs/promises'));

        const contentDir = path.join(process.cwd(), 'content');
        const filePath = path.join(contentDir, `${type}.json`);

        const fileContent = await fs.readFile(filePath, 'utf-8');
        return JSON.parse(fileContent);
    } catch (error) {
        console.error(`Error reading ${type} content:`, error);
        return [];
    }
}

export async function saveContent(type: 'products' | 'research' | 'blogs', data: any[]) {
    try {
        const path = (await import('path')).default;
        const fs = (await import('fs/promises'));

        const contentDir = path.join(process.cwd(), 'content');
        const filePath = path.join(contentDir, `${type}.json`);

        await fs.writeFile(filePath, JSON.stringify(data, null, 2), 'utf-8');
        return true;
    } catch (error) {
        console.error(`Error saving ${type} content:`, error);
        return false;
    }
}

