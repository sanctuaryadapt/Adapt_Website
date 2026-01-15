'use client'

import { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { PanelLeftClose, PanelLeftOpen, Menu } from 'lucide-react'

export default function AdminLayoutClient({ children }: { children: React.ReactNode }) {
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const pathname = usePathname()
    const isBuilderPage = pathname?.includes('/design/')

    return (
        <div className="flex min-h-screen bg-gray-50 text-black font-sans relative">
            {/* Sidebar Toggle (Floating if closed, or separate trigger) */}
            {!isSidebarOpen && (
                <button
                    onClick={() => setIsSidebarOpen(true)}
                    className="fixed top-4 left-4 z-50 p-2 bg-white shadow-md border border-gray-200 rounded-lg hover:bg-gray-50 transition-all text-gray-600"
                    title="Open Sidebar"
                >
                    <Menu size={20} />
                </button>
            )}

            <aside
                className={`bg-white border-r border-gray-200 transition-all duration-300 ease-in-out overflow-hidden flex flex-col ${isSidebarOpen ? 'w-64 opacity-100' : 'w-0 opacity-0 border-none'}`}
            >
                <div className="p-6 border-b border-gray-100 flex justify-between items-start">
                    <div>
                        <div className="flex items-center gap-2 mb-2">
                            <img src="/assets/pics/AdaptLogo.jpg" alt="Logo" className="h-8 w-auto rounded-full" />
                            <h1 className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent truncate">Adapt Studio</h1>
                        </div>
                        <span className="text-xs font-mono text-gray-400 block whitespace-nowrap">Local CMS Environment</span>
                    </div>
                    <button
                        onClick={() => setIsSidebarOpen(false)}
                        className="text-gray-400 hover:text-gray-600 p-1 hover:bg-gray-100 rounded"
                        title="Collapse Sidebar"
                    >
                        <PanelLeftClose size={18} />
                    </button>
                </div>

                <nav className="p-4 space-y-1 flex-1 overflow-y-auto">
                    <Link href="/admin" className="block px-4 py-2 rounded-md hover:bg-gray-100 font-medium whitespace-nowrap">Dashboard</Link>
                    <div className="pt-4 pb-2 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">Content Types</div>
                    <Link href="/admin/products" className="block px-4 py-2 rounded-md hover:bg-gray-100 whitespace-nowrap">Products</Link>
                    <Link href="/admin/research" className="block px-4 py-2 rounded-md hover:bg-gray-100 whitespace-nowrap">Research</Link>
                    <Link href="/admin/blogs" className="block px-4 py-2 rounded-md hover:bg-gray-100 whitespace-nowrap">Blogs</Link>

                    <div className="pt-8 pb-2 px-4 text-xs font-bold text-gray-400 uppercase tracking-wider whitespace-nowrap">Actions</div>
                    <a href="/" target="_blank" className="block px-4 py-2 rounded-md hover:bg-blue-50 text-blue-600 flex items-center gap-2 whitespace-nowrap">
                        <span>View Live Site</span>
                    </a>
                </nav>
            </aside>

            <main className={`flex-1 flex flex-col h-screen ${isBuilderPage ? 'overflow-hidden' : 'overflow-y-auto'}`}>
                {children}
            </main>
        </div>
    )
}
