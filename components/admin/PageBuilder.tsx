'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Save, Type, Image as ImageIcon, Video, ArrowLeft,
    Move, Grid, Layers, Settings, MousePointer2,
    Maximize, Minimize, Trash2, Copy, Eye, EyeOff, X,
    Bold, Italic, Underline,
    GripHorizontal
} from 'lucide-react'
import Link from 'next/link'
import MediaManager from './MediaManager'

type BlockType = 'text' | 'image' | 'video'

interface Block {
    id: string
    type: BlockType
    content: string
    style: {
        x: number
        y: number
        width: number
        height: number
        fontSize?: number
        color?: string
        zIndex: number
        backgroundColor?: string
        borderRadius?: number
        opacity?: number
        boxShadow?: string
        objectFit?: 'cover' | 'contain'
        objectPosition?: string
    }
}

export default function PageBuilder({ type, id }: { type: string; id: string }) {
    const [blocks, setBlocks] = useState<Block[]>([])
    const [selectedBlockId, setSelectedBlockId] = useState<string | null>(null)
    const [saving, setSaving] = useState(false)
    const [showGrid, setShowGrid] = useState(true)
    const containerRef = useRef<HTMLDivElement>(null)

    const [scale, setScale] = useState(1)
    const [canvasHeight, setCanvasHeight] = useState(1200)

    // Media Manager State
    const [isMediaManagerOpen, setIsMediaManagerOpen] = useState(false)
    const [mediaTargetBlockId, setMediaTargetBlockId] = useState<string | null>(null)

    // Load initial data
    useEffect(() => {
        const fetchContent = async () => {
            const res = await fetch(`/api/admin/content?type=${type}`)
            const data = await res.json()
            const item = data.find((i: any) => i.id === id)
            if (item && item.blocks) {
                setBlocks(item.blocks)
            }
        }
        fetchContent()
    }, [type, id])

    // Load initial max height from blocks if greater than default
    useEffect(() => {
        if (blocks.length > 0) {
            const maxY = Math.max(...blocks.map(b => b.style.y + (b.style.height || 100)))
            if (maxY > 1200) setCanvasHeight(maxY + 200)
        }
    }, [blocks.length]) // Only run on load/major updates if needed, but simple valid dependency check is trickier.
    // Actually, we don't persist canvas height efficiently yet (unless we add a metadata block or property).
    // For now, let's just allow resizing. If we want persistence, we'd need to store it.
    // User request implies "make final page long". 
    // The renderer uses auto-height based on content, but our builder has a fixed 1200px container currently.
    // If we make builder container resizable, we can place items lower.
    // The renderer wraps items relative, so it just expands.
    // So we just need to expand builder workspace.

    const handleCanvasResize = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        const startY = e.clientY
        const startHeight = canvasHeight

        const onMouseMove = (moveEvent: MouseEvent) => {
            const deltaY = (moveEvent.clientY - startY) / scale
            setCanvasHeight(Math.max(1200, startHeight + deltaY))
        }

        const onMouseUp = () => {
            document.removeEventListener('mousemove', onMouseMove)
            document.removeEventListener('mouseup', onMouseUp)
        }
        document.addEventListener('mousemove', onMouseMove)
        document.addEventListener('mouseup', onMouseUp)
    }

    const addBlock = (blockType: BlockType) => {
        const newBlock: Block = {
            id: Date.now().toString(),
            type: blockType,
            content: blockType === 'text' ? 'Double click to edit' : '',
            style: {
                x: 100,
                y: 100,
                width: blockType === 'text' ? 200 : 300,
                height: blockType === 'text' ? 100 : 200,
                zIndex: blocks.length + 1,
                fontSize: 16,
                color: '#000000',
                backgroundColor: 'transparent',
                borderRadius: 0,
                opacity: 1
            }
        }
        setBlocks([...blocks, newBlock])
        setSelectedBlockId(newBlock.id)
    }

    const updateBlock = (blockId: string, updates: Partial<Block> | Partial<Block['style']>) => {
        setBlocks(blocks.map(b => {
            if (b.id !== blockId) return b

            // Check if updates are style properties
            const styleKeys = ['x', 'y', 'width', 'height', 'fontSize', 'color', 'zIndex', 'backgroundColor', 'borderRadius', 'opacity', 'boxShadow']
            const isStyleUpdate = Object.keys(updates).some(k => styleKeys.includes(k))

            if (isStyleUpdate) {
                return { ...b, style: { ...b.style, ...updates } }
            }
            return { ...b, ...updates }
        }))
    }

    const deleteBlock = (blockId: string) => {
        setBlocks(blocks.filter(b => b.id !== blockId))
        if (selectedBlockId === blockId) setSelectedBlockId(null)
    }

    const handleSave = async () => {
        setSaving(true)
        try {
            const res = await fetch(`/api/admin/content?type=${type}`)
            const allItems = await res.json()
            const newItems = allItems.map((item: any) =>
                item.id === id ? { ...item, blocks } : item
            )

            await fetch('/api/admin/content', {
                method: 'POST',
                body: JSON.stringify({ type, data: newItems })
            })
            // Could add toast notification here
        } catch (e) {
            console.error(e)
            alert('Failed to save')
        } finally {
            setSaving(false)
        }
    }

    const openMediaManager = (blockId: string) => {
        setMediaTargetBlockId(blockId)
        setIsMediaManagerOpen(true)
    }

    const handleMediaSelect = (url: string) => {
        if (mediaTargetBlockId) {
            updateBlock(mediaTargetBlockId, { content: url })
        }
        setIsMediaManagerOpen(false)
        setMediaTargetBlockId(null)
    }

    return (
        <div className="h-screen flex flex-col bg-gray-50 overflow-hidden font-sans">
            <MediaManager
                isOpen={isMediaManagerOpen}
                onClose={() => setIsMediaManagerOpen(false)}
                onSelect={handleMediaSelect}
            />

            {/* Header */}
            <header className="bg-white/80 backdrop-blur-md border-b border-gray-200 h-16 px-6 flex justify-between items-center z-50">
                <div className="flex items-center gap-4">
                    <Link href={`/admin/${type}`} className="p-2 hover:bg-gray-100 rounded-lg transition-colors text-gray-600">
                        <ArrowLeft className="h-5 w-5" />
                    </Link>
                    <div className="h-6 w-px bg-gray-200"></div>
                    <div>
                        <h1 className="font-bold text-gray-900 tracking-tight">Adapt Studio</h1>
                        <p className="text-xs text-gray-500 font-medium uppercase tracking-wider">{type} / Builder</p>
                    </div>
                </div>

                <div className="flex items-center gap-3">
                    <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg mr-4">
                        <button
                            onClick={() => setShowGrid(!showGrid)}
                            className={`p-2 rounded-md transition-all ${showGrid ? 'bg-white shadow text-brand' : 'text-gray-500 hover:text-gray-900'}`}
                            title="Toggle Grid"
                        >
                            <Grid size={16} />
                        </button>
                        <button
                            onClick={() => setScale(s => Math.max(0.5, s - 0.1))}
                            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-white/50 rounded-md"
                        >
                            <Minimize size={16} />
                        </button>
                        <span className="text-xs font-medium w-8 text-center">{Math.round(scale * 100)}%</span>
                        <button
                            onClick={() => setScale(s => Math.min(1.5, s + 0.1))}
                            className="p-2 text-gray-500 hover:text-gray-900 hover:bg-white/50 rounded-md"
                        >
                            <Maximize size={16} />
                        </button>
                    </div>

                    <button
                        onClick={handleSave}
                        disabled={saving}
                        className="bg-gray-900 text-white px-5 py-2.5 rounded-xl font-medium flex items-center gap-2 hover:bg-gray-800 disabled:opacity-50 transition-all shadow-lg shadow-gray-900/20 active:scale-95"
                    >
                        <Save className="h-4 w-4" />
                        {saving ? 'Saving...' : 'Publish Changes'}
                    </button>
                </div>
            </header>

            <div className="flex-1 flex overflow-hidden">
                {/* Tools Sidebar */}
                <aside className="w-20 bg-white border-r border-gray-200 flex flex-col items-center py-6 gap-6 z-40 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)]">
                    <ToolButton icon={<MousePointer2 size={22} />} label="Select" active />
                    <div className="w-8 h-px bg-gray-100"></div>
                    <ToolButton icon={<Type size={22} />} label="Text" onClick={() => addBlock('text')} />
                    <ToolButton icon={<ImageIcon size={22} />} label="Image" onClick={() => addBlock('image')} />
                    <ToolButton icon={<Video size={22} />} label="Video" onClick={() => addBlock('video')} />
                    <div className="flex-1"></div>
                    <ToolButton icon={<Settings size={22} />} label="Settings" />
                </aside>

                {/* Canvas Area */}
                <main className="flex-1 relative overflow-hidden bg-gray-50 flex items-center justify-center">
                    <div
                        ref={containerRef}
                        className="w-full h-full overflow-auto relative custom-scrollbar p-20"
                        onClick={(e) => {
                            if (e.target === e.currentTarget) setSelectedBlockId(null)
                        }}
                    >
                        <div
                            className="min-w-[1200px] bg-white rounded-xl shadow-sm relative transition-transform duration-200 ease-out origin-top-left"
                            style={{
                                height: canvasHeight,
                                transform: `scale(${scale})`,
                                backgroundImage: showGrid ? 'radial-gradient(#e5e7eb 1px, transparent 1px)' : 'none',
                                backgroundSize: '24px 24px'
                            }}
                        >

                            {blocks.map(block => (
                                <DraggableBlock
                                    key={block.id}
                                    block={block}
                                    isSelected={selectedBlockId === block.id}
                                    onSelect={() => setSelectedBlockId(block.id)}
                                    onUpdate={(updates) => updateBlock(block.id, updates)}
                                    scale={scale}
                                />
                            ))}

                            {/* Canvas Resize Handle */}
                            <div
                                onMouseDown={handleCanvasResize}
                                className="absolute bottom-0 left-0 right-0 h-6 bg-gray-50 border-t border-gray-200 hover:bg-gray-100 cursor-ns-resize flex items-center justify-center group"
                            >
                                <GripHorizontal size={16} className="text-gray-300 group-hover:text-gray-500" />
                            </div>
                        </div>
                    </div>
                </main>

                {/* Properties Panel */}
                <AnimatePresence mode="popLayout">
                    {selectedBlockId && (
                        <motion.aside
                            initial={{ x: 320, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 320, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="w-80 bg-white border-l border-gray-200 z-40 overflow-y-auto shadow-[-4px_0_24px_-12px_rgba(0,0,0,0.1)]"
                        >
                            {(() => {
                                const block = blocks.find(b => b.id === selectedBlockId)!
                                if (!block) return null
                                return (
                                    <div className="p-6 space-y-8">
                                        <div className="flex items-center justify-between">
                                            <h3 className="font-bold text-gray-900 text-lg">Properties</h3>
                                            <div className="flex gap-2">
                                                <button className="p-2 text-gray-400 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-colors">
                                                    <Copy size={16} />
                                                </button>
                                                <button
                                                    onClick={() => deleteBlock(block.id)}
                                                    className="p-2 text-red-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                                                >
                                                    <Trash2 size={16} />
                                                </button>
                                            </div>
                                        </div>

                                        {/* Layout Section */}
                                        <div className="space-y-4">
                                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                                <Move size={12} /> Layout
                                            </h4>
                                            <div className="grid grid-cols-2 gap-4">
                                                <InputGroup label="X Position" value={block.style.x} onChange={v => updateBlock(block.id, { x: parseInt(v) })} />
                                                <InputGroup label="Y Position" value={block.style.y} onChange={v => updateBlock(block.id, { y: parseInt(v) })} />
                                                <InputGroup label="Width" value={block.style.width} onChange={v => updateBlock(block.id, { width: parseInt(v) })} />
                                                <InputGroup label="Height" value={block.style.height} onChange={v => updateBlock(block.id, { height: parseInt(v) })} />
                                                <InputGroup label="Rotation" value="0°" disabled />
                                                <InputGroup label="Z-Index" value={block.style.zIndex} onChange={v => updateBlock(block.id, { zIndex: parseInt(v) })} />
                                            </div>
                                        </div>

                                        <div className="h-px bg-gray-100"></div>

                                        {/* Content Specific */}
                                        {block.type === 'text' && (
                                            <div className="space-y-4">
                                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                                    <Type size={12} /> Typography
                                                </h4>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Content</label>
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-500 mb-1.5">Content</label>
                                                        <RichTextInput
                                                            value={block.content}
                                                            onChange={val => updateBlock(block.id, { content: val })}
                                                        />
                                                    </div>
                                                </div>
                                                <div className="grid grid-cols-2 gap-4">
                                                    <InputGroup label="Size (px)" value={block.style.fontSize} onChange={v => updateBlock(block.id, { fontSize: parseInt(v) })} />
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-500 mb-1.5">Color</label>
                                                        <div className="flex items-center gap-2 border border-gray-200 rounded-lg p-1 pr-2">
                                                            <input
                                                                type="color"
                                                                value={block.style.color}
                                                                onChange={e => updateBlock(block.id, { color: e.target.value })}
                                                                className="w-8 h-8 rounded cursor-pointer border-none p-0"
                                                            />
                                                            <span className="text-xs font-mono text-gray-600 uppercase">{block.style.color}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        )}

                                        {(block.type === 'image' || block.type === 'video') && (
                                            <div className="space-y-4">
                                                <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                                    <Layers size={12} /> Source
                                                </h4>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500 mb-1.5">URL / Asset</label>
                                                    <div className="flex gap-2">
                                                        <input
                                                            type="text"
                                                            value={block.content}
                                                            onChange={e => updateBlock(block.id, { content: e.target.value })}
                                                            className="flex-1 border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none"
                                                            placeholder="https://..."
                                                        />
                                                        <button
                                                            onClick={() => openMediaManager(block.id)}
                                                            className="bg-gray-100 hover:bg-gray-200 text-gray-600 p-2 rounded-lg transition-colors"
                                                            title="Select from Media Library"
                                                        >
                                                            <ImageIcon size={18} />
                                                        </button>
                                                    </div>
                                                </div>

                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-500 mb-1.5">Image Fit</label>
                                                        <select
                                                            value={block.style.objectFit || 'cover'}
                                                            onChange={e => updateBlock(block.id, { objectFit: e.target.value as any })}
                                                            className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none"
                                                        >
                                                            <option value="cover">Cover (Fill)</option>
                                                            <option value="contain">Contain (Fit)</option>
                                                        </select>
                                                    </div>
                                                    <div>
                                                        <label className="block text-xs font-medium text-gray-500 mb-1.5">Focus Point</label>
                                                        <select
                                                            value={block.style.objectPosition || 'center'}
                                                            onChange={e => updateBlock(block.id, { objectPosition: e.target.value })}
                                                            className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none"
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
                                        )}

                                        <div className="h-px bg-gray-100"></div>

                                        {/* Appearance */}
                                        <div className="space-y-4">
                                            <h4 className="text-xs font-bold text-gray-400 uppercase tracking-wider flex items-center gap-2">
                                                <ImageIcon size={12} /> Appearance
                                            </h4>
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <label className="text-xs font-medium text-gray-600">Opacity</label>
                                                    <span className="text-xs text-gray-400">{block.style.opacity || 1}</span>
                                                </div>
                                                <input
                                                    type="range"
                                                    min="0" max="1" step="0.1"
                                                    value={block.style.opacity || 1}
                                                    onChange={e => updateBlock(block.id, { opacity: parseFloat(e.target.value) })}
                                                    className="w-full accent-brand"
                                                />

                                                <InputGroup label="Border Radius" value={block.style.borderRadius || 0} onChange={v => updateBlock(block.id, { borderRadius: parseInt(v) })} />

                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Shadow</label>
                                                    <select
                                                        value={block.style.boxShadow || 'none'}
                                                        onChange={e => updateBlock(block.id, { boxShadow: e.target.value })}
                                                        className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none"
                                                    >
                                                        <option value="none">None</option>
                                                        <option value="0 4px 6px -1px rgb(0 0 0 / 0.1), 0 2px 4px -2px rgb(0 0 0 / 0.1)">Small</option>
                                                        <option value="0 10px 15px -3px rgb(0 0 0 / 0.1), 0 4px 6px -4px rgb(0 0 0 / 0.1)">Medium</option>
                                                        <option value="0 20px 25px -5px rgb(0 0 0 / 0.1), 0 8px 10px -6px rgb(0 0 0 / 0.1)">Large</option>
                                                        <option value="0 25px 50px -12px rgb(0 0 0 / 0.25)">X-Large</option>
                                                        <option value=" inset 0 2px 4px 0 rgb(0 0 0 / 0.05)">Inset</option>
                                                    </select>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Background</label>
                                                    <div className="flex items-center gap-2 border border-gray-200 rounded-lg p-1 pr-2">
                                                        <input
                                                            type="color"
                                                            value={block.style.backgroundColor === '' ? '#ffffff' : block.style.backgroundColor}
                                                            onChange={e => updateBlock(block.id, { backgroundColor: e.target.value })}
                                                            className="w-8 h-8 rounded cursor-pointer border-none p-0"
                                                        />
                                                        <span className="text-xs font-mono text-gray-600 uppercase flex-1 truncate">
                                                            {block.style.backgroundColor || 'Transparent'}
                                                        </span>
                                                        <button
                                                            onClick={() => updateBlock(block.id, { backgroundColor: 'transparent' })}
                                                            className="text-xs text-gray-400 hover:text-red-500"
                                                        >
                                                            Clear
                                                        </button>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                    </div>
                                )
                            })()}
                        </motion.aside>
                    )}
                </AnimatePresence>
            </div>
        </div>
    )
}

function InputGroup({ label, value, onChange, disabled }: { label: string, value: any, onChange?: (val: string) => void, disabled?: boolean }) {
    return (
        <div>
            <label className="block text-xs font-medium text-gray-500 mb-1.5">{label}</label>
            <input
                type="number"
                value={value}
                onChange={e => onChange?.(e.target.value)}
                disabled={disabled}
                className="w-full border border-gray-200 rounded-lg p-2 text-sm focus:ring-2 focus:ring-brand/20 focus:border-brand outline-none disabled:bg-gray-50 disabled:text-gray-400 transition-all font-mono"
            />
        </div>
    )
}

function RichTextInput({ value, onChange }: { value: string, onChange: (val: string) => void }) {
    const editorRef = useRef<HTMLDivElement>(null)
    const isFocused = useRef(false)

    // Sync external value to editor only when NOT focused to prevent cursor jumping
    useEffect(() => {
        if (!isFocused.current && editorRef.current && editorRef.current.innerHTML !== value) {
            editorRef.current.innerHTML = value
        }
    }, [value])

    const format = (tag: string) => {
        document.execCommand(tag, false)
        // Force update parent after format
        if (editorRef.current) onChange(editorRef.current.innerHTML)
    }

    return (
        <div className="border border-gray-200 rounded-lg bg-white overflow-hidden focus-within:ring-2 focus-within:ring-brand/20 focus-within:border-brand">
            <div className="flex items-center gap-1 border-b border-gray-100 p-1 bg-gray-50">
                <button onMouseDown={(e) => { e.preventDefault(); format('bold') }} className="p-1 hover:bg-white hover:shadow-sm rounded"><Bold size={14} /></button>
                <button onMouseDown={(e) => { e.preventDefault(); format('italic') }} className="p-1 hover:bg-white hover:shadow-sm rounded"><Italic size={14} /></button>
                <button onMouseDown={(e) => { e.preventDefault(); format('underline') }} className="p-1 hover:bg-white hover:shadow-sm rounded"><Underline size={14} /></button>
            </div>
            <div
                ref={editorRef}
                className="p-3 text-sm min-h-[100px] outline-none max-h-[300px] overflow-y-auto"
                contentEditable
                onFocus={() => { isFocused.current = true }}
                onBlur={(e) => {
                    isFocused.current = false
                    onChange(e.currentTarget.innerHTML)
                }}
                onInput={(e) => onChange(e.currentTarget.innerHTML)}
            />
        </div>
    )
}

function ToolButton({ icon, label, onClick, active }: { icon: React.ReactNode, label: string, onClick?: () => void, active?: boolean }) {
    return (
        <button
            onClick={onClick}
            className={`flex flex-col items-center gap-2 p-3 rounded-xl transition-all w-16 group ${active ? 'bg-brand/5 text-brand ring-1 ring-brand/20' : 'text-gray-400 hover:text-gray-900 hover:bg-gray-50'}`}
        >
            <div className={`p-2 rounded-lg transition-transform group-hover:scale-110 ${active ? 'bg-brand text-white shadow-lg shadow-brand/30' : 'bg-white shadow-sm border border-gray-100'}`}>
                {icon}
            </div>
            <span className="text-[10px] font-semibold">{label}</span>
        </button>
    )
}

function DraggableBlock({ block, isSelected, onSelect, onUpdate, scale }: { block: Block, isSelected: boolean, onSelect: () => void, onUpdate: (u: any) => void, scale: number }) {
    const [isResizing, setIsResizing] = useState(false)

    const handleResize = (e: React.MouseEvent, direction: 'se' | 'e' | 's') => {
        e.stopPropagation()
        e.preventDefault()
        setIsResizing(true)

        const startX = e.clientX
        const startY = e.clientY
        const startWidth = block.style.width
        const startHeight = block.style.height

        const onMouseMove = (moveEvent: MouseEvent) => {
            const deltaX = (moveEvent.clientX - startX) / scale
            const deltaY = (moveEvent.clientY - startY) / scale

            // Ensure we work with numbers. If auto, rely on min width behavior or assume default
            // In a real app we'd need to measure ref offsetWidth via getBoundingClientRect if auto.
            // But for now, we enforce new numeric dim.
            const baseW = typeof startWidth === 'number' ? startWidth : 200
            const baseH = typeof startHeight === 'number' ? startHeight : 100

            const newUpdates: any = {}
            if (direction === 'se' || direction === 'e') {
                newUpdates.width = Math.max(50, baseW + deltaX)
            }
            if (direction === 'se' || direction === 's') {
                newUpdates.height = Math.max(50, baseH + deltaY)
            }
            onUpdate(newUpdates)
        }

        const onMouseUp = () => {
            setIsResizing(false)
            document.removeEventListener('mousemove', onMouseMove)
            document.removeEventListener('mouseup', onMouseUp)
        }

        document.addEventListener('mousemove', onMouseMove)
        document.addEventListener('mouseup', onMouseUp)
    }

    return (
        <motion.div
            drag={!isResizing}
            dragMomentum={false}
            onDragEnd={(_, info) => {
                const newX = block.style.x + (info.offset.x / scale)
                const newY = block.style.y + (info.offset.y / scale)
                onUpdate({ x: Math.round(newX), y: Math.round(newY) })
            }}
            initial={{ x: block.style.x, y: block.style.y, opacity: 0, scale: 0.9 }}
            animate={{ x: block.style.x, y: block.style.y, opacity: 1, scale: 1 }}
            className={`absolute group ${isSelected ? 'z-[100]' : ''}`}
            style={{ zIndex: block.style.zIndex }}
        >
            <div
                onClick={(e) => { e.stopPropagation(); onSelect() }}
                className={`relative transition-shadow duration-200 ${isSelected ? 'ring-2 ring-brand ring-offset-4 shadow-2xl' : 'hover:ring-1 hover:ring-brand/50 hover:shadow-lg'}`}
                style={{
                    width: block.style.width,
                    height: block.style.height || 'auto',
                    backgroundColor: block.style.backgroundColor,
                    borderRadius: block.style.borderRadius,
                    opacity: block.style.opacity,
                    boxShadow: block.style.boxShadow
                }}
            >
                {/* Resize Handles (Only when selected) */}
                {isSelected && (
                    <>
                        {/* SE Handle (Corner) */}
                        <div
                            onMouseDown={(e) => handleResize(e, 'se')}
                            className="absolute -right-1.5 -bottom-1.5 w-4 h-4 bg-white border-2 border-brand rounded-full cursor-nwse-resize z-50 shadow-sm"
                        />
                        {/* E Handle (Side) */}
                        <div
                            onMouseDown={(e) => handleResize(e, 'e')}
                            className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-2 h-4 bg-white border border-brand/50 rounded-full cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                        {/* S Handle (Bottom) */}
                        <div
                            onMouseDown={(e) => handleResize(e, 's')}
                            className="absolute bottom-1.5 left-1/2 -translate-x-1/2 h-2 w-4 bg-white border border-brand/50 rounded-full cursor-ns-resize opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                    </>
                )}

                {/* Content Render */}
                <div className="w-full h-full overflow-hidden" style={{ borderRadius: block.style.borderRadius }}>
                    {block.type === 'text' && (
                        <div
                            style={{ fontSize: block.style.fontSize, color: block.style.color }}
                            className="w-full h-full whitespace-pre-wrap p-4"
                            dangerouslySetInnerHTML={{ __html: block.content }}
                        />
                    )}

                    {block.type === 'image' && (
                        <div className="w-full h-full bg-gray-100 relative group-hover:bg-gray-50 transition-colors">
                            {block.content ? (
                                <img
                                    src={block.content}
                                    className="w-full h-full pointer-events-none"
                                    alt=""
                                    style={{
                                        objectFit: block.style.objectFit || 'cover',
                                        objectPosition: block.style.objectPosition || 'center'
                                    }}
                                />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-gray-300">
                                    <ImageIcon size={48} strokeWidth={1} />
                                    <span className="text-xs mt-2 font-medium">No Image Set</span>
                                </div>
                            )}
                        </div>
                    )}

                    {block.type === 'video' && (
                        <div className="w-full h-full bg-black relative">
                            {block.content ? (
                                <video src={block.content} className="w-full h-full object-cover pointer-events-none" controls />
                            ) : (
                                <div className="flex flex-col items-center justify-center h-full text-gray-600">
                                    <Video size={48} strokeWidth={1} />
                                    <span className="text-xs mt-2 font-medium">No Video URL</span>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    )
}
