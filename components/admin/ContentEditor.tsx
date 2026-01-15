'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { Plus, Trash2, Save, GripVertical, Image as ImageIcon, Palette, Copy, Clipboard, CheckSquare, Square, AlignLeft, AlignCenter, AlignRight, AlignJustify, Check } from 'lucide-react'

type ContentItem = {
    id: string
    [key: string]: any
}

type FieldConfig = {
    name: string
    label: string
    type: 'text' | 'textarea' | 'image'
}

export default function ContentEditor({
    type,
    fields
}: {
    type: 'products' | 'research' | 'blogs',
    fields: FieldConfig[]
}) {
    const [items, setItems] = useState<ContentItem[]>([])
    const [loading, setLoading] = useState(true)
    const [saving, setSaving] = useState(false)
    const [deleteConfirmationIndex, setDeleteConfirmationIndex] = useState<number | null>(null)

    // Selection & Clipboard
    const [selectedItems, setSelectedItems] = useState<Set<string>>(new Set())
    const [clipboard, setClipboard] = useState<ContentItem[]>([])

    useEffect(() => {
        fetch(`/api/admin/content?type=${type}`)
            .then(res => res.json())
            .then(data => {
                setItems(data)
                setLoading(false)
            })
    }, [type])

    const handleSave = async () => {
        setSaving(true)
        await fetch('/api/admin/content', {
            method: 'POST',
            body: JSON.stringify({ type, data: items })
        })
        setSaving(false)
        alert('Saved successfully!')
    }

    // --- Selection Logic ---
    const toggleSelection = (id: string) => {
        const newSelection = new Set(selectedItems)
        if (newSelection.has(id)) {
            newSelection.delete(id)
        } else {
            newSelection.add(id)
        }
        setSelectedItems(newSelection)
    }

    const selectAll = () => {
        if (selectedItems.size === items.length) {
            setSelectedItems(new Set())
        } else {
            setSelectedItems(new Set(items.map(i => i.id)))
        }
    }

    // --- Copy / Paste Logic ---
    const handleCopy = () => {
        const itemsToCopy = items.filter(item => selectedItems.has(item.id))
        if (itemsToCopy.length === 0) return alert("Select items to copy first")
        setClipboard(itemsToCopy)
        alert(`Copied ${itemsToCopy.length} items to clipboard`)
    }

    const handlePaste = () => {
        if (clipboard.length === 0) return

        const newItems = clipboard.map(item => ({
            ...item,
            id: Date.now().toString() + Math.random().toString(36).substr(2, 9) // Unique ID
        }))

        setItems([...items, ...newItems])
        alert(`Pasted ${newItems.length} items`)
    }

    const handleAddItem = () => {
        const newItem: ContentItem = { id: Date.now().toString() }
        fields.forEach(f => newItem[f.name] = '')
        setItems([...items, newItem])
    }

    const initiateDelete = (index: number) => {
        setDeleteConfirmationIndex(index)
    }

    const confirmDelete = async () => {
        if (deleteConfirmationIndex === null) return

        const index = deleteConfirmationIndex
        // Optimistic UI update
        const newItems = items.filter((_, i) => i !== index)
        setItems(newItems)
        setDeleteConfirmationIndex(null) // Close modal

        setSaving(true)
        try {
            // Save the new array to the server
            const res = await fetch('/api/admin/content', {
                method: 'POST',
                body: JSON.stringify({ type, data: newItems })
            });
            if (!res.ok) throw new Error('Failed to save');
            // Success
        } catch (error) {
            console.error("Delete failed", error);
            alert("Failed to delete item. Check console.");
            setItems([...items]); // Revert (naive)
        } finally {
            setSaving(false)
        }
    }

    const handleChange = (index: number, field: string, value: any) => {
        const newItems = [...items]
        newItems[index] = { ...newItems[index], [field]: value }
        setItems(newItems)
    }

    // File Upload Handler
    const handleUpload = async (index: number, field: string, file: File) => {
        const formData = new FormData()
        formData.append('file', file)
        formData.append('folder', type)

        const res = await fetch('/api/admin/upload', {
            method: 'POST',
            body: formData
        })

        if (res.ok) {
            const data = await res.json()
            handleChange(index, field, data.path)
        }
    }

    if (loading) return <div>Loading...</div>

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div className="flex items-center gap-4">
                    <h1 className="text-3xl font-bold capitalize">{type} Manager</h1>
                    <div className="flex items-center gap-2 bg-white rounded-lg border border-gray-200 p-1">
                        <button
                            onClick={selectAll}
                            className="p-2 text-gray-500 hover:text-brand transition-colors"
                            title={selectedItems.size === items.length ? "Deselect All" : "Select All"}
                        >
                            {selectedItems.size > 0 && selectedItems.size === items.length ? (
                                <CheckSquare className="h-4 w-4" />
                            ) : (
                                <Square className="h-4 w-4" />
                            )}
                        </button>
                        <div className="w-px h-4 bg-gray-200"></div>
                        <button
                            onClick={handleCopy}
                            disabled={selectedItems.size === 0}
                            className="p-2 text-gray-500 hover:text-brand disabled:opacity-30 transition-colors"
                            title="Copy Selected"
                        >
                            <Copy className="h-4 w-4" />
                        </button>
                        <button
                            onClick={handlePaste}
                            disabled={clipboard.length === 0}
                            className="p-2 text-gray-500 hover:text-brand disabled:opacity-30 transition-colors"
                            title="Paste"
                        >
                            <Clipboard className="h-4 w-4" />
                        </button>
                    </div>
                </div>

                <button
                    onClick={handleSave}
                    disabled={saving}
                    className="flex items-center gap-2 bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800 disabled:opacity-50"
                >
                    <Save className="h-4 w-4" />
                    {saving ? 'Saving...' : 'Save Changes'}
                </button>
            </div>

            <div className="space-y-6">
                {items.map((item, index) => (
                    <div
                        key={item.id}
                        className={`p-6 rounded-lg border shadow-sm relative group transition-all ${selectedItems.has(item.id)
                                ? 'bg-blue-50/50 border-blue-200 ring-1 ring-blue-200'
                                : 'bg-white border-gray-200'
                            }`}
                    >
                        <div className="absolute top-4 right-4 flex gap-2">
                            <button
                                onClick={() => toggleSelection(item.id)}
                                className={`p-2 transition-colors ${selectedItems.has(item.id) ? 'text-brand' : 'text-gray-300 hover:text-brand'}`}
                                title="Select"
                            >
                                {selectedItems.has(item.id) ? <CheckSquare className="h-4 w-4" /> : <Square className="h-4 w-4" />}
                            </button>
                            <Link
                                href={`/admin/design/${type}/${item.id}`}
                                className="text-gray-400 hover:text-brand p-2 transition-colors"
                                title="Design Page"
                            >
                                <Palette className="h-4 w-4" />
                            </Link>
                            <button
                                onClick={() => initiateDelete(index)}
                                className="text-red-300 hover:text-red-600 p-2 transition-colors"
                                title="Delete Item"
                            >
                                <Trash2 className="h-4 w-4" />
                            </button>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            {fields.map(field => (
                                <div key={field.name} className={field.type === 'textarea' ? 'md:col-span-2' : ''}>
                                    <label className="block text-xs font-bold uppercase text-gray-400 mb-1">
                                        {field.label}
                                    </label>

                                    {field.type === 'image' ? (
                                        <div className="flex items-start gap-4">
                                            {item[field.name] ? (
                                                <div className="w-24 h-24 bg-gray-100 rounded-md overflow-hidden relative border">
                                                    <img
                                                        src={item[field.name]}
                                                        alt="Preview"
                                                        className="w-full h-full pointer-events-none"
                                                        style={{
                                                            objectFit: item[`${field.name}Fit`] || 'cover',
                                                            objectPosition: item[`${field.name}Position`] || 'center'
                                                        }}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="w-24 h-24 bg-gray-50 border border-dashed rounded-md flex items-center justify-center text-gray-300">
                                                    <ImageIcon className="h-6 w-6" />
                                                </div>
                                            )}
                                            <div className="flex-1 space-y-3">
                                                <div>
                                                    <input
                                                        type="text"
                                                        value={item[field.name] || ''}
                                                        onChange={e => handleChange(index, field.name, e.target.value)}
                                                        className="w-full text-sm border border-gray-200 rounded p-2 mb-2 bg-gray-50"
                                                        placeholder="/assets/..."
                                                    />
                                                    <input
                                                        type="file"
                                                        onChange={e => e.target.files?.[0] && handleUpload(index, field.name, e.target.files[0])}
                                                        className="block w-full text-sm text-slate-500
                                                          file:mr-4 file:py-2 file:px-4
                                                          file:rounded-full file:border-0
                                                          file:text-xs file:font-semibold
                                                          file:bg-blue-50 file:text-blue-700
                                                          hover:file:bg-blue-100
                                                        "
                                                    />
                                                </div>

                                                {/* Image Controls */}
                                                <div className="grid grid-cols-2 gap-3 bg-gray-50 p-3 rounded-lg border border-gray-100">
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Fit</label>
                                                        <select
                                                            value={item[`${field.name}Fit`] || 'cover'}
                                                            onChange={e => handleChange(index, `${field.name}Fit`, e.target.value)}
                                                            className="w-full text-xs border border-gray-200 rounded p-1.5 bg-white focus:ring-1 focus:ring-brand/20 outline-none"
                                                        >
                                                            <option value="cover">Cover</option>
                                                            <option value="contain">Contain</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Focus</label>
                                                        <select
                                                            value={item[`${field.name}Position`] || 'center'}
                                                            onChange={e => handleChange(index, `${field.name}Position`, e.target.value)}
                                                            className="w-full text-xs border border-gray-200 rounded p-1.5 bg-white focus:ring-1 focus:ring-brand/20 outline-none"
                                                        >
                                                            <option value="center">Center</option>
                                                            <option value="top">Top</option>
                                                            <option value="bottom">Bottom</option>
                                                            <option value="left">Left</option>
                                                            <option value="right">Right</option>
                                                            <option value="top left">Top Left</option>
                                                            <option value="top right">Top Right</option>
                                                            <option value="bottom left">Bottom Left</option>
                                                            <option value="bottom right">Bottom Right</option>
                                                        </select>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    ) : field.type === 'textarea' ? (
                                        <div className="space-y-2">
                                            <div className="flex justify-end gap-1">
                                                {[
                                                    { align: 'left', Icon: AlignLeft },
                                                    { align: 'center', Icon: AlignCenter },
                                                    { align: 'right', Icon: AlignRight },
                                                    { align: 'justify', Icon: AlignJustify }
                                                ].map(({ align, Icon }) => (
                                                    <button
                                                        key={align}
                                                        onClick={() => handleChange(index, `${field.name}Align`, align)}
                                                        className={`p-1 rounded ${item[`${field.name}Align`] === align ? 'bg-gray-200 text-black' : 'text-gray-400 hover:bg-gray-100'}`}
                                                        title={`Align ${align}`}
                                                    >
                                                        <Icon className="h-3 w-3" />
                                                    </button>
                                                ))}
                                            </div>
                                            <textarea
                                                value={item[field.name] || ''}
                                                onChange={e => handleChange(index, field.name, e.target.value)}
                                                className="w-full border border-gray-200 rounded p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none min-h-[100px]"
                                                rows={4}
                                                style={{ textAlign: item[`${field.name}Align`] || 'left' }}
                                            />
                                        </div>
                                    ) : (
                                        <input
                                            type="text"
                                            value={item[field.name] || ''}
                                            onChange={e => handleChange(index, field.name, e.target.value)}
                                            className="w-full border border-gray-200 rounded p-2 focus:ring-2 focus:ring-blue-500 focus:outline-none font-medium"
                                        />
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                ))}

                <button
                    onClick={handleAddItem}
                    className="w-full py-4 border-2 border-dashed border-gray-300 rounded-lg text-gray-400 hover:border-brand/40 hover:text-brand flex items-center justify-center gap-2 transition-colors"
                >
                    <Plus className="h-5 w-5" />
                    Add New Item
                </button>
            </div>

            {/* Delete Confirmation Modal */}
            {deleteConfirmationIndex !== null && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
                    <div className="bg-white p-6 rounded-xl shadow-2xl max-w-sm w-full mx-4 border border-gray-100">
                        <h3 className="text-xl font-bold text-brand mb-2">Delete Item?</h3>
                        <p className="text-gray-500 mb-6 text-sm">
                            This action cannot be undone. This item will be permanently removed from the website.
                        </p>
                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setDeleteConfirmationIndex(null)}
                                className="px-4 py-2 text-gray-600 hover:bg-gray-100 rounded-lg font-medium text-sm transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDelete}
                                className="px-4 py-2 bg-red-500 hover:bg-red-600 text-white rounded-lg font-medium text-sm transition-colors shadow-lg shadow-red-500/20"
                            >
                                Yes, Delete It
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}
