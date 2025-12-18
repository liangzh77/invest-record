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

    if (!user.isAdmin) {
      return NextResponse.json(
        { error: '需要管理员权限' },
        { status: 403 }
      )
    }

    const users = await prisma.user.findMany({
      where: { isAdmin: false },
      select: {
        id: true,
        username: true,
        createdAt: true,
        _count: {
          select: { records: true }
        }
      },
      orderBy: { createdAt: 'desc' },
    })

    return NextResponse.json({ users })
  } catch (error) {
    console.error('Get users error:', error)
    return NextResponse.json(
      { error: '获取用户列表失败' },
      { status: 500 }
    )
  }
}
