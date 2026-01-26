'use client'

import { useState, useRef, useEffect } from 'react'

interface Record {
  id: string
  date: string
  name: string
  direction: string
  price: string
  period: string
  source: string
  logic: string
  status: 'pending' | 'green' | 'red'
  tradeStatus: 'none' | 'trading' | 'profit' | 'loss'
  createdAt: string
}

type EditableField = 'date' | 'name' | 'direction' | 'price' | 'period' | 'source' | 'logic'

interface RecordItemProps {
  record: Record
  onUpdate: (id: string, data: Partial<Record>) => void
  onDelete: (id: string) => void
}

export default function RecordItem({ record, onUpdate, onDelete }: RecordItemProps) {
  const [editingField, setEditingField] = useState<EditableField | null>(null)
  const [editValue, setEditValue] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)
  const menuRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (editingField && inputRef.current) {
      inputRef.current.focus()
    }
  }, [editingField])

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  const startEditing = (field: EditableField) => {
    setEditingField(field)
    setEditValue(record[field])
  }

  const finishEditing = () => {
    if (editingField && editValue.trim()) {
      if (editValue !== record[editingField]) {
        onUpdate(record.id, { [editingField]: editValue })
      }
    }
    setEditingField(null)
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      finishEditing()
    }
    if (e.key === 'Escape') {
      setEditingField(null)
    }
  }

  const handleMenuAction = (action: string) => {
    setMenuOpen(false)
    switch (action) {
      case 'source-pending':
        onUpdate(record.id, { status: 'pending' })
        break
      case 'source-profit':
        onUpdate(record.id, { status: 'green' })
        break
      case 'source-loss':
        onUpdate(record.id, { status: 'red' })
        break
      case 'trade-trading':
        onUpdate(record.id, { tradeStatus: 'trading' })
        break
      case 'trade-profit':
        onUpdate(record.id, { tradeStatus: 'profit' })
        break
      case 'trade-loss':
        onUpdate(record.id, { tradeStatus: 'loss' })
        break
      case 'delete':
        onDelete(record.id)
        break
    }
  }

  const renderEditableField = (field: EditableField, value: string, className: string, isDate = false) => {
    if (editingField === field) {
      return (
        <input
          ref={inputRef as React.RefObject<HTMLInputElement>}
          type={isDate ? 'date' : 'text'}
          value={editValue}
          onChange={(e) => setEditValue(e.target.value)}
          onBlur={finishEditing}
          onKeyDown={handleKeyDown}
          className={`px-2 py-1 border border-google-blue rounded text-sm ${isDate ? 'w-36' : 'w-full'}`}
        />
      )
    }
    return (
      <span
        onClick={() => startEditing(field)}
        className={`inline-edit ${className}`}
      >
        {value || '-'}
      </span>
    )
  }

  const getSourceStatusBadge = () => {
    switch (record.status) {
      case 'green':
        return <span className="px-1.5 py-0.5 text-xs rounded bg-green-100 text-google-green">盈</span>
      case 'red':
        return <span className="px-1.5 py-0.5 text-xs rounded bg-red-100 text-google-red">亏</span>
      default:
        return <span className="px-1.5 py-0.5 text-xs rounded bg-gray-100 text-gray-500">-</span>
    }
  }

  const getTradeStatusBadge = () => {
    switch (record.tradeStatus) {
      case 'trading':
        return <span className="px-1.5 py-0.5 text-xs rounded bg-blue-100 text-google-blue">中</span>
      case 'profit':
        return <span className="px-1.5 py-0.5 text-xs rounded bg-green-100 text-google-green">盈</span>
      case 'loss':
        return <span className="px-1.5 py-0.5 text-xs rounded bg-red-100 text-google-red">亏</span>
      default:
        return <span className="px-1.5 py-0.5 text-xs rounded bg-gray-100 text-gray-400">-</span>
    }
  }

  return (
    <div className="flex items-center gap-2 py-3 px-4 hover:bg-gray-50 group border-b border-gray-100">
      <div className="flex items-center gap-1 flex-shrink-0 w-14">
        {getSourceStatusBadge()}
        {getTradeStatusBadge()}
      </div>
      <div className="flex-1 flex items-center gap-2 min-w-0">
        <span className="w-24 flex-shrink-0">
          {renderEditableField('date', record.date, 'text-sm text-google-gray truncate block', true)}
        </span>
        <span className="w-[14%] flex-shrink-0">
          {renderEditableField('name', record.name, 'text-sm font-medium text-gray-800 truncate block')}
        </span>
        <span className="w-[5%] flex-shrink-0">
          {renderEditableField('direction', record.direction, 'text-sm text-gray-600 truncate block')}
        </span>
        <span className="w-[8%] flex-shrink-0">
          {renderEditableField('price', record.price, 'text-sm text-gray-600 truncate block')}
        </span>
        <span className="w-[7%] flex-shrink-0">
          {renderEditableField('period', record.period, 'text-sm text-gray-500 truncate block')}
        </span>
        <span className="w-[10%] flex-shrink-0">
          {renderEditableField('source', record.source, 'text-sm text-gray-500 truncate block')}
        </span>
        <span className="flex-1 min-w-0">
          {renderEditableField('logic', record.logic, 'text-sm text-gray-500 truncate block')}
        </span>
      </div>

      <div className="relative flex-shrink-0" ref={menuRef}>
        <button
          onClick={() => setMenuOpen(!menuOpen)}
          className="p-1.5 rounded-full hover:bg-gray-100 transition-colors"
          title="操作菜单"
        >
          <svg className="w-5 h-5 text-gray-400 hover:text-gray-600" fill="currentColor" viewBox="0 0 20 20">
            <circle cx="10" cy="4" r="2" />
            <circle cx="10" cy="10" r="2" />
            <circle cx="10" cy="16" r="2" />
          </svg>
        </button>
        {menuOpen && (
          <div className="absolute right-0 top-full mt-1 w-40 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-10">
            <button
              onClick={() => handleMenuAction('source-pending')}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 text-gray-700"
            >
              信源 → 进行中
            </button>
            <button
              onClick={() => handleMenuAction('source-profit')}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 text-google-green"
            >
              信源 → 盈利
            </button>
            <button
              onClick={() => handleMenuAction('source-loss')}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 text-google-red"
            >
              信源 → 亏损
            </button>
            <div className="border-t border-gray-100 my-1"></div>
            <button
              onClick={() => handleMenuAction('trade-trading')}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 text-gray-700"
            >
              交易 → 进行中
            </button>
            <button
              onClick={() => handleMenuAction('trade-profit')}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 text-google-green"
            >
              交易 → 盈利
            </button>
            <button
              onClick={() => handleMenuAction('trade-loss')}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 text-google-red"
            >
              交易 → 亏损
            </button>
            <div className="border-t border-gray-100 my-1"></div>
            <button
              onClick={() => handleMenuAction('delete')}
              className="w-full px-4 py-2 text-left text-sm hover:bg-gray-100 text-gray-400"
            >
              删除
            </button>
          </div>
        )}
      </div>
    </div>
  )
}
