'use client'

import { useState, useEffect } from 'react'
import { X, Upload, Image as ImageIcon, File, Folder } from 'lucide-react'
import { motion, AnimatePresence } from 'framer-motion'

interface MediaManagerProps {
    isOpen: boolean
    onClose: () => void
    onSelect: (url: string) => void
}

interface Asset {
    name: string
    type: 'file' | 'folder'
    path: string
}

export default function MediaManager({ isOpen, onClose, onSelect }: MediaManagerProps) {
    const [assets, setAssets] = useState<Asset[]>([])
    const [loading, setLoading] = useState(true)
    const [uploading, setUploading] = useState(false)

    useEffect(() => {
        if (isOpen) {
            fetchAssets()
        }
    }, [isOpen])

    const fetchAssets = async () => {
        setLoading(true)
        try {
            const res = await fetch('/api/admin/assets')
            const data = await res.json()
            setAssets(data)
        } catch (e) {
            console.error('Failed to load assets', e)
        } finally {
            setLoading(false)
        }
    }

    const handleUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        setUploading(true)
        const formData = new FormData()
        formData.append('file', file)

        try {
            const res = await fetch('/api/admin/upload', {
                method: 'POST',
                body: formData
            })
            if (res.ok) {
                await fetchAssets() // Refresh list
            }
        } catch (e) {
            console.error('Upload failed', e)
            alert('Upload failed')
        } finally {
            setUploading(false)
        }
    }

    return (
        <AnimatePresence>
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 backdrop-blur-sm p-4">
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95 }}
                        className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[80vh] flex flex-col overflow-hidden border border-gray-100"
                    >
                        {/* Header */}
                        <div className="flex justify-between items-center p-6 border-b border-gray-100 bg-gray-50/50">
                            <h2 className="text-xl font-bold text-gray-900">Media Library</h2>
                            <button onClick={onClose} className="text-gray-400 hover:text-gray-900 transition-colors p-2 hover:bg-gray-100 rounded-lg">
                                <X size={20} />
                            </button>
                        </div>

                        {/* Toolbar */}
                        <div className="p-4 border-b border-gray-100 flex justify-between items-center bg-white sticky top-0 z-10">
                            <div className="text-sm text-gray-500 font-medium">
                                {assets.length} items
                            </div>
                            <div>
                                <input
                                    type="file"
                                    id="file-upload"
                                    className="hidden"
                                    onChange={handleUpload}
                                    accept="image/*,video/*"
                                />
                                <label
                                    htmlFor="file-upload"
                                    className={`
                                        flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold cursor-pointer transition-all
                                        ${uploading
                                            ? 'bg-gray-100 text-gray-400 cursor-wait'
                                            : 'bg-brand text-white hover:bg-brand/90 hover:shadow-md'
                                        }
                                    `}
                                >
                                    <Upload size={16} />
                                    {uploading ? 'Uploading...' : 'Upload New'}
                                </label>
                            </div>
                        </div>

                        {/* Grid */}
                        <div className="flex-1 overflow-y-auto p-6 bg-gray-50">
                            {loading ? (
                                <div className="flex items-center justify-center h-40">
                                    <div className="w-6 h-6 border-2 border-brand border-t-transparent rounded-full animate-spin"></div>
                                </div>
                            ) : assets.length === 0 ? (
                                <div className="flex flex-col items-center justify-center h-40 text-gray-400">
                                    <ImageIcon size={48} className="mb-2 opacity-20" />
                                    <p className="text-sm font-medium">No assets found</p>
                                </div>
                            ) : (
                                <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 gap-4">
                                    {assets.map((asset, i) => (
                                        <div
                                            key={i}
                                            onClick={() => onSelect(asset.path)}
                                            className="group relative aspect-square bg-white rounded-xl border border-gray-200 hover:border-brand/40 hover:shadow-lg hover:shadow-brand/5 transition-all cursor-pointer overflow-hidden"
                                        >
                                            <div className="absolute inset-0 p-3 flex flex-col items-center justify-center">
                                                {asset.name.match(/\.(jpg|jpeg|png|gif|webp)$/i) ? (
                                                    <img
                                                        src={asset.path}
                                                        alt={asset.name}
                                                        className="w-full h-full object-contain pointer-events-none group-hover:scale-105 transition-transform duration-300"
                                                    />
                                                ) : (
                                                    <File className="text-gray-300 group-hover:text-brand/50 transition-colors" size={32} />
                                                )}
                                            </div>
                                            <div className="absolute inset-x-0 bottom-0 bg-white/90 backdrop-blur-sm p-2 text-center border-t border-gray-100 translate-y-full group-hover:translate-y-0 transition-transform duration-200">
                                                <p className="text-[10px] font-medium text-gray-600 truncate px-2">{asset.name}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </motion.div>
                </div>
            )}
        </AnimatePresence>
    )
}
