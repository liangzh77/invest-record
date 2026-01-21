import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      )
    }

    const { id } = await params
    const body = await request.json()

    const existingRecord = await prisma.record.findUnique({
      where: { id }
    })

    if (!existingRecord) {
      return NextResponse.json(
        { error: '记录不存在' },
        { status: 404 }
      )
    }

    if (existingRecord.userId !== user.id) {
      return NextResponse.json(
        { error: '无权修改此记录' },
        { status: 403 }
      )
    }

    const updateData: {
      date?: string
      name?: string
      direction?: string
      price?: string
      period?: string
      source?: string
      logic?: string
      status?: string
    } = {}

    if (body.date !== undefined) {
      updateData.date = body.date
    }
    if (body.name !== undefined) {
      updateData.name = body.name
    }
    if (body.direction !== undefined) {
      updateData.direction = body.direction
    }
    if (body.price !== undefined) {
      updateData.price = body.price
    }
    if (body.period !== undefined) {
      updateData.period = body.period
    }
    if (body.source !== undefined) {
      updateData.source = body.source
    }
    if (body.logic !== undefined) {
      updateData.logic = body.logic
    }
    if (body.status !== undefined) {
      if (!['pending', 'green', 'red'].includes(body.status)) {
        return NextResponse.json(
          { error: '无效的状态值' },
          { status: 400 }
        )
      }
      updateData.status = body.status
    }

    const record = await prisma.record.update({
      where: { id },
      data: updateData,
    })

    return NextResponse.json({ record })
  } catch (error) {
    console.error('Update record error:', error)
    return NextResponse.json(
      { error: '更新记录失败' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      )
    }

    const { id } = await params

    const existingRecord = await prisma.record.findUnique({
      where: { id }
    })

    if (!existingRecord) {
      return NextResponse.json(
        { error: '记录不存在' },
        { status: 404 }
      )
    }

    if (existingRecord.userId !== user.id) {
      return NextResponse.json(
        { error: '无权删除此记录' },
        { status: 403 }
      )
    }

    await prisma.record.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete record error:', error)
    return NextResponse.json(
      { error: '删除记录失败' },
      { status: 500 }
    )
  }
}
