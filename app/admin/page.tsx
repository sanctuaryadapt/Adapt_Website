import Link from 'next/link'

export default function AdminDashboard() {
    return (
        <div className="max-w-4xl">
            <h1 className="text-3xl font-bold mb-2">Welcome to Adapt Studio</h1>
            <p className="text-gray-500 mb-8">Manage your website content locally. Changes are saved to JSON files.</p>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {/* Products Card */}
                <Link href="/admin/products" className="block p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
                    <div className="h-12 w-12 bg-blue-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-blue-600 transition-colors">
                        <span className="text-2xl">📦</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2">Products</h3>
                    <p className="text-sm text-gray-500">Manage tBot, GoldBucket, and other product pages.</p>
                </Link>

                {/* Research Card */}
                <Link href="/admin/research" className="block p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
                    <div className="h-12 w-12 bg-purple-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-purple-600 transition-colors">
                        <span className="text-2xl">🔬</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2">Research</h3>
                    <p className="text-sm text-gray-500">Update research projects like Khuld and Darwin.</p>
                </Link>

                {/* Blogs Card */}
                <Link href="/admin/blogs" className="block p-6 bg-white rounded-xl shadow-sm border border-gray-100 hover:shadow-md transition-shadow group">
                    <div className="h-12 w-12 bg-green-100 rounded-full flex items-center justify-center mb-4 group-hover:bg-green-600 transition-colors">
                        <span className="text-2xl">✍️</span>
                    </div>
                    <h3 className="text-xl font-bold mb-2">Blogs</h3>
                    <p className="text-sm text-gray-500">Write and publish new articles.</p>
                </Link>
            </div>

            <div className="mt-12 bg-blue-50 border border-blue-100 rounded-lg p-6">
                <h2 className="text-lg font-bold text-blue-900 mb-2">How to Publish</h2>
                <ol className="list-decimal list-inside space-y-2 text-blue-800 text-sm">
                    <li>Make your changes here (they save automatically to your local files).</li>
                    <li>Check the <a href="/" target="_blank" className="underline font-bold">Local Site</a> to verify everything looks good.</li>
                    <li>Open your terminal and run <code>git add . && git commit -m "Update content" && git push</code>.</li>
                    <li>Your live site will update automatically!</li>
                </ol>
            </div>
        </div>
    )
}
