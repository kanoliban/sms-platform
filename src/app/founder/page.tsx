'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { createClient } from '@/lib/supabase/client'
import type { Space, User, Invitation, Feedback } from '@/lib/supabase/types'

type SpaceWithDetails = Space & {
  host: Pick<User, 'id' | 'name' | 'phone'>
  invitations: Array<Invitation & { user: Pick<User, 'id' | 'name' | 'phone' | 'trust_score_overall'> }>
  feedback: Feedback[]
}

type UserWithStats = User & {
  recent_spaces: number
}

export default function FounderDashboard() {
  const [spaces, setSpaces] = useState<SpaceWithDetails[]>([])
  const [users, setUsers] = useState<UserWithStats[]>([])
  const [stats, setStats] = useState({
    totalSpaces: 0,
    totalGuests: 0,
    totalAttendees: 0,
    avgTrustScore: 0,
    noShowRate: 0,
  })
  const [loading, setLoading] = useState(true)
  const [activeTab, setActiveTab] = useState<'spaces' | 'users' | 'trust'>('spaces')

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    const supabase = createClient()

    // Load all spaces with details
    const { data: spacesData } = await supabase
      .from('spaces')
      .select(`
        *,
        host:users!spaces_host_id_fkey (
          id,
          name,
          phone
        ),
        invitations (
          *,
          user:users (
            id,
            name,
            phone,
            trust_score_overall
          )
        ),
        feedback (*)
      `)
      .order('date', { ascending: false })

    if (spacesData) {
      setSpaces(spacesData as SpaceWithDetails[])
    }

    // Load all users with stats
    const { data: usersData } = await supabase
      .from('users')
      .select('*')
      .order('trust_score_overall', { ascending: false })

    if (usersData) {
      setUsers(usersData as UserWithStats[])
    }

    // Calculate stats
    const totalSpaces = spacesData?.length || 0
    const allInvitations = spacesData?.flatMap((r) => r.invitations) || []
    const totalGuests = new Set(allInvitations.map((i) => i.user_id)).size
    const totalAttendees = allInvitations.filter((i) => i.attended === true).length
    const noShows = allInvitations.filter((i) => i.attended === false).length
    const acceptedInvites = allInvitations.filter((i) => i.status === 'accepted').length

    const avgTrust = usersData?.length
      ? Math.round(usersData.reduce((sum, u) => sum + u.trust_score_overall, 0) / usersData.length)
      : 0

    setStats({
      totalSpaces,
      totalGuests,
      totalAttendees,
      avgTrustScore: avgTrust,
      noShowRate: acceptedInvites > 0 ? Math.round((noShows / acceptedInvites) * 100) : 0,
    })

    setLoading(false)
  }

  const getStatusColor = (status: Space['status']) => {
    switch (status) {
      case 'draft':
        return 'bg-zinc-700'
      case 'open':
        return 'bg-green-700'
      case 'full':
        return 'bg-blue-700'
      case 'confirmed':
        return 'bg-purple-700'
      case 'completed':
        return 'bg-zinc-600'
      case 'canceled':
        return 'bg-red-700'
      default:
        return 'bg-zinc-700'
    }
  }

  const getTrustColor = (score: number) => {
    if (score >= 80) return 'text-green-400'
    if (score >= 60) return 'text-blue-400'
    if (score >= 45) return 'text-yellow-400'
    if (score >= 30) return 'text-orange-400'
    return 'text-red-400'
  }

  const getTrustStatusColor = (status: User['trust_status']) => {
    switch (status) {
      case 'active':
        return 'bg-green-700/50 text-green-200'
      case 'new':
        return 'bg-blue-700/50 text-blue-200'
      case 'suspended':
        return 'bg-orange-700/50 text-orange-200'
      case 'banned':
        return 'bg-red-700/50 text-red-200'
      default:
        return 'bg-zinc-700/50 text-zinc-200'
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl opacity-60">Loading founder dashboard...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Header */}
      <header className="border-b border-white/10 p-6">
        <div className="max-w-6xl mx-auto flex justify-between items-center">
          <div>
            <Link href="/" className="font-bold italic text-xl tracking-tight">
              SMS
            </Link>
            <span className="text-white/40 ml-4">Founder Dashboard</span>
          </div>
          <div className="text-sm text-amber-200/80">Founder View</div>
        </div>
      </header>

      <main className="max-w-6xl mx-auto p-6">
        {/* Stats Grid */}
        <div className="grid grid-cols-5 gap-4 mb-8">
          <div className="p-4 border border-white/20 rounded-lg">
            <div className="text-3xl font-bold">{stats.totalSpaces}</div>
            <div className="text-sm text-white/60">Total Spaces</div>
          </div>
          <div className="p-4 border border-white/20 rounded-lg">
            <div className="text-3xl font-bold">{stats.totalGuests}</div>
            <div className="text-sm text-white/60">Unique Guests</div>
          </div>
          <div className="p-4 border border-white/20 rounded-lg">
            <div className="text-3xl font-bold">{stats.totalAttendees}</div>
            <div className="text-sm text-white/60">Total Attendees</div>
          </div>
          <div className="p-4 border border-white/20 rounded-lg">
            <div className="text-3xl font-bold">{stats.avgTrustScore}</div>
            <div className="text-sm text-white/60">Avg Trust Score</div>
          </div>
          <div className="p-4 border border-white/20 rounded-lg">
            <div className="text-3xl font-bold">{stats.noShowRate}%</div>
            <div className="text-sm text-white/60">No-Show Rate</div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex gap-4 mb-6 border-b border-white/10">
          <button
            onClick={() => setActiveTab('spaces')}
            className={`px-4 py-2 -mb-px border-b-2 transition-colors ${
              activeTab === 'spaces'
                ? 'border-white text-white'
                : 'border-transparent text-white/60 hover:text-white'
            }`}
          >
            All Spaces
          </button>
          <button
            onClick={() => setActiveTab('users')}
            className={`px-4 py-2 -mb-px border-b-2 transition-colors ${
              activeTab === 'users'
                ? 'border-white text-white'
                : 'border-transparent text-white/60 hover:text-white'
            }`}
          >
            All Users
          </button>
          <button
            onClick={() => setActiveTab('trust')}
            className={`px-4 py-2 -mb-px border-b-2 transition-colors ${
              activeTab === 'trust'
                ? 'border-white text-white'
                : 'border-transparent text-white/60 hover:text-white'
            }`}
          >
            Trust Issues
          </button>
        </div>

        {/* Spaces Tab */}
        {activeTab === 'spaces' && (
          <div className="space-y-4">
            {spaces.length === 0 ? (
              <div className="text-center text-white/60 p-8">No spaces yet</div>
            ) : (
              spaces.map((space) => {
                const accepted = space.invitations?.filter((i) => i.status === 'accepted').length || 0
                const attended = space.invitations?.filter((i) => i.attended === true).length || 0
                const noShows = space.invitations?.filter((i) => i.attended === false).length || 0
                const feedbackCount = space.feedback?.length || 0

                return (
                  <div
                    key={space.id}
                    className="p-4 border border-white/20 rounded-lg hover:border-white/40 transition-colors"
                  >
                    <div className="flex justify-between items-start mb-2">
                      <div>
                        <div className="flex items-center gap-3">
                          <h3 className="text-lg font-medium">{space.name}</h3>
                          <span
                            className={`px-2 py-0.5 text-xs uppercase tracking-wide rounded ${getStatusColor(
                              space.status
                            )}`}
                          >
                            {space.status}
                          </span>
                        </div>
                        <p className="text-sm text-white/60">
                          Hosted by {space.host?.name || space.host?.phone || 'Unknown'} ·{' '}
                          {new Date(space.date).toLocaleDateString('en-US', {
                            month: 'short',
                            day: 'numeric',
                          })}{' '}
                          at {space.time}
                        </p>
                      </div>
                      <div className="text-right text-sm">
                        <div className="text-white/60">
                          {accepted}/{space.capacity} accepted
                        </div>
                        {space.status === 'completed' && (
                          <div className="text-green-400">
                            {attended} attended · {noShows} no-shows
                          </div>
                        )}
                      </div>
                    </div>

                    {/* Guest list preview */}
                    {space.invitations && space.invitations.length > 0 && (
                      <div className="mt-3 pt-3 border-t border-white/10">
                        <div className="text-xs text-white/40 mb-2">Guests:</div>
                        <div className="flex flex-wrap gap-2">
                          {space.invitations.slice(0, 8).map((inv) => (
                            <div
                              key={inv.id}
                              className={`px-2 py-1 text-xs rounded ${
                                inv.attended === true
                                  ? 'bg-green-700/30 text-green-200'
                                  : inv.attended === false
                                  ? 'bg-red-700/30 text-red-200'
                                  : inv.status === 'accepted'
                                  ? 'bg-blue-700/30 text-blue-200'
                                  : 'bg-zinc-700/30 text-zinc-200'
                              }`}
                            >
                              {inv.user?.name || inv.user?.phone?.slice(-4) || '??'}
                              {inv.user?.trust_score_overall && (
                                <span className={`ml-1 ${getTrustColor(inv.user.trust_score_overall)}`}>
                                  ({inv.user.trust_score_overall})
                                </span>
                              )}
                            </div>
                          ))}
                          {space.invitations.length > 8 && (
                            <div className="px-2 py-1 text-xs text-white/40">
                              +{space.invitations.length - 8} more
                            </div>
                          )}
                        </div>
                      </div>
                    )}

                    {/* Feedback indicator */}
                    {feedbackCount > 0 && (
                      <div className="mt-2 text-xs text-white/40">
                        {feedbackCount} feedback response{feedbackCount !== 1 ? 's' : ''}
                      </div>
                    )}
                  </div>
                )
              })
            )}
          </div>
        )}

        {/* Users Tab */}
        {activeTab === 'users' && (
          <div className="space-y-2">
            <div className="grid grid-cols-6 gap-4 text-xs text-white/40 px-4 py-2">
              <div>Name/Phone</div>
              <div>Role</div>
              <div>Trust Score</div>
              <div>Status</div>
              <div>Rooms</div>
              <div>No-shows</div>
            </div>
            {users.map((user) => (
              <div
                key={user.id}
                className="grid grid-cols-6 gap-4 items-center p-4 border border-white/10 rounded-lg hover:border-white/20"
              >
                <div>
                  <div className="font-medium">{user.name || 'No name'}</div>
                  <div className="text-xs text-white/60">{user.phone}</div>
                </div>
                <div className="text-sm capitalize">{user.role}</div>
                <div className={`text-lg font-bold ${getTrustColor(user.trust_score_overall)}`}>
                  {user.trust_score_overall}
                </div>
                <div>
                  <span className={`px-2 py-1 text-xs rounded ${getTrustStatusColor(user.trust_status)}`}>
                    {user.trust_status}
                  </span>
                </div>
                <div className="text-sm">
                  <span className="text-white/60">Attended:</span> {user.spaces_attended}
                  {user.role === 'host' && (
                    <>
                      <br />
                      <span className="text-white/60">Hosted:</span> {user.spaces_hosted}
                    </>
                  )}
                </div>
                <div className={user.no_shows > 0 ? 'text-red-400' : 'text-white/60'}>
                  {user.no_shows}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Trust Issues Tab */}
        {activeTab === 'trust' && (
          <div className="space-y-4">
            <h3 className="text-lg font-medium mb-4">Users Requiring Attention</h3>

            {/* Suspended Users */}
            <div className="mb-6">
              <h4 className="text-sm text-orange-400 mb-2">Suspended</h4>
              {users.filter((u) => u.trust_status === 'suspended').length === 0 ? (
                <div className="text-white/40 text-sm">No suspended users</div>
              ) : (
                users
                  .filter((u) => u.trust_status === 'suspended')
                  .map((user) => (
                    <div
                      key={user.id}
                      className="p-4 border border-orange-700/50 rounded-lg mb-2"
                    >
                      <div className="flex justify-between">
                        <div>
                          <div className="font-medium">{user.name || user.phone}</div>
                          <div className="text-xs text-white/60">
                            Trust: {user.trust_score_overall} · No-shows: {user.no_shows}
                          </div>
                        </div>
                        <div className="flex gap-2">
                          <button className="px-3 py-1 text-xs bg-green-700 hover:bg-green-600 rounded">
                            Reinstate
                          </button>
                          <button className="px-3 py-1 text-xs bg-red-700 hover:bg-red-600 rounded">
                            Ban
                          </button>
                        </div>
                      </div>
                    </div>
                  ))
              )}
            </div>

            {/* Banned Users */}
            <div className="mb-6">
              <h4 className="text-sm text-red-400 mb-2">Banned</h4>
              {users.filter((u) => u.trust_status === 'banned').length === 0 ? (
                <div className="text-white/40 text-sm">No banned users</div>
              ) : (
                users
                  .filter((u) => u.trust_status === 'banned')
                  .map((user) => (
                    <div
                      key={user.id}
                      className="p-4 border border-red-700/50 rounded-lg mb-2"
                    >
                      <div className="flex justify-between">
                        <div>
                          <div className="font-medium">{user.name || user.phone}</div>
                          <div className="text-xs text-white/60">
                            Trust: {user.trust_score_overall} · No-shows: {user.no_shows}
                          </div>
                        </div>
                        <button className="px-3 py-1 text-xs bg-zinc-700 hover:bg-zinc-600 rounded">
                          Review
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>

            {/* Low Trust Users */}
            <div>
              <h4 className="text-sm text-yellow-400 mb-2">Low Trust (Below 45)</h4>
              {users.filter((u) => u.trust_score_overall < 45 && u.trust_status === 'active').length === 0 ? (
                <div className="text-white/40 text-sm">No low-trust active users</div>
              ) : (
                users
                  .filter((u) => u.trust_score_overall < 45 && u.trust_status === 'active')
                  .map((user) => (
                    <div
                      key={user.id}
                      className="p-4 border border-yellow-700/50 rounded-lg mb-2"
                    >
                      <div className="flex justify-between">
                        <div>
                          <div className="font-medium">{user.name || user.phone}</div>
                          <div className="text-xs text-white/60">
                            Trust: {user.trust_score_overall} · Reliability: {user.trust_reliability} ·
                            Social: {user.trust_social} · Safety: {user.trust_safety}
                          </div>
                        </div>
                        <button className="px-3 py-1 text-xs bg-orange-700 hover:bg-orange-600 rounded">
                          Suspend
                        </button>
                      </div>
                    </div>
                  ))
              )}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
