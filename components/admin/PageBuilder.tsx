'use client'

import { useState, useEffect, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import {
    Save, Type, Image as ImageIcon, Video, ArrowLeft,
    Monitor, Smartphone, Maximize, Minimize, Trash2, Copy, Eye, EyeOff, X,
    Bold, Italic, Underline,
    GripHorizontal, PanelLeft, PanelRight,
    Move, Grid, Layers, Settings, MousePointer2,
    AlignLeft, AlignCenter, AlignRight, AlignJustify,
    Group, Ungroup,
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
        textAlign?: 'left' | 'center' | 'right' | 'justify'
    }
    mobileStyle?: {
        x: number
        y: number
        width: number
        height: number
        fontSize?: number
    }
    groupId?: string
}

const SNAP_THRESHOLD = 15

interface SnapLine {
    id: string
    orientation: 'vertical' | 'horizontal'
    position: number // x or y value
    start: number
    end: number
}

function calculateSnapLines(
    activeId: string,
    current: { x: number; y: number; width: number; height: number },
    blocks: Block[]
): { lines: SnapLine[]; snapped: { x?: number; y?: number } } {
    const lines: SnapLine[] = []
    const snapped: { x?: number; y?: number } = {}

    // Define points of interest on the moving block
    const active = {
        left: current.x,
        center: current.x + current.width / 2,
        right: current.x + current.width,
        top: current.y,
        middle: current.y + current.height / 2,
        bottom: current.y + current.height,
    }

    let closestXDist = SNAP_THRESHOLD + 1
    let closestYDist = SNAP_THRESHOLD + 1

    blocks.forEach((block) => {
        if (block.id === activeId) return

        const bWidth = typeof block.style.width === 'number' ? block.style.width : 200
        const bHeight = typeof block.style.height === 'number' ? block.style.height : 100

        const target = {
            left: block.style.x,
            center: block.style.x + bWidth / 2,
            right: block.style.x + bWidth,
            top: block.style.y,
            middle: block.style.y + bHeight / 2,
            bottom: block.style.y + bHeight,
        }

        // Horizontal Alignments (Vertical Lines)
        const xComparisons = [
            { a: active.left, t: target.left },
            { a: active.left, t: target.right },
            { a: active.center, t: target.center },
            { a: active.right, t: target.left },
            { a: active.right, t: target.right },
        ]

        xComparisons.forEach(({ a, t }) => {
            const dist = Math.abs(a - t)
            if (dist < closestXDist) {
                closestXDist = dist
                let newX = t
                if (a === active.right) newX = t - current.width
                if (a === active.center) newX = t - current.width / 2

                snapped.x = newX

                const minY = Math.min(active.top, target.top)
                const maxY = Math.max(active.bottom, target.bottom)

                lines.push({
                    id: `v-${block.id}-${t}`,
                    orientation: 'vertical',
                    position: t,
                    start: minY - 20,
                    end: maxY + 20
                })
            }
        })

        // Vertical Alignments (Horizontal Lines)
        const yComparisons = [
            { a: active.top, t: target.top },
            { a: active.top, t: target.bottom },
            { a: active.middle, t: target.middle },
            { a: active.bottom, t: target.top },
            { a: active.bottom, t: target.bottom },
        ]

        yComparisons.forEach(({ a, t }) => {
            const dist = Math.abs(a - t)
            if (dist < closestYDist) {
                closestYDist = dist
                let newY = t
                if (a === active.bottom) newY = t - current.height
                if (a === active.middle) newY = t - current.height / 2

                snapped.y = newY

                const minX = Math.min(active.left, target.left)
                const maxX = Math.max(active.right, target.right)

                lines.push({
                    id: `h-${block.id}-${t}`,
                    orientation: 'horizontal',
                    position: t,
                    start: minX - 20,
                    end: maxX + 20
                })
            }
        })
    })

    // Filter to keep only relevant lines if snapped
    // For simplicity, we'll return the closest ones we found.
    // In a more complex implementation, we'd filter `lines` to only match `snapped.x` / `snapped.y`
    return { lines, snapped }
}

