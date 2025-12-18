import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser } from '@/lib/auth'

export async function GET() {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      )
    }

    if (user.isAdmin) {
      return NextResponse.json(
        { error: '管理员无法查看记录' },
        { status: 403 }
      )
    }

    const records = await prisma.record.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ records })
  } catch (error) {
    console.error('Get records error:', error)
    return NextResponse.json(
      { error: '获取记录失败' },
      { status: 500 }
    )
  }
}

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      )
    }

    if (user.isAdmin) {
      return NextResponse.json(
        { error: '管理员无法创建记录' },
        { status: 403 }
      )
    }

    const { date, content } = await request.json()

    if (!date || !content) {
      return NextResponse.json(
        { error: '日期和内容不能为空' },
        { status: 400 }
      )
    }

    const record = await prisma.record.create({
      data: {
        date,
        content,
        status: 'pending',
        userId: user.id,
      }
    })

    return NextResponse.json({ record })
  } catch (error) {
    console.error('Create record error:', error)
    return NextResponse.json(
      { error: '创建记录失败' },
      { status: 500 }
    )
  }
}
