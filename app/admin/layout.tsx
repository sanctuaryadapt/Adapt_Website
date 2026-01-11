import Link from 'next/link'
import { notFound } from 'next/navigation'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    // Security Check: Only allow in Dev mode
    if (process.env.NODE_ENV !== 'development') {
        notFound()
    }

    return (
        <div className="flex min-h-screen bg-gray-50 text-black font-sans">
            <aside className="w-64 bg-white border-r border-gray-200">
                <div className="p-6 border-b border-gray-100">
                    <div className="flex items-center gap-2 mb-2">
                        <img src="/assets/pics/AdaptLogo.jpg" alt="Logo" className="h-8 w-auto rounded-full" />
                        <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Adapt Studio</h1>
                    </div>
                    <span className="text-xs font-mono text-gray-400 block">Local CMS Environment</span>
                </div>
                <nav className="p-4 space-y-1">
                    <Link href="/admin" className="block px-4 py-2 rounded-md hover:bg-gray-100 font-medium">Dashboard</Link>
                    <div className="pt-4 pb-2 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Content Types</div>
                    <Link href="/admin/products" className="block px-4 py-2 rounded-md hover:bg-gray-100">Products</Link>
                    <Link href="/admin/research" className="block px-4 py-2 rounded-md hover:bg-gray-100">Research</Link>
                    <Link href="/admin/blogs" className="block px-4 py-2 rounded-md hover:bg-gray-100">Blogs</Link>

                    <div className="pt-8 pb-2 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider">Actions</div>
                    <a href="/" target="_blank" className="block px-4 py-2 rounded-md hover:bg-blue-50 text-blue-600 flex items-center gap-2">
                        <span>View Live Site</span>
                    </a>
                </nav>
            </aside>
            <main className="flex-1 p-8 overflow-y-auto">
                {children}
            </main>
        </div>
    )
}
