'use client'

import { useState, useEffect } from 'react'
import RecordItem from './RecordItem'

interface Record {
  id: string
  date: string
  name: string      // 名称
  direction: string // 方向
  price: string     // 价格
  period: string    // 时段
  source: string    // 信源
  logic: string     // 逻辑
  status: 'pending' | 'green' | 'red'
  tradeStatus: 'none' | 'trading' | 'profit' | 'loss'
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
  const [newName, setNewName] = useState('')
  const [newDirection, setNewDirection] = useState('')
  const [newPrice, setNewPrice] = useState('')
  const [newPeriod, setNewPeriod] = useState('')
  const [newSource, setNewSource] = useState('')
  const [newLogic, setNewLogic] = useState('')
  const [adding, setAdding] = useState(false)
  const [selectedSource, setSelectedSource] = useState<string | null>(null)
  const [tradeMode, setTradeMode] = useState(false)

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
    if (!newName.trim()) return

    setAdding(true)
    try {
      const res = await fetch('/api/records', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          date: newDate,
          name: newName,
          direction: newDirection,
          price: newPrice,
          period: newPeriod,
          source: newSource,
          logic: newLogic,
        }),
      })
      const data = await res.json()
      if (res.ok) {
        const newRecords = [data.record, ...records].sort((a, b) => {
          if (a.date !== b.date) return b.date.localeCompare(a.date)
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
        })
        setRecords(newRecords)
        setNewName('')
        setNewDirection('')
        setNewPrice('')
        setNewPeriod('')
        setNewSource('')
        setNewLogic('')
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
        const updatedRecords = records.map((r) => (r.id === id ? data.record : r))
          .sort((a, b) => {
            if (a.date !== b.date) return b.date.localeCompare(a.date)
            return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
          })
        setRecords(updatedRecords)
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

  // 获取所有不重复的信源（支持用"|"分隔多个信源）
  const allSources = Array.from(new Set(
    records.flatMap(r => r.source.split('|').map(s => s.trim()).filter(s => s !== ''))
  ))

  // 基础筛选：信源筛选和搜索筛选
  const baseFilteredRecords = records.filter((r) => {
    // 信源筛选（支持用"|"分隔多个信源）
    if (selectedSource) {
      const recordSources = r.source.split('|').map(s => s.trim())
      if (!recordSources.includes(selectedSource)) return false
    }
    // 搜索筛选
    if (searchQuery === '') return true
    const query = searchQuery.toLowerCase()
    return (
      r.name.toLowerCase().includes(query) ||
      r.direction.toLowerCase().includes(query) ||
      r.price.toLowerCase().includes(query) ||
      r.period.toLowerCase().includes(query) ||
      r.source.toLowerCase().includes(query) ||
      r.logic.toLowerCase().includes(query) ||
      r.date.includes(searchQuery)
    )
  })

  // 根据模式筛选并分组
  let topRecords: Record[] = []
  let bottomRecords: Record[] = []
  let topLabel = ''
  let bottomLabel = ''

  if (tradeMode) {
    // 交易模式：不显示未交易的(none)
    const tradingRecords = baseFilteredRecords.filter(r => r.tradeStatus !== 'none')
    topRecords = tradingRecords.filter(r => r.tradeStatus === 'trading')
    bottomRecords = tradingRecords.filter(r => r.tradeStatus === 'profit' || r.tradeStatus === 'loss')
    topLabel = '交易进行中'
    bottomLabel = '交易完成'
  } else {
    // 信源模式：显示所有记录
    topRecords = baseFilteredRecords.filter(r => r.status === 'pending')
    bottomRecords = baseFilteredRecords.filter(r => r.status !== 'pending')
    topLabel = '信源进行中'
    bottomLabel = '信源完成'
  }

  if (loading) {
    return (
      <div className="text-center py-12 text-google-gray">
        加载中...
      </div>
    )
  }

  return (
    <div className="max-w-6xl mx-auto">
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
        <div className="flex items-center gap-2">
          <span className="w-24 flex-shrink-0">
            <input
              type="date"
              value={newDate}
              onChange={(e) => setNewDate(e.target.value)}
              className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:border-google-blue focus:ring-1 focus:ring-google-blue text-sm"
            />
          </span>
          <span className="w-[14%] flex-shrink-0">
            <input
              type="text"
              value={newName}
              onChange={(e) => setNewName(e.target.value)}
              placeholder="名称"
              className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:border-google-blue focus:ring-1 focus:ring-google-blue text-sm"
            />
          </span>
          <span className="w-[5%] flex-shrink-0">
            <input
              type="text"
              value={newDirection}
              onChange={(e) => setNewDirection(e.target.value)}
              placeholder="方向"
              className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:border-google-blue focus:ring-1 focus:ring-google-blue text-sm"
            />
          </span>
          <span className="w-[8%] flex-shrink-0">
            <input
              type="text"
              value={newPrice}
              onChange={(e) => setNewPrice(e.target.value)}
              placeholder="价格"
              className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:border-google-blue focus:ring-1 focus:ring-google-blue text-sm"
            />
          </span>
          <span className="w-[7%] flex-shrink-0">
            <input
              type="text"
              value={newPeriod}
              onChange={(e) => setNewPeriod(e.target.value)}
              placeholder="时段"
              className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:border-google-blue focus:ring-1 focus:ring-google-blue text-sm"
            />
          </span>
          <span className="w-[10%] flex-shrink-0">
            <input
              type="text"
              value={newSource}
              onChange={(e) => setNewSource(e.target.value)}
              placeholder="信源"
              className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:border-google-blue focus:ring-1 focus:ring-google-blue text-sm"
            />
          </span>
          <span className="flex-1 min-w-0">
            <input
              type="text"
              value={newLogic}
              onChange={(e) => setNewLogic(e.target.value)}
              placeholder="逻辑"
              className="w-full px-2 py-1.5 border border-gray-300 rounded-md focus:border-google-blue focus:ring-1 focus:ring-google-blue text-sm"
            />
          </span>
          <button
            type="submit"
            disabled={adding || !newName.trim()}
            className="px-4 py-1.5 bg-google-blue text-white rounded-md hover:bg-google-blue-hover disabled:opacity-50 transition-colors text-sm flex-shrink-0"
          >
            {adding ? '...' : '添加'}
          </button>
        </div>
      </form>

      {allSources.length > 0 && (
        <div className="mb-4 flex items-center gap-2 flex-wrap">
          <span className="text-sm text-gray-500 mr-2">信源:</span>
          <button
            onClick={() => setSelectedSource(null)}
            className={`px-3 py-1 text-sm rounded-full transition-colors ${
              selectedSource === null
                ? 'bg-google-blue text-white'
                : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'
            }`}
          >
            全部
          </button>
          {allSources.map((source) => (
            <button
              key={source}
              onClick={() => setSelectedSource(selectedSource === source ? null : source)}
              className={`px-3 py-1 text-sm rounded-full transition-colors ${
                selectedSource === source
                  ? 'bg-google-blue text-white'
                  : 'bg-gray-100 text-gray-400 hover:bg-gray-200 hover:text-gray-600'
              }`}
            >
              {source}
            </button>
          ))}
          <div className="flex-1"></div>
          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-500">交易</span>
            <button
              onClick={() => setTradeMode(!tradeMode)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                tradeMode ? 'bg-google-blue' : 'bg-gray-300'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  tradeMode ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
          </div>
        </div>
      )}

      {records.length === 0 ? (
        <div className="text-center py-12 text-google-gray">
          暂无记录，添加第一条吧
        </div>
      ) : (topRecords.length === 0 && bottomRecords.length === 0) ? (
        <div className="text-center py-12 text-google-gray">
          没有找到匹配的记录
        </div>
      ) : (
        <>
          {topRecords.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 mb-6">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <h2 className="text-sm font-medium text-google-gray">
                  {topLabel} ({topRecords.length})
                </h2>
              </div>
              <div>
                {topRecords.map((record) => (
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

          {bottomRecords.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="px-4 py-3 border-b border-gray-200 bg-gray-50">
                <h2 className="text-sm font-medium text-google-gray">
                  {bottomLabel} ({bottomRecords.length})
                </h2>
              </div>
              <div>
                {bottomRecords.map((record) => (
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
