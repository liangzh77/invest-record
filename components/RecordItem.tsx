'use client'

import { useState, useRef, useEffect } from 'react'

interface Record {
  id: string
  date: string
  content: string
  status: 'pending' | 'green' | 'red'
  createdAt: string
}

interface RecordItemProps {
  record: Record
  onUpdate: (id: string, data: Partial<Record>) => void
  onDelete: (id: string) => void
}

export default function RecordItem({ record, onUpdate, onDelete }: RecordItemProps) {
  const [editingField, setEditingField] = useState<'date' | 'content' | null>(null)
  const [editValue, setEditValue] = useState('')
  const inputRef = useRef<HTMLInputElement | HTMLTextAreaElement>(null)

  useEffect(() => {
    if (editingField && inputRef.current) {
      inputRef.current.focus()
    }
  }, [editingField])

  const startEditing = (field: 'date' | 'content') => {
    setEditingField(field)
    setEditValue(field === 'date' ? record.date : record.content)
  }

  const finishEditing = () => {
    if (editingField && editValue.trim()) {
      if (editingField === 'date' && editValue !== record.date) {
        onUpdate(record.id, { date: editValue })
      } else if (editingField === 'content' && editValue !== record.content) {
        onUpdate(record.id, { content: editValue })
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

  return (
    <div className="flex items-center gap-3 py-3 px-4 hover:bg-gray-50 group border-b border-gray-100">
      {!isPending && (
        <div
          className={`w-3 h-3 rounded-full flex-shrink-0 ${
            record.status === 'green' ? 'bg-google-green' : 'bg-google-red'
          }`}
        />
      )}

      <div className="flex-1 flex items-center gap-4 min-w-0">
        {editingField === 'date' ? (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="date"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={finishEditing}
            onKeyDown={handleKeyDown}
            className="px-2 py-1 border border-google-blue rounded text-sm w-36"
          />
        ) : (
          <span
            onClick={() => startEditing('date')}
            className="inline-edit text-sm text-google-gray flex-shrink-0 w-28"
          >
            {record.date}
          </span>
        )}

        {editingField === 'content' ? (
          <input
            ref={inputRef as React.RefObject<HTMLInputElement>}
            type="text"
            value={editValue}
            onChange={(e) => setEditValue(e.target.value)}
            onBlur={finishEditing}
            onKeyDown={handleKeyDown}
            className="flex-1 px-2 py-1 border border-google-blue rounded text-sm"
          />
        ) : (
          <span
            onClick={() => startEditing('content')}
            className="inline-edit text-sm text-gray-700 flex-1 truncate"
          >
            {record.content}
          </span>
        )}
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