export default function PageBuilder({ type, id }: { type: string; id: string }) {
    const [blocks, setBlocks] = useState<Block[]>([])
    const [selectedBlockIds, setSelectedBlockIds] = useState<string[]>([])
    const [selectionBox, setSelectionBox] = useState<{ startX: number, startY: number, currentX: number, currentY: number } | null>(null)
    const [saving, setSaving] = useState(false)
    const [showGrid, setShowGrid] = useState(true)
    const [showLeftPanel, setShowLeftPanel] = useState(true)
    const [showRightPanel, setShowRightPanel] = useState(true)
    const containerRef = useRef<HTMLDivElement>(null)
    const canvasRef = useRef<HTMLDivElement>(null)

    const [scale, setScale] = useState(1)
    const [canvasHeight, setCanvasHeight] = useState(1200)

    // View Mode State
    const [viewMode, setViewMode] = useState<'desktop' | 'mobile'>('desktop')
    const [snapLines, setSnapLines] = useState<SnapLine[]>([])

    // Media Manager State
    const [isMediaManagerOpen, setIsMediaManagerOpen] = useState(false)
    const [mediaTargetBlockId, setMediaTargetBlockId] = useState<string | null>(null)

    // Load initial data
    // Load initial data
    useEffect(() => {
        const fetchContent = async () => {
            try {
                const res = await fetch(`/api/admin/content?type=${type}`)
                const data = await res.json()
                const item = data.find((i: any) => i.id === id)
                if (item) {
                    let loadedBlocks: Block[] = []
                    if (item.blocks) {
                        loadedBlocks = item.blocks
                        setBlocks(item.blocks)
                    }

                    if (item.canvasHeight && !isNaN(Number(item.canvasHeight))) {
                        setCanvasHeight(Number(item.canvasHeight))
                    } else if (loadedBlocks.length > 0) {
                        // Legacy: Auto-calculate if no saved height
                        const maxY = Math.max(...loadedBlocks.map(b => {
                            const h = typeof b.style.height === 'number' ? b.style.height : 100
                            return (b.style.y || 0) + h
                        }))
                        setCanvasHeight(Math.max(1200, maxY + 200))
                    }
                }
            } catch (error) {
                console.error('Error fetching content:', error)
            }
        }
        fetchContent()
    }, [type, id])

    const handleCanvasMouseDown = (e: React.MouseEvent) => {
        if (e.button !== 0) return
        if (!e.shiftKey) {
            setSelectedBlockIds([])
        }

        const rect = canvasRef.current?.getBoundingClientRect()
        if (!rect) return

        const x = (e.clientX - rect.left) / scale
        const y = (e.clientY - rect.top) / scale

        setSelectionBox({ startX: x, startY: y, currentX: x, currentY: y })
    }

    const handleCanvasMouseMove = (e: React.MouseEvent) => {
        if (!selectionBox || !canvasRef.current) return

        const rect = canvasRef.current.getBoundingClientRect()
        const x = (e.clientX - rect.left) / scale
        const y = (e.clientY - rect.top) / scale

        setSelectionBox(prev => prev ? { ...prev, currentX: x, currentY: y } : null)
    }

    const handleCanvasMouseUp = () => {
        if (!selectionBox) return

        const x1 = Math.min(selectionBox.startX, selectionBox.currentX)
        const x2 = Math.max(selectionBox.startX, selectionBox.currentX)
        const y1 = Math.min(selectionBox.startY, selectionBox.currentY)
        const y2 = Math.max(selectionBox.startY, selectionBox.currentY)

        const newlySelected = blocks.filter(b => {
            const bW = typeof b.style.width === 'number' ? b.style.width : 200
            const bH = typeof b.style.height === 'number' ? b.style.height : 100
            return (
                b.style.x < x2 &&
                (b.style.x + bW) > x1 &&
                b.style.y < y2 &&
                (b.style.y + bH) > y1
            )
        }).map(b => b.id)

        setSelectedBlockIds(prev => Array.from(new Set([...prev, ...newlySelected])))
        setSelectionBox(null)
    }

    const handleCanvasResize = (e: React.MouseEvent) => {
        e.preventDefault()
        e.stopPropagation()
        const startY = e.clientY
        const startHeight = isNaN(canvasHeight) ? 1200 : canvasHeight

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

    const checkAutoExpand = (currentBlocks: Block[]) => {
        if (currentBlocks.length === 0) return
        const maxY = Math.max(...currentBlocks.map(b => {
            const h = typeof b.style.height === 'number' ? b.style.height : 100
            return (b.style.y || 0) + h
        }))
        setCanvasHeight(prev => {
            const safePrev = isNaN(prev) ? 1200 : prev
            return Math.max(safePrev, maxY + 200)
        })
    }

    const addBlock = (blockType: BlockType) => {
        // Calculate spawn position based on scroll
        // Default to 100 if no scroll or container
        const currentScrollY = containerRef.current?.scrollTop || 0
        const spawnY = Math.round((currentScrollY / scale) + 100)

        const newBlock: Block = {
            id: Date.now().toString(),
            type: blockType,
            content: blockType === 'text' ? 'Double click to edit' : '',
            style: {
                x: 100, // Keep X constant or maybe center it? 100 is fine for now.
                y: spawnY,
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
        const newBlocks = [...blocks, newBlock]
        setBlocks(newBlocks)
        setSelectedBlockIds([newBlock.id])
        checkAutoExpand(newBlocks)
    }

    const updateBlock = (blockId: string, updates: Partial<Block> | Partial<Block['style']> | { mobileStyle?: Partial<Block['mobileStyle']> }) => {
        const newBlocks = blocks.map(b => {
            if (b.id !== blockId) return b

            // Handle mobileStyle updates explicitly if present
            if ('mobileStyle' in updates && updates.mobileStyle) {
                return {
                    ...b, mobileStyle: {
                        ...(b.mobileStyle || {
                            x: b.style.x,
                            y: b.style.y,
                            width: b.style.width,
                            height: b.style.height,
                            fontSize: b.style.fontSize
                        }), ...updates.mobileStyle
                    } as any
                }
            }

            // Check if updates are style properties
            const styleKeys = ['x', 'y', 'width', 'height', 'fontSize', 'color', 'zIndex', 'backgroundColor', 'borderRadius', 'opacity', 'boxShadow', 'objectFit', 'objectPosition', 'textAlign']
            const isStyleUpdate = Object.keys(updates).some(k => styleKeys.includes(k))

            if (isStyleUpdate) {
                return { ...b, style: { ...b.style, ...updates } }
            }
            return { ...b, ...updates }
        }) as Block[]

        setBlocks(newBlocks)
        // Only check expand if position or size changed
        const isPosOrSizeChange = Object.keys(updates).some(k => ['x', 'y', 'width', 'height'].includes(k))
        if (isPosOrSizeChange) {
            checkAutoExpand(newBlocks)
        }
    }

    const deleteBlock = (blockId: string) => {
        setBlocks(blocks.filter(b => b.id !== blockId))
        setSelectedBlockIds(prev => prev.filter(id => id !== blockId))
    }

    const handleSave = async () => {
        setSaving(true)
        console.log('Saving canvas height:', canvasHeight)
        try {
            const res = await fetch(`/api/admin/content?type=${type}`)
            const allItems = await res.json()
            const newItems = allItems.map((item: any) =>
                item.id === id ? { ...item, blocks, canvasHeight } : item
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

    const handleGroup = () => {
        if (selectedBlockIds.length < 2) return
        const newGroupId = `group-${Date.now()}`
        const newBlocks = blocks.map(b =>
            selectedBlockIds.includes(b.id) ? { ...b, groupId: newGroupId } : b
        )
        setBlocks(newBlocks)
    }

    const handleUngroup = () => {
        if (selectedBlockIds.length === 0) return
        const newBlocks = blocks.map(b =>
            selectedBlockIds.includes(b.id) ? { ...b, groupId: undefined } : b
        )
        setBlocks(newBlocks)
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
                            onClick={() => setShowLeftPanel(!showLeftPanel)}
                            className={`p-2 rounded-md transition-all ${showLeftPanel ? 'bg-white shadow text-brand' : 'text-gray-500 hover:text-gray-900'}`}
                            title="Toggle Tools"
                        >
                            <PanelLeft size={16} />
                        </button>

                        <div className="w-px h-4 bg-gray-200 mx-1"></div>

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

                        <div className="w-px h-4 bg-gray-200 mx-1"></div>

                        {/* View Mode Toggles */}
                        <div className="flex bg-gray-200/50 p-0.5 rounded-lg">
                            <button
                                onClick={() => setViewMode('desktop')}
                                className={`p-1.5 rounded-md transition-all ${viewMode === 'desktop' ? 'bg-white shadow text-brand' : 'text-gray-500 hover:text-gray-900'}`}
                                title="Desktop View"
                            >
                                <Monitor size={16} />
                            </button>
                            <button
                                onClick={() => setViewMode('mobile')}
                                className={`p-1.5 rounded-md transition-all ${viewMode === 'mobile' ? 'bg-white shadow text-brand' : 'text-gray-500 hover:text-gray-900'}`}
                                title="Mobile View"
                            >
                                <Smartphone size={16} />
                            </button>
                        </div>

                        {/* Auto-Stack Button (Mobile Only) */}
                        {viewMode === 'mobile' && (
                            <>
                                <div className="w-px h-4 bg-gray-200 mx-1"></div>
                                <button
                                    onClick={async () => {
                                        // 1. Measure real heights
                                        // Create a hidden container to render blocks and measure them
                                        const measureContainer = document.createElement('div')
                                        measureContainer.style.position = 'fixed'
                                        measureContainer.style.left = '-9999px'
                                        measureContainer.style.top = '0'
                                        measureContainer.style.width = '350px' // Mobile width
                                        measureContainer.style.visibility = 'hidden'
                                        document.body.appendChild(measureContainer)

                                        const measuredHeights: Record<string, number> = {}

                                        for (const block of blocks) {
                                            const wrapper = document.createElement('div')
                                            wrapper.style.width = '100%'

                                            if (block.type === 'text') {
                                                wrapper.style.fontSize = `${block.mobileStyle?.fontSize || block.style.fontSize || 16}px`
                                                wrapper.style.lineHeight = '1.5' // Assumption
                                                wrapper.innerHTML = block.content
                                                // Add padding compensation if needed
                                                wrapper.style.padding = '16px' // Matches render padding
                                            } else {
                                                // Aspect ratio for media
                                                const dW = (typeof block.style.width === 'number' ? block.style.width : 300) || 300
                                                const dH = (typeof block.style.height === 'number' ? block.style.height : 200) || 200
                                                const targetH = dH * (350 / dW)
                                                wrapper.style.height = `${targetH}px`
                                            }

                                            measureContainer.appendChild(wrapper)
                                            measuredHeights[block.id] = wrapper.offsetHeight
                                            measureContainer.removeChild(wrapper)
                                        }
                                        document.body.removeChild(measureContainer)

                                        // 2. Cluster by Group
                                        interface Cluster {
                                            id: string
                                            blocks: Block[]
                                            y: number
                                        }

                                        const clusters: Cluster[] = []
                                        const processed = new Set<string>()

                                        blocks.forEach(block => {
                                            if (processed.has(block.id)) return

                                            if (block.groupId) {
                                                const groupMembers = blocks.filter(b => b.groupId === block.groupId)
                                                // Sort members by Y to maintain internal order
                                                groupMembers.sort((a, b) => a.style.y - b.style.y)

                                                clusters.push({
                                                    id: block.groupId,
                                                    blocks: groupMembers,
                                                    y: Math.min(...groupMembers.map(b => b.style.y))
                                                })
                                                groupMembers.forEach(m => processed.add(m.id))
                                            } else {
                                                clusters.push({
                                                    id: block.id,
                                                    blocks: [block],
                                                    y: block.style.y
                                                })
                                                processed.add(block.id)
                                            }
                                        })

                                        // 3. Smart Sort (Column-Aware)
                                        // A. Identify Spanners (Full-width dividers) vs Content Columns
                                        const SPANNER_THRESHOLD = 600

                                        // Calculate effective width for each cluster (max width of members)
                                        const clusterWithBounds = clusters.map(c => ({
                                            ...c,
                                            width: Math.max(...c.blocks.map(b => typeof b.style.width === 'number' ? b.style.width : 200)),
                                            x: Math.min(...c.blocks.map(b => b.style.x))
                                        }))

                                        const spanners = clusterWithBounds.filter(c => c.width > SPANNER_THRESHOLD).sort((a, b) => a.y - b.y)
                                        const nonSpanners = clusterWithBounds.filter(c => c.width <= SPANNER_THRESHOLD)

                                        // B. Create Buckets between spanners
                                        const buckets: typeof clusterWithBounds[] = Array(spanners.length + 1).fill(null).map(() => [])

                                        nonSpanners.forEach(cluster => {
                                            let placed = false
                                            for (let i = 0; i < spanners.length; i++) {
                                                if (cluster.y < spanners[i].y) {
                                                    buckets[i].push(cluster)
                                                    placed = true
                                                    break
                                                }
                                            }
                                            if (!placed) {
                                                buckets[spanners.length].push(cluster)
                                            }
                                        })

                                        // C. Sort Buckets (Row vs Column)
                                        buckets.forEach(bucket => {
                                            bucket.sort((a, b) => {
                                                // If X is significantly different, sort by X (Columns)
                                                if (Math.abs(a.x - b.x) > 50) {
                                                    return a.x - b.x
                                                }
                                                // Otherwise sort by Y (Rows within column)
                                                return a.y - b.y
                                            })
                                        })

                                        // D. Flatten
                                        const sortedClusters: typeof clusterWithBounds = []
                                        for (let i = 0; i < buckets.length; i++) {
                                            sortedClusters.push(...buckets[i])
                                            if (i < spanners.length) {
                                                sortedClusters.push(spanners[i])
                                            }
                                        }

                                        // 4. Stack
                                        let currentY = 20
                                        const updates: Record<string, any> = {}

                                        sortedClusters.forEach(cluster => {
                                            const clusterStartY = currentY
                                            let clusterHeight = 0

                                            // For groups, we simply stack them sequentially for now to avoid complexity,
                                            // OR we could try to preserve relative layout.
                                            // Request was: "stack within groups". 
                                            // So we iterate members and stack them.

                                            cluster.blocks.forEach((block, index) => {
                                                const h = measuredHeights[block.id] || 100

                                                updates[block.id] = {
                                                    x: 20,
                                                    y: currentY,
                                                    width: 350,
                                                    height: h,
                                                    fontSize: Number(block.mobileStyle?.fontSize || block.style.fontSize) || 16
                                                }

                                                currentY += h + 20 // 20px gap within group
                                            })

                                            // Extract gap if it was the last item
                                            currentY += 20 // Extra gap between clusters
                                        })

                                        setBlocks(prev => prev.map(b => updates[b.id] ? { ...b, mobileStyle: updates[b.id] } : b))

                                        if (currentY + 100 > canvasHeight) {
                                            setCanvasHeight(currentY + 100)
                                        }
                                    }}
                                    className="p-1.5 px-3 rounded-md bg-blue-50 text-brand text-xs font-medium hover:bg-blue-100 transition-colors"
                                >
                                    Auto Stack
                                </button>
                            </>
                        )}

                        <div className="w-px h-4 bg-gray-200 mx-1"></div>

                        <button
                            onClick={() => setShowRightPanel(!showRightPanel)}
                            className={`p-2 rounded-md transition-all ${showRightPanel ? 'bg-white shadow text-brand' : 'text-gray-500 hover:text-gray-900'}`}
                            title="Toggle Properties"
                        >
                            <PanelRight size={16} />
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
                <AnimatePresence mode="popLayout">
                    {showLeftPanel && (
                        <motion.aside
                            initial={{ x: -100, opacity: 0, width: 0 }}
                            animate={{ x: 0, opacity: 1, width: 80 }}
                            exit={{ x: -100, opacity: 0, width: 0 }}
                            className="bg-white border-r border-gray-200 flex flex-col items-center py-6 gap-6 z-40 shadow-[4px_0_24px_-12px_rgba(0,0,0,0.1)] overflow-hidden"
                        >
                            <ToolButton icon={<MousePointer2 size={22} />} label="Select" active />
                            <div className="w-8 h-px bg-gray-100 shrink-0"></div>
                            <ToolButton icon={<Type size={22} />} label="Text" onClick={() => addBlock('text')} />
                            <ToolButton icon={<ImageIcon size={22} />} label="Image" onClick={() => addBlock('image')} />
                            <ToolButton icon={<Video size={22} />} label="Video" onClick={() => addBlock('video')} />
                            <div className="flex-1"></div>
                            <ToolButton icon={<Settings size={22} />} label="Settings" />
                        </motion.aside>
                    )}
                </AnimatePresence>

                {/* Canvas Area */}
                <main className="flex-1 relative overflow-hidden bg-gray-50 flex items-center justify-center">
                    <div
                        ref={containerRef}
                        className="w-full h-full overflow-auto relative custom-scrollbar p-20 flex justify-center"
                        onMouseDown={handleCanvasMouseDown}
                        onMouseMove={handleCanvasMouseMove}
                        onMouseUp={handleCanvasMouseUp}
                    >
                        <div
                            ref={canvasRef}
                            className={`bg-white shadow-sm relative transition-all duration-300 ease-out origin-top ${viewMode === 'mobile' ? 'ring-8 ring-black rounded-[3rem] my-10' : 'rounded-xl'}`}
                            style={{
                                width: viewMode === 'mobile' ? '390px' : '1200px',
                                minWidth: viewMode === 'mobile' ? '390px' : '1200px',
                                height: isNaN(canvasHeight) ? 1200 : canvasHeight,
                                transform: `scale(${scale})`,
                                backgroundImage: showGrid ? 'radial-gradient(#e5e7eb 1px, transparent 1px)' : 'none',
                                backgroundSize: '24px 24px'
                            }}
                        >
                            {/* Selection Box */}
                            {selectionBox && (
                                <div
                                    className="absolute border border-brand bg-brand/10 pointer-events-none z-[9999]"
                                    style={{
                                        left: Math.min(selectionBox.startX, selectionBox.currentX),
                                        top: Math.min(selectionBox.startY, selectionBox.currentY),
                                        width: Math.abs(selectionBox.currentX - selectionBox.startX),
                                        height: Math.abs(selectionBox.currentY - selectionBox.startY)
                                    }}
                                />
                            )}

                            {/* Snap Lines Overlay */}
                            {snapLines.map(line => {
                                const width = line.orientation === 'vertical' ? 2 : (line.end - line.start)
                                const height = line.orientation === 'horizontal' ? 2 : (line.end - line.start)

                                if (isNaN(width) || isNaN(height) || isNaN(line.position)) return null

                                return (
                                    <div
                                        key={line.id}
                                        className="absolute bg-red-500 z-[9999] pointer-events-none"
                                        style={{
                                            left: line.orientation === 'vertical' ? line.position : line.start,
                                            top: line.orientation === 'horizontal' ? line.position : line.start,
                                            width: `${width}px`,
                                            height: `${height}px`,
                                            transform: line.orientation === 'vertical' ? 'translateX(-1px)' : 'translateY(-1px)',
                                        }}
                                    />
                                )
                            })}

                            {blocks.map(block => {
                                // Determine effective style for rendering
                                const effectiveBlock = viewMode === 'mobile' ? {
                                    ...block,
                                    style: {
                                        ...block.style,
                                        ...(block.mobileStyle || { x: block.style.x, y: block.style.y, width: block.style.width, height: block.style.height, fontSize: block.style.fontSize })
                                    }
                                } : block

                                return (
                                    <DraggableBlock
                                        key={block.id}
                                        block={effectiveBlock}
                                        scale={scale}
                                        isSelected={selectedBlockIds.includes(block.id)}
                                        onSelect={(e) => {
                                            if (e.shiftKey) {
                                                setSelectedBlockIds(prev =>
                                                    prev.includes(block.id)
                                                        ? prev.filter(id => id !== block.id)
                                                        : [...prev, block.id]
                                                )
                                            } else {
                                                if (!selectedBlockIds.includes(block.id)) {
                                                    setSelectedBlockIds([block.id])
                                                }
                                            }
                                        }}
                                        onDrag={(pos) => {
                                            const { lines } = calculateSnapLines(block.id, pos, blocks)
                                            setSnapLines(lines)

                                            // Real-time multi-drag
                                            if (selectedBlockIds.includes(block.id) && pos.delta) {
                                                const dx = pos.delta.x
                                                const dy = pos.delta.y

                                                if (dx !== 0 || dy !== 0) {
                                                    setBlocks(prev => prev.map(b => {
                                                        // Move other selected blocks (but NOT the one being dragged, Framer handles it)
                                                        if (selectedBlockIds.includes(b.id) && b.id !== block.id) {
                                                            if (viewMode === 'mobile') {
                                                                const s = b.mobileStyle || { x: b.style.x, y: b.style.y, width: b.style.width, height: b.style.height, fontSize: b.style.fontSize }
                                                                return { ...b, mobileStyle: { ...s, x: s.x + dx, y: s.y + dy } as any }
                                                            } else {
                                                                return { ...b, style: { ...b.style, x: b.style.x + dx, y: b.style.y + dy } }
                                                            }
                                                        }
                                                        return b
                                                    }))
                                                }
                                            }
                                        }}
                                        onUpdate={(updates: any) => {
                                            setSnapLines([])

                                            // Resize Snapping
                                            if (updates.width !== undefined || updates.height !== undefined) {
                                                const currentRect = {
                                                    x: block.style.x,
                                                    y: block.style.y,
                                                    width: updates.width || block.style.width,
                                                    height: updates.height || block.style.height
                                                }
                                                const { lines } = calculateSnapLines(block.id, currentRect, blocks)

                                                if (updates.width !== undefined) {
                                                    const right = currentRect.x + currentRect.width
                                                    const center = currentRect.x + currentRect.width / 2

                                                    const rightSnap = lines.find(l => l.orientation === 'vertical' && Math.abs(l.position - right) < SNAP_THRESHOLD)
                                                    if (rightSnap) {
                                                        updates.width = rightSnap.position - currentRect.x
                                                    } else {
                                                        const centerSnap = lines.find(l => l.orientation === 'vertical' && Math.abs(l.position - center) < SNAP_THRESHOLD)
                                                        if (centerSnap) updates.width = (centerSnap.position - currentRect.x) * 2
                                                    }
                                                }

                                                if (updates.height !== undefined) {
                                                    const bottom = currentRect.y + currentRect.height
                                                    const middle = currentRect.y + currentRect.height / 2

                                                    const bottomSnap = lines.find(l => l.orientation === 'horizontal' && Math.abs(l.position - bottom) < SNAP_THRESHOLD)
                                                    if (bottomSnap) {
                                                        updates.height = bottomSnap.position - currentRect.y
                                                    } else {
                                                        const middleSnap = lines.find(l => l.orientation === 'horizontal' && Math.abs(l.position - middle) < SNAP_THRESHOLD)
                                                        if (middleSnap) updates.height = (middleSnap.position - currentRect.y) * 2
                                                    }
                                                }

                                                if (lines.length > 0) setSnapLines(lines)
                                            }

                                            if (updates.x !== undefined && updates.y !== undefined) {
                                                const w = (block.mobileStyle?.width || block.style.width || 0)
                                                const h = (block.mobileStyle?.height || block.style.height || 0)

                                                const currentPos = {
                                                    x: updates.x,
                                                    y: updates.y,
                                                    width: w,
                                                    height: h
                                                }

                                                const { snapped } = calculateSnapLines(block.id, currentPos, blocks)

                                                if (snapped.x !== undefined) updates.x = snapped.x
                                                if (snapped.y !== undefined) updates.y = snapped.y
                                            }

                                            // Real-time drag handles neighbors. Logic here only commits specific block.
                                            if (viewMode === 'mobile') {
                                                updateBlock(block.id, { mobileStyle: updates })
                                            } else {
                                                updateBlock(block.id, updates)
                                            }
                                        }}
                                        onResizeEnd={() => setSnapLines([])}
                                    />
                                )
                            })}

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
                    {showRightPanel && selectedBlockIds.length > 0 && (
                        <motion.aside
                            initial={{ x: 320, opacity: 0 }}
                            animate={{ x: 0, opacity: 1 }}
                            exit={{ x: 320, opacity: 0 }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                            className="w-80 bg-white border-l border-gray-200 z-40 overflow-y-auto shadow-[-4px_0_24px_-12px_rgba(0,0,0,0.1)]"
                        >
                            {(() => {
                                const primaryId = selectedBlockIds[selectedBlockIds.length - 1]
                                const block = blocks.find(b => b.id === primaryId)!
                                if (!block) return null
                                return (
                                    <div className="p-6 space-y-8">
                                        <div className="flex items-center justify-between">
                                            <div>
                                                <h3 className="font-bold text-gray-900 text-lg">Properties</h3>
                                                <span className="text-xs text-gray-500 font-medium">{selectedBlockIds.length} Selected</span>
                                            </div>
                                            <div className="flex gap-2">
                                                <button
                                                    onClick={handleGroup}
                                                    disabled={selectedBlockIds.length < 2}
                                                    className="p-2 text-gray-400 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-colors disabled:opacity-30 disabled:cursor-not-allowed"
                                                    title="Group Selected"
                                                >
                                                    <Group size={16} />
                                                </button>
                                                <div className="w-px h-4 bg-gray-200 self-center mx-1"></div>
                                                {selectedBlockIds.some(id => blocks.find(b => b.id === id)?.groupId) && (
                                                    <>
                                                        <button
                                                            onClick={handleUngroup}
                                                            className="p-2 text-gray-400 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-colors"
                                                            title="Ungroup"
                                                        >
                                                            <Ungroup size={16} />
                                                        </button>
                                                        <div className="w-px h-4 bg-gray-200 self-center mx-1"></div>
                                                    </>
                                                )}

                                                <button
                                                    onClick={() => setShowRightPanel(false)}
                                                    className="p-2 text-gray-400 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-colors"
                                                    title="Close Panel"
                                                >
                                                    <X size={16} />
                                                </button>
                                                <div className="w-px h-4 bg-gray-200 self-center mx-1"></div>
                                                <button className="p-2 text-gray-400 hover:text-gray-900 rounded-md hover:bg-gray-100 transition-colors">
                                                    <Copy size={16} />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        setBlocks(blocks.filter(b => !selectedBlockIds.includes(b.id)))
                                                        setSelectedBlockIds([])
                                                    }}
                                                    className="p-2 text-red-400 hover:text-red-600 rounded-md hover:bg-red-50 transition-colors"
                                                    title={selectedBlockIds.length > 1 ? "Delete Selected" : "Delete Block"}
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
                                                                value={block.style.color || '#000000'}
                                                                onChange={e => updateBlock(block.id, { color: e.target.value })}
                                                                className="w-8 h-8 rounded cursor-pointer border-none p-0"
                                                            />
                                                            <span className="text-xs font-mono text-gray-600 uppercase">{block.style.color}</span>
                                                        </div>
                                                    </div>
                                                </div>

                                                <div>
                                                    <label className="block text-xs font-medium text-gray-500 mb-1.5">Alignment</label>
                                                    <div className="flex bg-gray-100 p-1 rounded-lg">
                                                        {[
                                                            { id: 'left', icon: <AlignLeft size={16} /> },
                                                            { id: 'center', icon: <AlignCenter size={16} /> },
                                                            { id: 'right', icon: <AlignRight size={16} /> },
                                                            { id: 'justify', icon: <AlignJustify size={16} /> }
                                                        ].map(align => (
                                                            <button
                                                                key={align.id}
                                                                onClick={() => updateBlock(block.id, { textAlign: align.id as any })}
                                                                className={`flex-1 p-1.5 flex justify-center rounded transition-all ${(block.style.textAlign || 'left') === align.id
                                                                    ? 'bg-white shadow text-brand'
                                                                    : 'text-gray-400 hover:text-gray-600'
                                                                    }`}
                                                            >
                                                                {align.icon}
                                                            </button>
                                                        ))}
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
                                                            value={block.style.backgroundColor || '#ffffff'}
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
                value={Number.isNaN(Number(value)) ? '' : value || ''}
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

const ResizeHandle = ({
    onPointerDown,
    className
}: {
    onPointerDown: (e: PointerEvent) => void,
    className: string
}) => {
    const ref = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const element = ref.current
        if (!element) return

        const handleDown = (e: PointerEvent) => {
            e.stopPropagation() // Stop Framer Motion drag
            onPointerDown(e)
        }

        // Attach capture listener for maximum priority, or just bubble phase is fine if child
        // Framer Motion usually attaches to the draggable element.
        // If we stop propagation here (child), it won't reach parent.
        element.addEventListener('pointerdown', handleDown)
        return () => element.removeEventListener('pointerdown', handleDown)
    }, [onPointerDown])

    return <div ref={ref} className={className} />
}

function DraggableBlock({ block, isSelected, onSelect, onUpdate, onDrag, onResizeEnd, scale }: { block: Block, isSelected: boolean, onSelect: (e: React.MouseEvent) => void, onUpdate: (u: any) => void, onDrag?: (pos: { x: number, y: number, width: number, height: number, delta: { x: number, y: number } }) => void, onResizeEnd?: () => void, scale: number }) {
    const [isResizing, setIsResizing] = useState(false)

    // Using native event in signature because it comes from our Ref listener
    const handleResize = (e: PointerEvent, direction: 'se' | 'e' | 's') => {
        // e.stopPropagation() // Already done in ResizeHandle
        e.preventDefault()
        setIsResizing(true)

        const startX = e.clientX
        const startY = e.clientY
        const startWidth = block.style.width
        const startHeight = block.style.height

        const onPointerMove = (moveEvent: PointerEvent) => {
            const deltaX = (moveEvent.clientX - startX) / scale
            const deltaY = (moveEvent.clientY - startY) / scale

            const baseW = typeof startWidth === 'number' ? startWidth : 200
            const baseH = typeof startHeight === 'number' ? startHeight : 100

            const newUpdates: any = {}
            if (direction === 'se' || direction === 'e') {
                newUpdates.width = Math.round(Math.max(50, baseW + deltaX))
            }
            if (direction === 'se' || direction === 's') {
                newUpdates.height = Math.round(Math.max(50, baseH + deltaY))
            }
            onUpdate(newUpdates)
        }

        const onPointerUp = () => {
            setIsResizing(false)
            if (onResizeEnd) onResizeEnd()
            document.removeEventListener('pointermove', onPointerMove)
            document.removeEventListener('pointerup', onPointerUp)
        }

        document.addEventListener('pointermove', onPointerMove)
        document.addEventListener('pointerup', onPointerUp)
    }

    return (
        <motion.div
            onMouseDown={(e) => e.stopPropagation()}
            drag={!isResizing} // Should be redundant now, but good safety
            dragMomentum={false}
            onDrag={(_, info) => {
                if (onDrag) {
                    const currentX = block.style.x + (info.offset.x / scale)
                    const currentY = block.style.y + (info.offset.y / scale)
                    const w = typeof block.style.width === 'number' ? block.style.width : 200
                    const h = typeof block.style.height === 'number' ? block.style.height : 100
                    onDrag({
                        x: currentX,
                        y: currentY,
                        width: w,
                        height: h,
                        delta: {
                            x: info.delta.x / scale,
                            y: info.delta.y / scale
                        }
                    })
                }
            }}
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
                onClick={(e) => { e.stopPropagation(); onSelect(e) }}
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
                        <ResizeHandle
                            onPointerDown={(e) => handleResize(e, 'se')}
                            className="absolute -right-1.5 -bottom-1.5 w-4 h-4 bg-white border-2 border-brand rounded-full cursor-nwse-resize z-50 shadow-sm"
                        />
                        {/* E Handle (Side) */}
                        <ResizeHandle
                            onPointerDown={(e) => handleResize(e, 'e')}
                            className="absolute -right-1.5 top-1/2 -translate-y-1/2 w-2 h-4 bg-white border border-brand/50 rounded-full cursor-ew-resize opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                        {/* S Handle (Bottom) */}
                        <ResizeHandle
                            onPointerDown={(e) => handleResize(e, 's')}
                            className="absolute bottom-1.5 left-1/2 -translate-x-1/2 h-2 w-4 bg-white border border-brand/50 rounded-full cursor-ns-resize opacity-0 group-hover:opacity-100 transition-opacity"
                        />
                    </>
                )}

                {/* Content Render */}
                <div className="w-full h-full overflow-hidden" style={{ borderRadius: block.style.borderRadius }}>
                    {block.type === 'text' && (
                        <div
                            style={{
                                fontSize: block.style.fontSize || 16,
                                color: block.style.color,
                                textAlign: block.style.textAlign || 'left'
                            }}
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
                                (() => {
                                    const youtubeMatch = block.content.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)
                                    if (youtubeMatch) {
                                        return (
                                            <iframe
                                                src={`https://www.youtube.com/embed/${youtubeMatch[1]}`}
                                                className="w-full h-full pointer-events-none"
                                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                                allowFullScreen
                                            />
                                        )
                                    }
                                    return <video src={block.content} className="w-full h-full object-cover pointer-events-none" controls />
                                })()
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
