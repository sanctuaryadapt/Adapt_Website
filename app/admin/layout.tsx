import Link from 'next/link'
import { notFound } from 'next/navigation'
import AdminLayoutClient from '@/components/admin/AdminLayoutClient'

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    // Security Check: Only allow in Dev mode
    if (process.env.NODE_ENV !== 'development') {
        notFound()
    }

    return (
        <AdminLayoutClient>
            {children}
        </AdminLayoutClient>
    )
}
