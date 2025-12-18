import type { Metadata } from 'next'
import './globals.css'

export const metadata: Metadata = {
  title: '投资记录',
  description: '简单的投资记录管理应用',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="zh-CN">
      <body className="min-h-screen bg-white">
        {children}
      </body>
    </html>
  )
}
