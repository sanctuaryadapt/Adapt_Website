
export async function saveContent(type: 'products' | 'research' | 'blogs', data: any[]) {
    // Strictly disable in production
    if (process.env.NODE_ENV !== 'development') {
        console.warn('saveContent is disabled in production')
        return false
    }

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
