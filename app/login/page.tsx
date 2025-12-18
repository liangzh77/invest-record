'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function LoginPage() {
  const router = useRouter()
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const res = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || '登录失败')
        return
      }

      if (data.user.isAdmin) {
        router.push('/admin')
      } else {
        router.push('/')
      }
      router.refresh()
    } catch {
      setError('登录失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-google-light-gray">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-normal text-center mb-8 text-gray-700">
          登录
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-google-gray mb-1">用户名</label>
            <input
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-google-blue focus:ring-1 focus:ring-google-blue"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-google-gray mb-1">密码</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-google-blue focus:ring-1 focus:ring-google-blue"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-google-blue text-white rounded-md hover:bg-google-blue-hover disabled:opacity-50 transition-colors"
          >
            {loading ? '登录中...' : '登录'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-google-gray">
          没有账号？{' '}
          <Link href="/register" className="text-google-blue hover:underline">
            注册
          </Link>
        </p>
      </div>
    </div>
  )
}
