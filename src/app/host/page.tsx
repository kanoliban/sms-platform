'use client'

import Link from 'next/link'
import { useEffect, useState } from 'react'
import type { Room, User } from '@/lib/supabase/types'

type RoomWithCounts = Room & {
  accepted_count: number
  total_invited: number
}

// Check if Supabase is configured
const isSupabaseConfigured = () => {
  return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)
}

// Mock data for demo/preview mode
const MOCK_ROOMS: RoomWithCounts[] = [
  {
    id: 'demo-1',
    host_id: 'demo-host',
    name: 'Dinner & Deep Talks',
    description: 'An intimate dinner for strangers who want real conversation',
    tone: 'deep',
    date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '19:00',
    duration_minutes: 180,
    location_address: '123 Example St, Minneapolis, MN',
    location_hint: 'Northeast Minneapolis',
    capacity: 8,
    price_cents: 4500,
    status: 'open',
    location_revealed: false,
    feedback_requested: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    accepted_count: 5,
    total_invited: 12,
  },
  {
    id: 'demo-2',
    host_id: 'demo-host',
    name: 'Strangers & Vinyl',
    description: 'Listen to records, meet new people',
    tone: 'chill',
    date: new Date(Date.now() + 14 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
    time: '20:00',
    duration_minutes: 120,
    location_address: '456 Demo Ave, Minneapolis, MN',
    location_hint: 'Uptown',
    capacity: 12,
    price_cents: 2500,
    status: 'draft',
    location_revealed: false,
    feedback_requested: false,
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
    accepted_count: 0,
    total_invited: 0,
  },
]

const MOCK_HOST: User = {
  id: 'demo-host',
  phone: '+1234567890',
  name: 'Demo Host',
  role: 'host',
  intent: 'human_connection',
  tone_preference: 'deep',
  trust_score_overall: 75,
  trust_reliability: 80,
  trust_social: 70,
  trust_safety: 75,
  trust_tenure: 50,
  trust_status: 'active',
  rooms_attended: 15,
  rooms_hosted: 8,
  no_shows: 0,
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

export default function HostDashboard() {
  const [rooms, setRooms] = useState<RoomWithCounts[]>([])
  const [loading, setLoading] = useState(true)
  const [host, setHost] = useState<User | null>(null)
  const [demoMode, setDemoMode] = useState(false)

  useEffect(() => {
    loadData()
  }, [])

  async function loadData() {
    // Check if Supabase is configured
    if (!isSupabaseConfigured()) {
      // Use mock data for demo
      setDemoMode(true)
      setHost(MOCK_HOST)
      setRooms(MOCK_ROOMS)
      setLoading(false)
      return
    }

    // Dynamic import to avoid build-time errors
    const { createClient } = await import('@/lib/supabase/client')
    const supabase = createClient()

    // For MVP, we'll use a simple phone-based lookup
    // In production, this would use proper auth
    const storedPhone = localStorage.getItem('sms_host_phone')

    if (storedPhone) {
      const { data: user } = await supabase
        .from('users')
        .select('*')
        .eq('phone', storedPhone)
        .single()

      if (user) {
        setHost(user)

        // Get rooms with invitation counts
        const { data: roomsData } = await supabase
          .from('rooms')
          .select(`
            *,
            invitations (
              id,
              status
            )
          `)
          .eq('host_id', user.id)
          .order('date', { ascending: true })

        if (roomsData) {
          const roomsWithCounts = roomsData.map((room: Room & { invitations: { id: string; status: string }[] }) => ({
            ...room,
            accepted_count: room.invitations?.filter((i: { status: string }) => i.status === 'accepted').length || 0,
            total_invited: room.invitations?.length || 0,
          }))
          setRooms(roomsWithCounts)
        }
      }
    }

    setLoading(false)
  }

  const getStatusColor = (status: Room['status']) => {
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

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white flex items-center justify-center">
        <div className="text-xl opacity-60">Loading...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-black text-white">
      {/* Demo Mode Banner */}
      {demoMode && (
        <div className="bg-amber-500/20 border-b border-amber-500/40 px-6 py-3 text-center text-amber-200 text-sm">
          Demo Mode — Supabase not configured. Showing sample data.
        </div>
      )}

      {/* Header */}
      <header className="border-b border-white/10 p-6">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <Link href="/" className="font-bold italic text-xl tracking-tight">
              SMS
            </Link>
            <span className="text-white/40 ml-4">Host Dashboard</span>
          </div>
          {host && (
            <div className="text-sm text-white/60">
              {host.name || host.phone}
            </div>
          )}
        </div>
      </header>

      <main className="max-w-4xl mx-auto p-6">
        {/* Quick Actions */}
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold">Your Rooms</h1>
          <Link
            href="/host/rooms/new"
            className="px-6 py-3 bg-white text-black font-medium hover:bg-white/90 transition-colors"
          >
            + Create Room
          </Link>
        </div>

        {/* Room List */}
        {rooms.length === 0 ? (
          <div className="border border-white/20 rounded-lg p-12 text-center">
            <h2 className="text-xl mb-2">No rooms yet</h2>
            <p className="text-white/60 mb-6">
              Create your first room to start hosting strangers.
            </p>
            <Link
              href="/host/rooms/new"
              className="inline-block px-6 py-3 bg-white text-black font-medium hover:bg-white/90 transition-colors"
            >
              Create Your First Room
            </Link>
          </div>
        ) : (
          <div className="space-y-4">
            {rooms.map((room) => (
              <Link
                key={room.id}
                href={`/host/rooms/${room.id}`}
                className="block border border-white/20 rounded-lg p-6 hover:border-white/40 transition-colors"
              >
                <div className="flex justify-between items-start mb-4">
                  <div>
                    <h3 className="text-xl font-medium mb-1">{room.name}</h3>
                    <p className="text-white/60">
                      {new Date(room.date).toLocaleDateString('en-US', {
                        weekday: 'short',
                        month: 'short',
                        day: 'numeric',
                      })}{' '}
                      at {room.time}
                    </p>
                  </div>
                  <span
                    className={`px-3 py-1 text-xs uppercase tracking-wide rounded ${getStatusColor(
                      room.status
                    )}`}
                  >
                    {room.status}
                  </span>
                </div>

                <div className="flex gap-6 text-sm text-white/60">
                  <span>
                    {room.accepted_count} / {room.capacity} confirmed
                  </span>
                  <span>{room.total_invited} invited</span>
                  <span>${(room.price_cents / 100).toFixed(0)}</span>
                  <span className="capitalize">{room.tone}</span>
                </div>
              </Link>
            ))}
          </div>
        )}

        {/* Host Onboarding (if new) */}
        {!host && (
          <div className="mt-12 border border-amber-200/30 rounded-lg p-8 bg-amber-200/5">
            <h2 className="text-xl font-semibold mb-4 text-amber-200">
              Become a Host
            </h2>
            <p className="text-white/70 mb-6">
              To create rooms, you'll need to complete host onboarding.
              This includes reading the philosophy doc and understanding
              what it means to carry the SMS brand.
            </p>
            <Link
              href="/host/onboarding"
              className="inline-block px-6 py-3 border border-amber-200/60 text-amber-200 hover:bg-amber-200/10 transition-colors"
            >
              Start Onboarding
            </Link>
          </div>
        )}
      </main>
    </div>
  )
}
