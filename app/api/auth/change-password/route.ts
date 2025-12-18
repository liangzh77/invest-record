import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { getCurrentUser, hashPassword, verifyPassword } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const user = await getCurrentUser()

    if (!user) {
      return NextResponse.json(
        { error: '请先登录' },
        { status: 401 }
      )
    }

    const { oldPassword, newPassword } = await request.json()

    if (!oldPassword || !newPassword) {
      return NextResponse.json(
        { error: '请填写旧密码和新密码' },
        { status: 400 }
      )
    }

    if (newPassword.length < 6) {
      return NextResponse.json(
        { error: '新密码至少6个字符' },
        { status: 400 }
      )
    }

    const fullUser = await prisma.user.findUnique({
      where: { id: user.id }
    })

    if (!fullUser) {
      return NextResponse.json(
        { error: '用户不存在' },
        { status: 404 }
      )
    }

    const isValid = await verifyPassword(oldPassword, fullUser.password)

    if (!isValid) {
      return NextResponse.json(
        { error: '旧密码错误' },
        { status: 401 }
      )
    }

    const hashedPassword = await hashPassword(newPassword)

    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedPassword }
    })

    return NextResponse.json({ success: true })
  } catch (error) {
    console.error('Change password error:', error)
    return NextResponse.json(
      { error: '修改密码失败' },
      { status: 500 }
    )
  }
}
