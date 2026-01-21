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
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  useEffect(() => {
    if (editingField && inputRef.current) {
      inputRef.current.focus()
    }
  }, [editingField])

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

  const handleStatusChange = (newStatus: 'green' | 'red') => {
    onUpdate(record.id, { status: newStatus })
  }

  const isPending = record.status === 'pending'

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

  return (
    <div className="flex items-center gap-2 py-3 px-4 hover:bg-gray-50 group border-b border-gray-100">
      {!isPending && (
        <div
          className={`w-3 h-3 rounded-full flex-shrink-0 ${
            record.status === 'green' ? 'bg-google-green' : 'bg-google-red'
          }`}
        />
      )}

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

      <div className="flex items-center gap-2 flex-shrink-0">
        {isPending ? (
          <>
            <button
              onClick={() => handleStatusChange('green')}
              className="w-6 h-6 rounded-full bg-google-green hover:bg-green-600 transition-colors"
              title="标记为绿色完成"
            />
            <button
              onClick={() => handleStatusChange('red')}
              className="w-6 h-6 rounded-full bg-google-red hover:bg-red-600 transition-colors"
              title="标记为红色完成"
            />
          </>
        ) : (
          <button
            onClick={() => onUpdate(record.id, { status: 'pending' })}
            className="text-xs px-2 py-1 border border-gray-300 rounded hover:bg-gray-100 text-google-gray transition-colors"
            title="恢复到进行中"
          >
            恢复
          </button>
        )}
        <button
          onClick={() => onDelete(record.id)}
          className="text-gray-400 hover:text-google-red opacity-0 group-hover:opacity-100 transition-opacity text-lg px-1"
          title="删除"
        >
          ×
        </button>
      </div>
    </div>
  )
}
