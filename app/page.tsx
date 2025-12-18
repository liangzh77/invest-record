import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import Header from '@/components/Header'
import RecordList from '@/components/RecordList'

export default async function HomePage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  if (user.isAdmin) {
    redirect('/admin')
  }

  return (
    <div className="min-h-screen bg-google-light-gray">
      <Header username={user.username} />
      <main className="py-6 px-4">
        <RecordList />
      </main>
    </div>
  )
}
