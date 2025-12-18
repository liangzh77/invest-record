'use client'

import { useState, useEffect } from 'react'

interface User {
  id: string
  username: string
  createdAt: string
  _count: {
    records: number
  }
}

export default function UserList() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [resetUserId, setResetUserId] = useState<string | null>(null)
  const [newPassword, setNewPassword] = useState('')
  const [message, setMessage] = useState({ type: '', text: '' })

  const fetchUsers = async () => {
    try {
      const res = await fetch('/api/admin/users')
      const data = await res.json()
      if (res.ok) {
        setUsers(data.users)
      }
    } catch (error) {
      console.error('Failed to fetch users:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchUsers()
  }, [])

  const handleResetPassword = async (userId: string) => {
    if (!newPassword || newPassword.length < 6) {
      setMessage({ type: 'error', text: '新密码至少6个字符' })
      return
    }

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ newPassword }),
      })

      if (res.ok) {
        setMessage({ type: 'success', text: '密码重置成功' })
        setResetUserId(null)
        setNewPassword('')
      } else {
        const data = await res.json()
        setMessage({ type: 'error', text: data.error || '重置密码失败' })
      }
    } catch {
      setMessage({ type: 'error', text: '重置密码失败' })
    }

    setTimeout(() => setMessage({ type: '', text: '' }), 3000)
  }

  const handleDeleteUser = async (userId: string, username: string) => {
    if (!confirm(`确定要删除用户 "${username}" 吗？此操作不可恢复。`)) {
      return
    }

    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
      })

      if (res.ok) {
        setUsers(users.filter((u) => u.id !== userId))
        setMessage({ type: 'success', text: '用户已删除' })
      } else {
        const data = await res.json()
        setMessage({ type: 'error', text: data.error || '删除用户失败' })
      }
    } catch {
      setMessage({ type: 'error', text: '删除用户失败' })
    }

    setTimeout(() => setMessage({ type: '', text: '' }), 3000)
  }

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('zh-CN')
  }

  if (loading) {
    return (
      <div className="text-center py-12 text-google-gray">
        加载中...
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <h1 className="text-xl font-normal text-gray-700 mb-6">用户管理</h1>

      {message.text && (
        <div
          className={`mb-4 p-3 rounded-md text-sm ${
            message.type === 'success'
              ? 'bg-green-50 border border-green-200 text-green-600'
              : 'bg-red-50 border border-red-200 text-red-600'
          }`}
        >
          {message.text}
        </div>
      )}

      {users.length === 0 ? (
        <div className="text-center py-12 text-google-gray bg-white rounded-lg shadow-sm border border-gray-200">
          暂无普通用户
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border border-gray-200">
          <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
            <div className="grid grid-cols-12 gap-4 text-sm font-medium text-google-gray">
              <div className="col-span-3">用户名</div>
              <div className="col-span-2">注册时间</div>
              <div className="col-span-2">记录数</div>
              <div className="col-span-5">操作</div>
            </div>
          </div>

          {users.map((user) => (
            <div
              key={user.id}
              className="px-4 py-3 border-b border-gray-100 hover:bg-gray-50"
            >
              <div className="grid grid-cols-12 gap-4 items-center text-sm">
                <div className="col-span-3 text-gray-700">{user.username}</div>
                <div className="col-span-2 text-google-gray">
                  {formatDate(user.createdAt)}
                </div>
                <div className="col-span-2 text-google-gray">
                  {user._count.records}
                </div>
                <div className="col-span-5 flex items-center gap-2">
                  {resetUserId === user.id ? (
                    <>
                      <input
                        type="password"
                        value={newPassword}
                        onChange={(e) => setNewPassword(e.target.value)}
                        placeholder="新密码（至少6位）"
                        className="flex-1 px-2 py-1 border border-gray-300 rounded text-sm focus:border-google-blue focus:ring-1 focus:ring-google-blue"
                      />
                      <button
                        onClick={() => handleResetPassword(user.id)}
                        className="px-3 py-1 bg-google-blue text-white rounded text-sm hover:bg-google-blue-hover"
                      >
                        确定
                      </button>
                      <button
                        onClick={() => {
                          setResetUserId(null)
                          setNewPassword('')
                        }}
                        className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100"
                      >
                        取消
                      </button>
                    </>
                  ) : (
                    <>
                      <button
                        onClick={() => setResetUserId(user.id)}
                        className="px-3 py-1 border border-gray-300 rounded text-sm hover:bg-gray-100 text-google-gray"
                      >
                        重置密码
                      </button>
                      <button
                        onClick={() => handleDeleteUser(user.id, user.username)}
                        className="px-3 py-1 border border-red-300 rounded text-sm hover:bg-red-50 text-google-red"
                      >
                        删除
                      </button>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
