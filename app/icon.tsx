
import { ImageResponse } from 'next/og'

export const runtime = 'edge'
export const size = {
    width: 32,
    height: 32,
}
export const contentType = 'image/png'

export default function Icon() {
    return new ImageResponse(
        (
            <div
                style={{
                    fontSize: 24,
                    background: 'transparent',
                    width: '100%',
                    height: '100%',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    color: 'white',
                    // Using a similar style to the Comfortaa font if possible, or sans-serif
                    fontFamily: 'sans-serif',
                    fontWeight: 800,
                }}
            >
                <div style={{
                    background: 'linear-gradient(to bottom right, #2563eb, #9333ea)', // blue-600 to purple-600
                    backgroundClip: 'text',
                    color: 'transparent',
                    fontSize: 28,
                    fontWeight: 900,
                    marginTop: -4
                }}>
                    A
                </div>
            </div>
        ),
        {
            ...size,
        }
    )
}
