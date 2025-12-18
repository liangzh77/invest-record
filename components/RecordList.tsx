'use client'

import { useState, useEffect } from 'react'
import RecordItem from './RecordItem'

interface Record {
  id: string
  date: string
  content: string
  status: 'pending' | 'green' | 'red'
  createdAt: string
}

export default function RecordList() {
  const [records, setRecords] = useState<Record[]>([])
  const [loading, setLoading] = useState(true)
  const [searchQuery, setSearchQuery] = useState('')
  const [newDate, setNewDate] = useState(() => {
    const today = new Date()
    return today.toISOString().split('T')[0]
  })
  const [newContent, setNewContent] = useState('')
  const [adding, setAdding] = useState(false)

  const fetchRecords = async () => {
    try {
      const res = await fetch('/api/records')
      const data = await res.json()
      if (res.ok) {
        setRecords(data.records)
      }
    } catch (error) {
      console.error('Failed to fetch records:', error)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchRecords()
  }, [])

  const handleAdd = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!newContent.trim()) return

    setAdding(true)
    try {
      const res = await fetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ date: newDate, content: newContent }),
      })
      const data = await res.json()
      if (res.ok) {
        setRecords([data.record, ...records])
        setNewContent('')
      }
    } catch (error) {
      console.error('Failed to add record:', error)
    } finally {
      setAdding(false)
    }
  }

  const handleUpdate = async (id: string, updateData: Partial<Record>) => {
    try {
      const res = await fetch(`/api/records/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updateData),
      })
      const data = await res.json()
      if (res.ok) {
        setRecords(records.map((r) => (r.id === id ? data.record : r)))
      }
    } catch (error) {
      console.error('Failed to update record:', error)
    }
  }

  const handleDelete = async (id: string) => {
    try {
      const res = await fetch(`/api/records/${id}`, {
        method: 'DELETE',
      })
      if (res.ok) {
        setRecords(records.filter((r) => r.id !== id))
      }
    } catch (error) {
      console.error('Failed to delete record:', error)
    }
  }

  const filteredRecords = records.filter((r) =>
    searchQuery === '' ||
    r.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    r.date.includes(searchQuery)
  )
  const pendingRecords = filteredRecords.filter((r) => r.status === 'pending')
  const completedRecords = filteredRecords.filter((r) => r.status !== 'pending')

  if (loading) {
    return (
      <div className="text-center py-12 text-google-gray">
        加载中...
      </div>
    )
  }

  return (
    <div className="max-w-4xl mx-auto">
      <div className="mb-4">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="搜索记录..."
          className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:border-google-blue focus:ring-1 focus:ring-google-blue text-sm bg-white"
        />
      </div>

      <form onSubmit={handleAdd} className="mb-8 bg-white rounded-lg shadow-sm border border-gray-200 p-4">
        <div className="flex gap-3">
          <input
            type="date"
            value={newDate}
            onChange={(e) => setNewDate(e.target.value)}
            className="px-3 py-2 border border-gray-300 rounded-md focus:border-google-blue focus:ring-1 focus:ring-google-blue text-sm"
          />
          <input
            type="text"
            value={newContent}
            onChange={(e) => setNewContent(e.target.value)}
            placeholder="输入记录内容..."
            className="flex-1 px-3 py-2 border border-gray-300 rounded-md focus:border-google-blue focus:ring-1 focus:ring-google-blue text-sm"
          />
          <button
            type="submit"
            disabled={adding || !newContent.trim()}
            className="px-4 py-2 bg-google-blue text-white rounded-md hover:bg-google-blue-hover disabled:opacity-50 transition-colors text-sm"
          >
            {adding ? '添加中...' : '添加'}
          </button>
        </div>
      </form>

      {records.length === 0 ? (
        <div className="text-center py-12 text-google-gray">
          暂无记录，添加第一条吧
        </div>
      ) : filteredRecords.length === 0 ? (
        <div className="text-center py-12 text-google-gray">
          没有找到匹配的记录
        </div>
      ) : (
        <>
          {pendingRecords.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <h2 className="text-sm font-medium text-google-gray">
                  进行中 ({pendingRecords.length})
                </h2>
              </div>
              <div>
                {pendingRecords.map((record) => (
                  <RecordItem
                    key={record.id}
                    record={record}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )}

          {completedRecords.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <h2 className="text-sm font-medium text-google-gray">
                  已完成 ({completedRecords.length})
                </h2>
              </div>
              <div>
                {completedRecords.map((record) => (
                  <RecordItem
                    key={record.id}
                    record={record}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                  />
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
