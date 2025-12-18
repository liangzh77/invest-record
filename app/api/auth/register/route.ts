import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'
import { hashPassword, createSession, setSessionCookie } from '@/lib/auth'

export async function POST(request: Request) {
  try {
    const { username, password } = await request.json()

    if (!username || !password) {
      return NextResponse.json(
        { error: '用户名和密码不能为空' },
        { status: 400 }
      )
    }

    if (username.length < 3) {
      return NextResponse.json(
        { error: '用户名至少3个字符' },
        { status: 400 }
      )
    }

    if (password.length < 6) {
      return NextResponse.json(
        { error: '密码至少6个字符' },
        { status: 400 }
      )
    }

    const existingUser = await prisma.user.findUnique({
      where: { username }
    })

    if (existingUser) {
      return NextResponse.json(
        { error: '用户名已存在' },
        { status: 400 }
      )
    }

    const hashedPassword = await hashPassword(password)

    const user = await prisma.user.create({
      data: {
        username,
        password: hashedPassword,
        isAdmin: false,
      }
    })

    const sessionId = await createSession(user.id)
    await setSessionCookie(sessionId)

    return NextResponse.json({
      user: {
        id: user.id,
        username: user.username,
        isAdmin: user.isAdmin,
      }
    })
  } catch (error) {
    console.error('Register error:', error)
    return NextResponse.json(
      { error: '注册失败' },
      { status: 500 }
    )
  }
}
