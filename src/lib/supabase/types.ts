// Database types for SMS Platform

export type UserRole = 'guest' | 'host' | 'founder'
export type UserIntent = 'human_connection' | 'professional' | 'curious' | 'referred'
export type TonePreference = 'chill' | 'playful' | 'deep' | 'intense'
export type TrustStatus = 'new' | 'active' | 'suspended' | 'banned'
export type RoomStatus = 'draft' | 'open' | 'full' | 'confirmed' | 'completed' | 'canceled'
export type InvitationStatus = 'pending' | 'sent' | 'accepted' | 'declined' | 'expired'
export type PromptType = 'pre_room' | 'opening' | 'check_in' | 'energy_check' | 'closing_warning' | 'closing'

export interface User {
  id: string
  phone: string
  name: string | null
  role: UserRole
  intent: UserIntent | null
  tone_preference: TonePreference | null
  trust_score_overall: number
  trust_reliability: number
  trust_social: number
  trust_safety: number
  trust_tenure: number
  trust_status: TrustStatus
  rooms_attended: number
  rooms_hosted: number
  no_shows: number
  created_at: string
  updated_at: string
}

export interface Room {
  id: string
  host_id: string
  name: string
  description: string | null
  tone: TonePreference
  date: string
  time: string
  duration_minutes: number
  location_address: string
  location_hint: string | null
  capacity: number
  price_cents: number
  status: RoomStatus
  location_revealed: boolean
  feedback_requested: boolean
  created_at: string
  updated_at: string
}

export interface Invitation {
  id: string
  room_id: string
  user_id: string
  status: InvitationStatus
  sent_at: string | null
  responded_at: string | null
  stripe_payment_intent_id: string | null
  amount_cents: number | null
  captured: boolean
  attended: boolean | null
  created_at: string
}

export interface Feedback {
  id: string
  room_id: string
  user_id: string
  role: 'guest' | 'host'
  felt_different: 'much' | 'somewhat' | 'not_really' | null
  shared_something: 'yes' | 'a_little' | 'no' | null
  agreements_followed: 'completely' | 'mostly' | 'issues' | null
  issues: string | null
  attend_again: 'definitely' | 'maybe' | 'no' | null
  uncomfortable: string | null
  felt_like_sms: 'yes' | 'mostly' | 'not_quite' | null
  prompts_helped: 'very' | 'somewhat' | 'not_really' | 'didnt_use' | null
  difficult_guests: string | null
  exceptional_guests: string | null
  what_would_help: string | null
  submitted_at: string
}

export interface TrustEvent {
  id: string
  user_id: string
  event_type: string
  delta: number
  room_id: string | null
  notes: string | null
  created_at: string
}

export interface HostPrompt {
  id: string
  room_id: string
  prompt_type: PromptType
  message: string
  send_at: string
  sent: boolean
  created_at: string
}

export interface SmsConversation {
  id: string
  user_id: string
  direction: 'inbound' | 'outbound'
  message: string
  context: string | null
  room_id: string | null
  created_at: string
}
