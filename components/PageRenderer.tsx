'use client'

import { motion } from 'framer-motion'
import { useRef, useState, useEffect } from 'react'

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
        textAlign?: string
    }
    mobileStyle?: {
        x: number
        y: number
        width: number
        height: number
        fontSize?: number
    }
}

export default function PageRenderer({ blocks }: { blocks: Block[] }) {
    const containerRef = useRef<HTMLDivElement>(null)
    const [dynamicHeight, setDynamicHeight] = useState<number | null>(null)

    if (!blocks || blocks.length === 0) {
        return null; // Or return a placeholder if desired
    }

    // Static estimate (fallback)
    const staticHeight = Math.max(
        ...blocks.map(b => b.style.y + (b.style.height || 0)),
        0
    ) + 100;

    useEffect(() => {
        const updateHeight = () => {
            if (!containerRef.current) return
            const children = Array.from(containerRef.current.children) as HTMLElement[]
            if (children.length === 0) return

            // Measure the bottom edge of the lowest block
            const bottom = Math.max(...children.map(c => c.offsetTop + c.offsetHeight))
            // Only update if significantly different (avoid jitter) or larger
            setDynamicHeight(prev => {
                const newHeight = bottom + 100 // Add padding
                if (!prev || Math.abs(newHeight - prev) > 5) {
                    return newHeight
                }
                return prev
            })
        }

        // Measure immediately
        updateHeight()

        // Measure after fonts load / animation starts
        const timeout = setTimeout(updateHeight, 500)

        // Measure on resize
        window.addEventListener('resize', updateHeight)

        return () => {
            window.removeEventListener('resize', updateHeight)
            clearTimeout(timeout)
        }
    }, [blocks])

    return (
        <div className="w-full min-h-screen bg-gray-50 overflow-x-auto">
            {/* Removed overflow-hidden to allow content to bleed out if needed, matching editor */}
            <div
                ref={containerRef}
                className="relative mx-auto w-full md:min-w-[1200px] max-w-[1200px] bg-white shadow-sm"
                style={{
                    minHeight: '100vh',
                    height: dynamicHeight ? `${dynamicHeight}px` : `${staticHeight}px`,
                    transition: 'height 0.3s ease-out'
                }}
            >
                {blocks.map(block => (
                    <BlockItem key={block.id} block={block} />
                ))}
            </div>
        </div>
    )
}


function BlockItem({ block }: { block: Block }) {
    const style = {
        '--x': `${block.style.x}px`,
        '--y': `${block.style.y}px`,
        '--w': `${block.style.width}px`,
        '--h': `${block.style.height || 0}px`,
        '--fs': `${block.style.fontSize}px`,
        // Mobile overrides
        '--m-x': `${block.mobileStyle?.x ?? block.style.x}px`,
        '--m-y': `${block.mobileStyle?.y ?? block.style.y}px`,
        '--m-w': `${block.mobileStyle?.width ?? 350}px`, // Default to roughly screen width 
        '--m-h': `${block.mobileStyle?.height ?? block.style.height ?? 0}px`,
        '--m-fs': `${block.mobileStyle?.fontSize ?? block.style.fontSize}px`,

        zIndex: block.style.zIndex,
        textAlign: block.style.textAlign,
        backgroundColor: block.style.backgroundColor,
        borderRadius: block.style.borderRadius,
        boxShadow: block.style.boxShadow,
    } as React.CSSProperties

    return (
        <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: block.style.opacity ?? 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            style={style}
            className="responsive-block overflow-hidden"
        >
            {block.type === 'text' && (
                <div
                    style={{ fontSize: 'var(--fs)', color: block.style.color }}
                    className="w-full h-full whitespace-pre-wrap p-4 text-[length:var(--fs)] md:text-[length:var(--fs)]" // tailwind dynamic class
                    dangerouslySetInnerHTML={{ __html: block.content }}
                />
            )}

            {block.type === 'image' && block.content && (
                <img
                    src={block.content}
                    className="w-full h-full pointer-events-none"
                    alt=""
                    style={{
                        objectFit: block.style.objectFit || 'cover',
                        objectPosition: block.style.objectPosition || 'center'
                    }}
                />
            )}

            {block.type === 'video' && block.content && (
                (() => {
                    const youtubeMatch = block.content.match(/(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?|shorts)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/)
                    if (youtubeMatch) {
                        return (
                            <iframe
                                src={`https://www.youtube.com/embed/${youtubeMatch[1]}`}
                                className="w-full h-full"
                                allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                                allowFullScreen
                            />
                        )
                    }
                    return (
                        <video
                            src={block.content}
                            controls
                            className="w-full h-full object-cover"
                        />
                    )
                })()
            )}
        </motion.div>
    )
}
