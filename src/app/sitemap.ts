import { MetadataRoute } from 'next'
import { createAdminClient } from '@/lib/supabase/server'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = 'https://strangersmeetingstrangers.com'

  // Static pages
  const staticPages: MetadataRoute.Sitemap = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 1,
    },
    {
      url: `${baseUrl}/discover`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    {
      url: `${baseUrl}/host`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 0.8,
    },
    {
      url: `${baseUrl}/founder`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.7,
    },
    {
      url: `${baseUrl}/help`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.5,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
    {
      url: `${baseUrl}/terms`,
      lastModified: new Date(),
      changeFrequency: 'yearly',
      priority: 0.3,
    },
  ]

  // Dynamic space pages - fetch public/open spaces
  let spacePages: MetadataRoute.Sitemap = []

  try {
    const supabase = createAdminClient()
    const { data: spaces } = await supabase
      .from('spaces')
      .select('id, updated_at')
      .in('status', ['open', 'confirmed', 'completed'])
      .order('updated_at', { ascending: false })
      .limit(100)

    if (spaces) {
      spacePages = spaces.map((space) => ({
        url: `${baseUrl}/spaces/${space.id}`,
        lastModified: new Date(space.updated_at),
        changeFrequency: 'daily' as const,
        priority: 0.8,
      }))
    }
  } catch (error) {
    console.error('Error fetching spaces for sitemap:', error)
  }

  return [...staticPages, ...spacePages]
}
