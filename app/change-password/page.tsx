'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import Link from 'next/link'

export default function ChangePasswordPage() {
  const router = useRouter()
  const [oldPassword, setOldPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [error, setError] = useState('')
  const [success, setSuccess] = useState('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetch('/api/auth/me')
      .then(res => {
        if (!res.ok) {
          router.push('/login')
        }
      })
  }, [router])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess('')

    if (newPassword !== confirmPassword) {
      setError('两次输入的新密码不一致')
      return
    }

    setLoading(true)

    try {
      const res = await fetch('/api/auth/change-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ oldPassword, newPassword }),
      })

      const data = await res.json()

      if (!res.ok) {
        setError(data.error || '修改密码失败')
        return
      }

      setSuccess('密码修改成功')
      setOldPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch {
      setError('修改密码失败，请重试')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-google-light-gray">
      <div className="bg-white p-8 rounded-lg shadow-md w-full max-w-md">
        <h1 className="text-2xl font-normal text-center mb-8 text-gray-700">
          修改密码
        </h1>

        {error && (
          <div className="mb-4 p-3 bg-red-50 border border-red-200 text-red-600 rounded-md text-sm">
            {error}
          </div>
        )}

        {success && (
          <div className="mb-4 p-3 bg-green-50 border border-green-200 text-green-600 rounded-md text-sm">
            {success}
          </div>
        )}

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm text-google-gray mb-1">旧密码</label>
            <input
              type="password"
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-google-blue focus:ring-1 focus:ring-google-blue"
              required
            />
          </div>

          <div>
            <label className="block text-sm text-google-gray mb-1">新密码</label>
            <input
              type="password"
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-google-blue focus:ring-1 focus:ring-google-blue"
              required
              minLength={6}
            />
            <p className="text-xs text-gray-400 mt-1">至少6个字符</p>
          </div>

          <div>
            <label className="block text-sm text-google-gray mb-1">确认新密码</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:border-google-blue focus:ring-1 focus:ring-google-blue"
              required
            />
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-google-blue text-white rounded-md hover:bg-google-blue-hover disabled:opacity-50 transition-colors"
          >
            {loading ? '修改中...' : '修改密码'}
          </button>
        </form>

        <p className="mt-6 text-center text-sm text-google-gray">
          <Link href="/" className="text-google-blue hover:underline">
            返回首页
          </Link>
        </p>
      </div>
    </div>
  )
}
