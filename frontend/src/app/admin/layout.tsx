'use client'

import { useUser } from '@/features/auth/provider/user-provider'
import { Sidebar } from '@/widgets/admin-sidebar/admin-sidebar'
import { motion } from 'framer-motion'
import { useEffect, useState } from 'react'

export default function AdminLayout({
  children
}: {
  children: React.ReactNode
}) {
  const { user } = useUser()
  const [isSidebarOpen, setIsSidebarOpen] = useState(true)
  const [isMobile, setIsMobile] = useState(false)

  useEffect(() => {
    const checkMobile = () => setIsMobile(window.innerWidth < 768)
    checkMobile()
    window.addEventListener('resize', checkMobile)
    return () => window.removeEventListener('resize', checkMobile)
  }, [])

  if (user?.role !== 'ADMIN') return null

  return (
    <div className="flex h-screen ">
      <Sidebar
        isOpen={isSidebarOpen}
        isMobile={isMobile}
        onToggle={() => setIsSidebarOpen(!isSidebarOpen)}
      />

      <motion.div
        className="flex-1 overflow-x-hidden"
        transition={{ type: 'spring', stiffness: 300, damping: 30 }}
      >
        <main className="p-6 h-full overflow-y-auto">{children}</main>
      </motion.div>
    </div>
  )
}
