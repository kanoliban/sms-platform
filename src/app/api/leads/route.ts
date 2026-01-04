import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { jwtVerify } from 'jose'
import { cookies } from 'next/headers'

const JWT_SECRET = new TextEncoder().encode(process.env.JWT_SECRET!)

// Helper to verify founder role
async function verifyFounder(request: NextRequest): Promise<{ userId: string } | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get('sms_auth_token')?.value

  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, JWT_SECRET)
    const userId = payload.userId as string

    const supabase = createAdminClient()
    const { data: user } = await supabase
      .from('users')
      .select('role')
      .eq('id', userId)
      .single()

    if (user?.role !== 'founder') return null
    return { userId }
  } catch {
    return null
  }
}

// POST /api/leads - Create new lead (public endpoint for phone mockup)
export async function POST(request: NextRequest) {
  try {
    const supabase = createAdminClient()
    const body = await request.json()
    const { type, name, email, phone, eventIdea, whyHost, interests, neighborhoods } = body

    // Validation
    if (!type || !['host', 'attendee'].includes(type)) {
      return NextResponse.json({ error: 'Invalid type' }, { status: 400 })
    }
    if (!name || !phone) {
      return NextResponse.json({ error: 'Name and phone are required' }, { status: 400 })
    }
    if (type === 'host' && !eventIdea) {
      return NextResponse.json({ error: 'Event idea is required for hosts' }, { status: 400 })
    }
    if (type === 'attendee' && !interests) {
      return NextResponse.json({ error: 'Interests are required for attendees' }, { status: 400 })
    }

    // Normalize phone number
    const normalizedPhone = phone.replace(/\D/g, '')

    // Check for existing lead with same phone
    const { data: existingLead } = await supabase
      .from('leads')
      .select('id, submission_count')
      .eq('phone', normalizedPhone)
      .eq('type', type)
      .single()

    if (existingLead) {
      // Update existing lead with new data
      const { error: updateError } = await supabase
        .from('leads')
        .update({
          name,
          email: email || null,
          event_idea: eventIdea || null,
          why_host: whyHost || null,
          interests: interests || null,
          neighborhoods: neighborhoods || null,
          submission_count: existingLead.submission_count + 1,
          // Reset status if they submitted again
          status: 'new',
        })
        .eq('id', existingLead.id)

      if (updateError) {
        console.error('Error updating lead:', updateError)
        return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 })
      }

      return NextResponse.json({
        success: true,
        message: 'Lead updated',
        leadId: existingLead.id,
        isUpdate: true,
      }, { status: 200 })
    }

    // Create new lead
    const { data: lead, error: insertError } = await supabase
      .from('leads')
      .insert({
        type,
        name,
        email: email || null,
        phone: normalizedPhone,
        event_idea: eventIdea || null,
        why_host: whyHost || null,
        interests: interests || null,
        neighborhoods: neighborhoods || null,
        status: 'new',
      })
      .select('id')
      .single()

    if (insertError) {
      console.error('Error creating lead:', insertError)
      return NextResponse.json({ error: 'Failed to create lead' }, { status: 500 })
    }

    return NextResponse.json({
      success: true,
      message: 'Lead created',
      leadId: lead.id,
      isUpdate: false,
    }, { status: 201 })
  } catch (error) {
    console.error('Lead creation error:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// GET /api/leads - List leads (founder only)
export async function GET(request: NextRequest) {
  const founder = await verifyFounder(request)
  if (!founder) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createAdminClient()
    const { searchParams } = new URL(request.url)

    const status = searchParams.get('status') || 'all'
    const type = searchParams.get('type') || 'all'
    const limit = parseInt(searchParams.get('limit') || '50')
    const offset = parseInt(searchParams.get('offset') || '0')

    let query = supabase
      .from('leads')
      .select('*, converted_user:users!leads_converted_user_id_fkey(id, name, phone)', { count: 'exact' })
      .order('created_at', { ascending: false })
      .range(offset, offset + limit - 1)

    if (status !== 'all') {
      query = query.eq('status', status)
    }
    if (type !== 'all') {
      query = query.eq('type', type)
    }

    const { data: leads, error, count } = await query

    if (error) {
      console.error('Error fetching leads:', error)
      return NextResponse.json({ error: 'Failed to fetch leads' }, { status: 500 })
    }

    // Get counts for each status
    const { data: statusCounts } = await supabase
      .from('leads')
      .select('status')

    const counts = {
      all: statusCounts?.length || 0,
      new: statusCounts?.filter(l => l.status === 'new').length || 0,
      contacted: statusCounts?.filter(l => l.status === 'contacted').length || 0,
      converted: statusCounts?.filter(l => l.status === 'converted').length || 0,
      declined: statusCounts?.filter(l => l.status === 'declined').length || 0,
      archived: statusCounts?.filter(l => l.status === 'archived').length || 0,
    }

    // Get type counts
    const typeCounts = {
      all: statusCounts?.length || 0,
      host: statusCounts?.filter(l => (l as { type?: string }).type === 'host').length || 0,
      attendee: statusCounts?.filter(l => (l as { type?: string }).type === 'attendee').length || 0,
    }

    return NextResponse.json({
      leads: leads || [],
      total: count || 0,
      counts,
      typeCounts,
    })
  } catch (error) {
    console.error('Error fetching leads:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

// PATCH /api/leads - Update lead (founder only)
export async function PATCH(request: NextRequest) {
  const founder = await verifyFounder(request)
  if (!founder) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const supabase = createAdminClient()
    const body = await request.json()
    const { id, status, notes } = body

    if (!id) {
      return NextResponse.json({ error: 'Lead ID is required' }, { status: 400 })
    }

    const updates: Record<string, unknown> = {}

    if (status) {
      if (!['new', 'contacted', 'converted', 'declined', 'archived'].includes(status)) {
        return NextResponse.json({ error: 'Invalid status' }, { status: 400 })
      }
      updates.status = status

      // Auto-set contacted_at when marking as contacted
      if (status === 'contacted') {
        updates.contacted_at = new Date().toISOString()
      }

      // Auto-set converted_at when marking as converted
      if (status === 'converted') {
        updates.converted_at = new Date().toISOString()
      }
    }

    if (notes !== undefined) {
      updates.notes = notes
    }

    if (Object.keys(updates).length === 0) {
      return NextResponse.json({ error: 'No updates provided' }, { status: 400 })
    }

    const { data: lead, error } = await supabase
      .from('leads')
      .update(updates)
      .eq('id', id)
      .select()
      .single()

    if (error) {
      console.error('Error updating lead:', error)
      return NextResponse.json({ error: 'Failed to update lead' }, { status: 500 })
    }

    return NextResponse.json({ success: true, lead })
  } catch (error) {
    console.error('Error updating lead:', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}
