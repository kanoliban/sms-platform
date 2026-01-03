'use client'

import { useState, useEffect, useCallback } from 'react'
import type { Notification } from '@/components/composed/notifications-dropdown'

interface UseNotificationsOptions {
  userId?: string | null
  pollInterval?: number // ms, 0 to disable polling
}

interface UseNotificationsReturn {
  notifications: Notification[]
  unreadCount: number
  loading: boolean
  error: string | null
  markAsRead: (notificationId: string) => Promise<void>
  markAllAsRead: () => Promise<void>
  refresh: () => Promise<void>
}

// Demo notifications for when no user is logged in or API fails
const DEMO_NOTIFICATIONS: Notification[] = [
  {
    id: '1',
    type: 'registration',
    title: 'New Registration',
    message: 'Alex Chen registered for Dinner & Deep Talks',
    timestamp: '4m',
    read: false,
    actor: { name: 'Alex Chen' },
    space: { id: 'demo-1', name: 'Dinner & Deep Talks' },
  },
  {
    id: '2',
    type: 'invite_accepted',
    title: 'Invite Accepted',
    message: 'Jordan Lee accepted your invite to Game Night',
    timestamp: '2h',
    read: false,
    actor: { name: 'Jordan Lee' },
    space: { id: 'demo-3', name: 'Game Night Strangers' },
  },
  {
    id: '3',
    type: 'approval_request',
    title: 'Approval Needed',
    message: 'Sam Rivera requested to join Strangers & Vinyl',
    timestamp: '5h',
    read: true,
    actor: { name: 'Sam Rivera' },
    space: { id: 'demo-2', name: 'Strangers & Vinyl' },
  },
]

function formatTimestamp(dateString: string): string {
  const date = new Date(dateString)
  const now = new Date()
  const diffMs = now.getTime() - date.getTime()
  const diffMins = Math.floor(diffMs / (1000 * 60))
  const diffHours = Math.floor(diffMs / (1000 * 60 * 60))
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))

  if (diffMins < 1) return 'now'
  if (diffMins < 60) return `${diffMins}m`
  if (diffHours < 24) return `${diffHours}h`
  if (diffDays < 7) {
    return date.toLocaleDateString('en-US', { weekday: 'short' })
  }
  return date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
}

export function useNotifications({
  userId,
  pollInterval = 60000, // Default: poll every 60 seconds
}: UseNotificationsOptions = {}): UseNotificationsReturn {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchNotifications = useCallback(async () => {
    // If no userId, use demo data
    if (!userId) {
      setNotifications(DEMO_NOTIFICATIONS)
      setUnreadCount(DEMO_NOTIFICATIONS.filter(n => !n.read).length)
      setLoading(false)
      return
    }

    try {
      const res = await fetch(`/api/notifications?user_id=${userId}`)

      if (!res.ok) {
        throw new Error('Failed to fetch notifications')
      }

      const data = await res.json()

      // Transform API response to match Notification interface
      const transformed: Notification[] = (data.notifications || []).map((n: {
        id: string
        type: string
        title: string
        message: string
        created_at: string
        read: boolean
        actor?: { id: string; name: string; avatar_url?: string }
        space?: { id: string; name: string }
      }) => ({
        id: n.id,
        type: n.type as Notification['type'],
        title: n.title,
        message: n.message,
        timestamp: formatTimestamp(n.created_at),
        read: n.read,
        actor: n.actor ? { name: n.actor.name, avatar: n.actor.avatar_url } : undefined,
        space: n.space ? { id: n.space.id, name: n.space.name } : undefined,
      }))

      setNotifications(transformed)
      setUnreadCount(data.unreadCount || 0)
      setError(null)
    } catch (err) {
      console.error('Error fetching notifications:', err)
      setError(err instanceof Error ? err.message : 'Failed to load notifications')
      // Fall back to demo data on error
      setNotifications(DEMO_NOTIFICATIONS)
      setUnreadCount(DEMO_NOTIFICATIONS.filter(n => !n.read).length)
    } finally {
      setLoading(false)
    }
  }, [userId])

  const markAsRead = useCallback(async (notificationId: string) => {
    // Optimistically update UI
    setNotifications(prev =>
      prev.map(n => (n.id === notificationId ? { ...n, read: true } : n))
    )
    setUnreadCount(prev => Math.max(0, prev - 1))

    if (!userId) return

    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          notification_ids: [notificationId],
        }),
      })
    } catch (err) {
      console.error('Error marking notification as read:', err)
      // Revert on error
      fetchNotifications()
    }
  }, [userId, fetchNotifications])

  const markAllAsRead = useCallback(async () => {
    // Optimistically update UI
    setNotifications(prev => prev.map(n => ({ ...n, read: true })))
    setUnreadCount(0)

    if (!userId) return

    try {
      await fetch('/api/notifications', {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          user_id: userId,
          mark_all_read: true,
        }),
      })
    } catch (err) {
      console.error('Error marking all as read:', err)
      // Revert on error
      fetchNotifications()
    }
  }, [userId, fetchNotifications])

  // Initial fetch
  useEffect(() => {
    fetchNotifications()
  }, [fetchNotifications])

  // Polling
  useEffect(() => {
    if (pollInterval <= 0 || !userId) return

    const interval = setInterval(fetchNotifications, pollInterval)
    return () => clearInterval(interval)
  }, [fetchNotifications, pollInterval, userId])

  return {
    notifications,
    unreadCount,
    loading,
    error,
    markAsRead,
    markAllAsRead,
    refresh: fetchNotifications,
  }
}

export default useNotifications
