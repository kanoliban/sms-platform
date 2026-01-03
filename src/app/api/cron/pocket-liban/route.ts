import { NextRequest, NextResponse } from 'next/server'
import { createAdminClient } from '@/lib/supabase/server'
import { sendSms } from '@/lib/twilio/client'

// POST /api/cron/pocket-liban
// Vercel Cron: runs every 5 minutes
// Sends Pocket Liban prompts to hosts at scheduled times
export async function POST(request: NextRequest) {
  try {
    // Verify cron secret
    const authHeader = request.headers.get('authorization')
    if (authHeader !== `Bearer ${process.env.CRON_SECRET}`) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const supabase = createAdminClient()
    const now = new Date()

    // Find prompts that should be sent now
    // Window: prompts where send_at is in the past and not yet sent
    const { data: prompts, error } = await supabase
      .from('host_prompts')
      .select(`
        *,
        space:spaces (
          *,
          host:users!spaces_host_id_fkey (
            id,
            name,
            phone
          )
        )
      `)
      .eq('sent', false)
      .lte('send_at', now.toISOString())
      .order('send_at', { ascending: true })

    if (error) {
      console.error('Error fetching prompts:', error)
      return NextResponse.json({ error: error.message }, { status: 500 })
    }

    if (!prompts || prompts.length === 0) {
      return NextResponse.json({ message: 'No prompts to send', processed: 0 })
    }

    let processed = 0
    let errors = 0

    for (const prompt of prompts) {
      const space = prompt.space
      const host = space?.host

      // Skip if space is canceled or completed
      if (space?.status === 'canceled' || space?.status === 'completed') {
        // Mark as sent to skip in future
        await supabase
          .from('host_prompts')
          .update({ sent: true })
          .eq('id', prompt.id)
        continue
      }

      // Skip if no host phone
      if (!host?.phone) {
        console.error(`No phone for host of space ${space?.id}`)
        errors++
        continue
      }

      try {
        // Send the prompt
        await sendSms(host.phone, prompt.message)

        // Mark as sent
        await supabase
          .from('host_prompts')
          .update({ sent: true })
          .eq('id', prompt.id)

        // Log outbound
        await supabase.from('sms_conversations').insert({
          user_id: host.id,
          direction: 'outbound',
          message: prompt.message,
          context: `pocket_liban_${prompt.prompt_type}`,
          space_id: space.id,
        })

        processed++
        console.log(`Sent ${prompt.prompt_type} prompt for room ${space.id}`)
      } catch (err) {
        console.error(`Error sending prompt ${prompt.id}:`, err)
        errors++
      }
    }

    return NextResponse.json({
      message: 'Pocket Liban prompts processed',
      processed,
      errors,
    })
  } catch (err) {
    console.error('Pocket Liban cron error:', err)
    return NextResponse.json({ error: 'Cron job failed' }, { status: 500 })
  }
}

// Allow GET for manual testing
export async function GET(request: NextRequest) {
  return POST(request)
}
