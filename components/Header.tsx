'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'

interface HeaderProps {
  username: string
  isAdmin?: boolean
}

export default function Header({ username, isAdmin }: HeaderProps) {
  const router = useRouter()

  const handleLogout = async () => {
    await fetch('/api/auth/logout', { method: 'POST' })
    router.push('/login')
    router.refresh()
  }

  return (
    <header className="bg-white border-b border-gray-200 px-6 py-4">
      <div className="max-w-4xl mx-auto flex items-center justify-between">
        <Link href={isAdmin ? '/admin' : '/'} className="text-xl font-normal text-gray-700">
          {isAdmin ? '用户管理' : '投资记录'}
        </Link>

        <div className="flex items-center gap-4">
          <span className="text-sm text-google-gray">{username}</span>
          {!isAdmin && (
            <Link
              href="/change-password"
              className="text-sm text-google-blue hover:underline"
            >
              修改密码
            </Link>
          )}
          <button
            onClick={handleLogout}
            className="text-sm text-google-gray hover:text-gray-900"
          >
            退出
          </button>
        </div>
      </div>
    </header>
  )
}
