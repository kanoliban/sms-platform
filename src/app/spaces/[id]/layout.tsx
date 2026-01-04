import type { Metadata } from 'next'
import { createAdminClient } from '@/lib/supabase/server'

type Props = {
  params: Promise<{ id: string }>
  children: React.ReactNode
}

// Tone labels for metadata
const toneLabels: Record<string, string> = {
  chill: 'Chill',
  playful: 'Playful',
  deep: 'Deep',
  intense: 'Intense',
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { id } = await params

  // Default metadata for demo IDs
  if (id.startsWith('demo')) {
    return {
      title: 'SMS Space | Strangers Meeting Strangers',
      description: 'An intimate gathering where strangers meet with intention. No networking, just real human connection.',
      openGraph: {
        title: 'SMS Space | Strangers Meeting Strangers',
        description: 'An intimate gathering where strangers meet with intention.',
        type: 'website',
        siteName: 'SMS',
        images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'SMS - Strangers Meeting Strangers' }],
      },
      twitter: {
        card: 'summary_large_image',
        title: 'SMS Space | Strangers Meeting Strangers',
        description: 'An intimate gathering where strangers meet with intention.',
        images: ['/og-image.png'],
      },
    }
  }

  try {
    const supabase = createAdminClient()

    const { data: space } = await supabase
      .from('spaces')
      .select(`
        id,
        name,
        description,
        tone,
        date,
        time,
        location_hint,
        capacity,
        price_cents,
        host:users!host_id (name)
      `)
      .eq('id', id)
      .single()

    if (!space) {
      return {
        title: 'Space Not Found | SMS',
        description: 'This space could not be found.',
      }
    }

    // Format date for display
    const eventDate = new Date(`${space.date}T${space.time}`)
    const formattedDate = eventDate.toLocaleDateString('en-US', {
      weekday: 'long',
      month: 'long',
      day: 'numeric',
    })

    // Build description
    const tone = toneLabels[space.tone] || space.tone
    const price = space.price_cents ? `$${(space.price_cents / 100).toFixed(0)}` : 'Free'
    const hostName = Array.isArray(space.host) ? space.host[0]?.name : (space.host as { name?: string })?.name

    const metaDescription = space.description
      ? space.description.slice(0, 155) + (space.description.length > 155 ? '...' : '')
      : `Join ${space.name} - a ${tone.toLowerCase()} gathering hosted by ${hostName || 'SMS'}. ${formattedDate} in ${space.location_hint || 'Minneapolis'}. ${price} · ${space.capacity} spots.`

    return {
      title: `${space.name} | SMS`,
      description: metaDescription,
      openGraph: {
        title: space.name,
        description: metaDescription,
        type: 'website',
        siteName: 'SMS',
        url: `https://strangersmeetingstrangers.com/spaces/${id}`,
        images: [{ url: '/og-image.png', width: 1200, height: 630, alt: space.name }],
      },
      twitter: {
        card: 'summary_large_image',
        title: space.name,
        description: metaDescription,
        images: ['/og-image.png'],
      },
      alternates: {
        canonical: `https://strangersmeetingstrangers.com/spaces/${id}`,
      },
    }
  } catch (error) {
    console.error('Error generating metadata for space:', error)
    return {
      title: 'SMS Space | Strangers Meeting Strangers',
      description: 'An intimate gathering where strangers meet with intention. No networking, just real human connection.',
      openGraph: {
        title: 'SMS Space | Strangers Meeting Strangers',
        description: 'An intimate gathering where strangers meet with intention.',
        type: 'website',
        siteName: 'SMS',
        images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'SMS - Strangers Meeting Strangers' }],
      },
      twitter: {
        card: 'summary_large_image',
        title: 'SMS Space | Strangers Meeting Strangers',
        description: 'An intimate gathering where strangers meet with intention.',
        images: ['/og-image.png'],
      },
    }
  }
}

export default function SpaceLayout({ children }: Props) {
  return <>{children}</>
}
