import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser, hashPassword } from '@/lib/auth'

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

    if (!user.isAdmin) {
      return NextResponse.json(
        { error: '需要管理员权限' },
        { status: 403 }
      )
    }

    const { id } = await params
    const { newPassword } = await request.json()

    if (!newPassword || newPassword.length < 6) {
      return NextResponse.json(
        { error: '新密码至少6个字符' },
        { status: 400 }
      )
    }

    const targetUser = await prisma.user.findUnique({
      where: { id }
    })

    if (!targetUser) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      )
    }

    if (targetUser.isAdmin) {
      return NextResponse.json(
        { error: '无法修改管理员密码' },
        { status: 403 }
      )
    }

    const hashedPassword = await hashPassword(newPassword)

    await prisma.user.update({
      where: { id },
      data: { password: hashedPassword }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Reset password error:', error)
    return NextResponse.json(
      { error: '重置密码失败' },
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

    if (!user.isAdmin) {
      return NextResponse.json(
        { error: '需要管理员权限' },
        { status: 403 }
      )
    }

    const { id } = await params

    const targetUser = await prisma.user.findUnique({
      where: { id }
    })

    if (!targetUser) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      )
    }

    if (targetUser.isAdmin) {
      return NextResponse.json(
        { error: '无法删除管理员' },
        { status: 403 }
      )
    }

    await prisma.user.delete({
      where: { id }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Delete user error:', error)
    return NextResponse.json(
      { error: '删除用户失败' },
      { status: 500 }
    )
  }
}
