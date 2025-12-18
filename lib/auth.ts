import { cookies } from 'next/headers'
import { prisma } from './db'
import bcrypt from 'bcryptjs'

const SESSION_COOKIE_NAME = 'session'

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function createSession(userId: string): Promise<string> {
  const sessionId = `${userId}:${Date.now()}:${Math.random().toString(36).substring(2)}`
  const encoded = Buffer.from(sessionId).toString('base64')
  return encoded
}

export async function getSession(): Promise<{ userId: string } | null> {
  const cookieStore = await cookies()
  const sessionCookie = cookieStore.get(SESSION_COOKIE_NAME)

  if (!sessionCookie) {
    return null
  }

  try {
    const decoded = Buffer.from(sessionCookie.value, 'base64').toString()
    const [userId] = decoded.split(':')

    const user = await prisma.user.findUnique({
      where: { id: userId }
    })

    if (!user) {
      return null
    }

    return { userId }
  } catch {
    return null
  }
}

export async function getCurrentUser() {
  const session = await getSession()

  if (!session) {
    return null
  }

  const user = await prisma.user.findUnique({
    where: { id: session.userId },
    select: {
      id: true,
      username: true,
      isAdmin: true,
      createdAt: true,
    }
  })

  return user
}

export async function setSessionCookie(sessionId: string) {
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE_NAME, sessionId, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    maxAge: 60 * 60 * 24 * 7, // 7 days
    path: '/',
  })
}

export async function clearSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE_NAME)
}
