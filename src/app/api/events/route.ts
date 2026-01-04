import { NextResponse } from 'next/server'
import { Client } from '@notionhq/client'

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

const ROOMS_DATABASE_ID = '2db9ce6a-b149-81ca-a22f-c9705b0261c2'

type NotionRichText = {
  plain_text: string
}

type NotionProperty = {
  type: string
  title?: NotionRichText[]
  rich_text?: NotionRichText[]
  number?: number | null
  date?: { start: string } | null
  select?: { name: string } | null
}

type NotionPage = {
  id: string
  properties: Record<string, NotionProperty>
}

function formatDayOfWeek(dateStr: string): string {
  const date = new Date(dateStr)
  const days = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const
  return days[date.getDay()] ?? 'Sun'
}

function getPlainText(prop: NotionProperty | undefined): string {
  if (!prop) return ''
  if (prop.title) return prop.title[0]?.plain_text || ''
  if (prop.rich_text) return prop.rich_text[0]?.plain_text || ''
  return ''
}

export async function GET() {
  try {
    const response = await notion.databases.query({
      database_id: ROOMS_DATABASE_ID,
      filter: {
        or: [
          { property: 'Status', select: { equals: 'Live' } },
          { property: 'Status', select: { equals: 'Full' } },
        ],
      },
      sorts: [
        { property: 'Date', direction: 'ascending' },
      ],
    })

    const events = (response.results as NotionPage[]).map((page) => {
      const props = page.properties
      const capacity = props.Capacity?.number || 0
      const rsvpCount = props['RSVP Count']?.number || 0
      const spotsLeft = capacity - rsvpCount
      const status = props.Status?.select?.name

      let spotsDisplay: number | 'full' | 'just_posted'
      if (status === 'Full' || spotsLeft <= 0) {
        spotsDisplay = 'full'
      } else if (rsvpCount === 0) {
        spotsDisplay = 'just_posted'
      } else {
        spotsDisplay = spotsLeft
      }

      const dateStr = props.Date?.date?.start
      const timestamp = dateStr ? formatDayOfWeek(dateStr) : ''

      return {
        id: page.id,
        title: getPlainText(props.Name),
        description: getPlainText(props.Description),
        preview: getPlainText(props.Description).slice(0, 40) + '...',
        date: dateStr || '',
        timestamp,
        location: getPlainText(props.Location),
        price: props.Price?.number || 0,
        capacity,
        rsvpCount,
        spotsLeft: spotsDisplay,
        host: getPlainText(props.Host),
        status,
      }
    })

    return NextResponse.json({ events })
  } catch (error) {
    console.error('Error fetching events:', error)
    return NextResponse.json(
      { error: 'Failed to fetch events' },
      { status: 500 }
    )
  }
}
