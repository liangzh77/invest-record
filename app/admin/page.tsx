import { redirect } from 'next/navigation'
import { getCurrentUser } from '@/lib/auth'
import Header from '@/components/Header'
import UserList from '@/components/UserList'

export default async function AdminPage() {
  const user = await getCurrentUser()

  if (!user) {
    redirect('/login')
  }

  if (!user.isAdmin) {
    redirect('/')
  }

  return (
    <div className="min-h-screen bg-google-light-gray">
      <Header username={user.username} isAdmin />
      <main className="py-6 px-4">
        <UserList />
      </main>
    </div>
  )
}
