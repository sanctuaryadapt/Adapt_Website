'use client'

import { motion } from 'framer-motion'

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

export default function PageRenderer({ blocks }: { blocks: Block[] }) {
    if (!blocks || blocks.length === 0) {
        return null; // Or return a placeholder if desired
    }

    // Calculate the required height based on the bottom-most block
    const contentHeight = Math.max(
        ...blocks.map(b => b.style.y + (b.style.height || 0)),
        0
    ) + 100; // Add 100px padding at the bottom

    return (
        <div className="w-full min-h-screen bg-gray-50 flex justify-center overflow-y-auto overflow-x-hidden">
            <div
                className="relative w-full max-w-[1200px] bg-white shadow-sm overflow-hidden"
                style={{ minHeight: '100vh', height: `${contentHeight}px` }}
            >
                {blocks.map(block => (
                    <BlockItem key={block.id} block={block} />
                ))}
            </div>
        </div>
    )
}

function BlockItem({ block }: { block: Block }) {
    return (
        <motion.div
            initial={{ x: block.style.x, y: block.style.y + 20, opacity: 0 }}
            animate={{ x: block.style.x, y: block.style.y, opacity: block.style.opacity ?? 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }} // smooth apple-like easing
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                zIndex: block.style.zIndex,
                width: block.style.width,
                height: block.style.height || 'auto',
                backgroundColor: block.style.backgroundColor,
                borderRadius: block.style.borderRadius,
                boxShadow: block.style.boxShadow,
            }}
            className="overflow-hidden"
        >
            {block.type === 'text' && (
                <div
                    style={{ fontSize: block.style.fontSize, color: block.style.color }}
                    className="w-full h-full whitespace-pre-wrap p-4"
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
                <video
                    src={block.content}
                    controls
                    className="w-full h-full object-cover"
                />
            )}
        </motion.div>
    )
}
