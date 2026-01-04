'use client'

import { useEffect, useState, useCallback } from 'react'
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

type HostApplication = {
  id: string
  status: 'pending' | 'approved' | 'rejected'
  signature_name: string
  signature_timestamp: string
  signature_ip: string
  created_at: string
  reviewed_at: string | null
  review_notes: string | null
  rejection_reason: string | null
  user: {
    id: string
    name: string | null
    phone: string
    email: string | null
    trust_score_overall: number
    trust_status: string
    spaces_attended: number
    no_shows: number
    created_at: string
  }
  terms: {
    id: string
    version: string
    title: string
  }
  reviewer: {
    id: string
    name: string | null
  } | null
}

type ApplicationCounts = {
  pending: number
  approved: number
  rejected: number
  all: number
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
  const [activeTab, setActiveTab] = useState<'spaces' | 'users' | 'trust' | 'applications'>('spaces')

  // Host applications state
  const [applications, setApplications] = useState<HostApplication[]>([])
  const [applicationCounts, setApplicationCounts] = useState<ApplicationCounts>({ pending: 0, approved: 0, rejected: 0, all: 0 })
  const [applicationFilter, setApplicationFilter] = useState<'pending' | 'approved' | 'rejected' | 'all'>('pending')
  const [applicationsLoading, setApplicationsLoading] = useState(false)
  const [processingAppId, setProcessingAppId] = useState<string | null>(null)
  const [rejectionModal, setRejectionModal] = useState<{ open: boolean; appId: string | null }>({ open: false, appId: null })
  const [rejectionReason, setRejectionReason] = useState('')

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

    // Also load application counts for badge
    try {
      const token = localStorage.getItem('auth_token')
      if (token) {
        const response = await fetch('/api/host/applications?status=pending', {
          headers: { 'Authorization': `Bearer ${token}` },
        })
        if (response.ok) {
          const data = await response.json()
          setApplicationCounts(data.counts || { pending: 0, approved: 0, rejected: 0, all: 0 })
        }
      }
    } catch {
      // Ignore errors loading counts
    }
  }

  // Load host applications
  const loadApplications = useCallback(async (filter: string = 'pending') => {
    setApplicationsLoading(true)
    try {
      const token = localStorage.getItem('auth_token')
      if (!token) return

      const response = await fetch(`/api/host/applications?status=${filter}`, {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      })

      if (response.ok) {
        const data = await response.json()
        setApplications(data.applications || [])
        setApplicationCounts(data.counts || { pending: 0, approved: 0, rejected: 0, all: 0 })
      }
    } catch (err) {
      console.error('Error loading applications:', err)
    } finally {
      setApplicationsLoading(false)
    }
  }, [])

  // Load applications when tab changes
  useEffect(() => {
    if (activeTab === 'applications') {
      loadApplications(applicationFilter)
    }
  }, [activeTab, applicationFilter, loadApplications])

  // Handle approve application
  async function handleApprove(appId: string) {
    setProcessingAppId(appId)
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`/api/host/applications/${appId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'approve' }),
      })

      if (response.ok) {
        // Refresh applications
        await loadApplications(applicationFilter)
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to approve application')
      }
    } catch (err) {
      console.error('Error approving application:', err)
      alert('Failed to approve application')
    } finally {
      setProcessingAppId(null)
    }
  }

  // Handle reject application
  async function handleReject() {
    if (!rejectionModal.appId || !rejectionReason.trim()) {
      alert('Please provide a rejection reason')
      return
    }

    setProcessingAppId(rejectionModal.appId)
    try {
      const token = localStorage.getItem('auth_token')
      const response = await fetch(`/api/host/applications/${rejectionModal.appId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'reject',
          rejectionReason: rejectionReason.trim(),
        }),
      })

      if (response.ok) {
        setRejectionModal({ open: false, appId: null })
        setRejectionReason('')
        await loadApplications(applicationFilter)
      } else {
        const data = await response.json()
        alert(data.error || 'Failed to reject application')
      }
    } catch (err) {
      console.error('Error rejecting application:', err)
      alert('Failed to reject application')
    } finally {
      setProcessingAppId(null)
    }
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
          <button
            onClick={() => setActiveTab('applications')}
            className={`px-4 py-2 -mb-px border-b-2 transition-colors flex items-center gap-2 ${
              activeTab === 'applications'
                ? 'border-white text-white'
                : 'border-transparent text-white/60 hover:text-white'
            }`}
          >
            Host Applications
            {applicationCounts.pending > 0 && (
              <span className="bg-amber-500 text-black text-xs font-bold px-1.5 py-0.5 rounded-full">
                {applicationCounts.pending}
              </span>
            )}
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

        {/* Host Applications Tab */}
        {activeTab === 'applications' && (
          <div className="space-y-4">
            {/* Filter buttons */}
            <div className="flex gap-2 mb-4">
              {(['pending', 'approved', 'rejected', 'all'] as const).map((filter) => (
                <button
                  key={filter}
                  onClick={() => setApplicationFilter(filter)}
                  className={`px-4 py-2 text-sm rounded-lg transition-colors ${
                    applicationFilter === filter
                      ? 'bg-white text-black'
                      : 'bg-zinc-800 text-white/80 hover:bg-zinc-700'
                  }`}
                >
                  {filter.charAt(0).toUpperCase() + filter.slice(1)}
                  <span className="ml-2 opacity-60">
                    ({applicationCounts[filter]})
                  </span>
                </button>
              ))}
            </div>

            {applicationsLoading ? (
              <div className="text-center text-white/60 p-8">Loading applications...</div>
            ) : applications.length === 0 ? (
              <div className="text-center text-white/60 p-8">
                No {applicationFilter === 'all' ? '' : applicationFilter} applications
              </div>
            ) : (
              <div className="space-y-4">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className={`p-5 border rounded-lg ${
                      app.status === 'pending'
                        ? 'border-amber-700/50 bg-amber-900/10'
                        : app.status === 'approved'
                        ? 'border-green-700/50 bg-green-900/10'
                        : 'border-red-700/50 bg-red-900/10'
                    }`}
                  >
                    <div className="flex justify-between items-start">
                      {/* Applicant Info */}
                      <div className="flex-1">
                        <div className="flex items-center gap-3 mb-2">
                          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-400 to-pink-400 flex items-center justify-center text-white font-medium">
                            {(app.user?.name?.charAt(0) || app.user?.phone?.slice(-1) || '?').toUpperCase()}
                          </div>
                          <div>
                            <h3 className="font-medium text-lg">
                              {app.user?.name || 'No name'}
                            </h3>
                            <p className="text-sm text-white/60">
                              {app.user?.phone} {app.user?.email && `· ${app.user.email}`}
                            </p>
                          </div>
                          <span className={`px-2 py-0.5 text-xs uppercase tracking-wide rounded ${
                            app.status === 'pending'
                              ? 'bg-amber-700/50 text-amber-200'
                              : app.status === 'approved'
                              ? 'bg-green-700/50 text-green-200'
                              : 'bg-red-700/50 text-red-200'
                          }`}>
                            {app.status}
                          </span>
                        </div>

                        {/* Trust & Activity Stats */}
                        <div className="grid grid-cols-4 gap-4 mb-3 text-sm">
                          <div>
                            <span className="text-white/40">Trust Score:</span>{' '}
                            <span className={getTrustColor(app.user?.trust_score_overall || 0)}>
                              {app.user?.trust_score_overall || 0}
                            </span>
                          </div>
                          <div>
                            <span className="text-white/40">Status:</span>{' '}
                            <span className={`${getTrustStatusColor(app.user?.trust_status as User['trust_status'])}`}>
                              {app.user?.trust_status}
                            </span>
                          </div>
                          <div>
                            <span className="text-white/40">Spaces Attended:</span>{' '}
                            {app.user?.spaces_attended || 0}
                          </div>
                          <div>
                            <span className="text-white/40">No-shows:</span>{' '}
                            <span className={app.user?.no_shows > 0 ? 'text-red-400' : ''}>
                              {app.user?.no_shows || 0}
                            </span>
                          </div>
                        </div>

                        {/* E-Sign Details */}
                        <div className="p-3 bg-zinc-800/50 rounded-lg mb-3">
                          <div className="text-xs text-white/40 mb-1">Electronic Signature</div>
                          <div className="flex items-center gap-4 text-sm">
                            <div>
                              <span className="text-white/60">Signed as:</span>{' '}
                              <span className="italic" style={{ fontFamily: "'Dancing Script', cursive" }}>
                                {app.signature_name}
                              </span>
                            </div>
                            <div>
                              <span className="text-white/60">Date:</span>{' '}
                              {new Date(app.signature_timestamp).toLocaleString()}
                            </div>
                            <div>
                              <span className="text-white/60">IP:</span>{' '}
                              {app.signature_ip || 'N/A'}
                            </div>
                          </div>
                          <div className="text-xs text-white/40 mt-1">
                            Terms: {app.terms?.title} (v{app.terms?.version})
                          </div>
                        </div>

                        {/* Member since */}
                        <div className="text-xs text-white/40">
                          Member since {new Date(app.user?.created_at).toLocaleDateString()} ·
                          Applied {new Date(app.created_at).toLocaleDateString()}
                        </div>

                        {/* Review info for processed applications */}
                        {app.status !== 'pending' && app.reviewer && (
                          <div className="mt-2 p-2 bg-zinc-800/30 rounded text-sm">
                            <span className="text-white/40">
                              {app.status === 'approved' ? 'Approved' : 'Rejected'} by{' '}
                            </span>
                            <span className="text-white/80">{app.reviewer.name || 'Unknown'}</span>
                            <span className="text-white/40">
                              {' '}on {new Date(app.reviewed_at!).toLocaleString()}
                            </span>
                            {app.rejection_reason && (
                              <div className="mt-1 text-red-300">
                                Reason: {app.rejection_reason}
                              </div>
                            )}
                          </div>
                        )}
                      </div>

                      {/* Action Buttons */}
                      {app.status === 'pending' && (
                        <div className="flex gap-2 ml-4">
                          <button
                            onClick={() => handleApprove(app.id)}
                            disabled={processingAppId === app.id}
                            className="px-4 py-2 text-sm bg-green-700 hover:bg-green-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                          >
                            {processingAppId === app.id ? 'Processing...' : 'Approve'}
                          </button>
                          <button
                            onClick={() => setRejectionModal({ open: true, appId: app.id })}
                            disabled={processingAppId === app.id}
                            className="px-4 py-2 text-sm bg-red-700 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                          >
                            Reject
                          </button>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}

        {/* Rejection Modal */}
        {rejectionModal.open && (
          <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
            <div className="bg-zinc-900 border border-white/20 rounded-lg p-6 max-w-md w-full mx-4">
              <h3 className="text-lg font-medium mb-4">Reject Application</h3>
              <p className="text-sm text-white/60 mb-4">
                Please provide a reason for rejection. This will be recorded for audit purposes.
              </p>
              <textarea
                value={rejectionReason}
                onChange={(e) => setRejectionReason(e.target.value)}
                placeholder="Enter rejection reason..."
                className="w-full p-3 bg-zinc-800 border border-white/20 rounded-lg text-white placeholder:text-white/40 focus:outline-none focus:ring-2 focus:ring-red-500 mb-4"
                rows={3}
              />
              <div className="flex gap-3 justify-end">
                <button
                  onClick={() => {
                    setRejectionModal({ open: false, appId: null })
                    setRejectionReason('')
                  }}
                  className="px-4 py-2 text-sm bg-zinc-700 hover:bg-zinc-600 rounded-lg transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={handleReject}
                  disabled={!rejectionReason.trim() || processingAppId !== null}
                  className="px-4 py-2 text-sm bg-red-700 hover:bg-red-600 disabled:opacity-50 disabled:cursor-not-allowed rounded-lg transition-colors"
                >
                  {processingAppId ? 'Processing...' : 'Confirm Rejection'}
                </button>
              </div>
            </div>
          </div>
        )}
      </main>

      {/* Import cursive font for signatures */}
      <style jsx global>{`
        @import url('https://fonts.googleapis.com/css2?family=Dancing+Script:wght@400;500;600;700&display=swap');
      `}</style>
    </div>
  )
}
