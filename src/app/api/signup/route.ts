import { NextRequest, NextResponse } from 'next/server'
import { Client } from '@notionhq/client'

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

const HOST_DATABASE_ID = '2db9ce6a-b149-81ae-97a0-f078c45f845f'
const ATTENDEE_DATABASE_ID = '2db9ce6a-b149-81bf-9951-c90086924537'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { type, name, email, phone, eventIdea, whyHost, interests, neighborhoods } = body

    if (!type || !name || !email || !phone) {
      return NextResponse.json(
        { error: 'Name, email, and phone are required' },
        { status: 400 }
      )
    }

    if (type === 'host') {
      if (!eventIdea) {
        return NextResponse.json(
          { error: 'Event idea is required for hosts' },
          { status: 400 }
        )
      }

      await notion.pages.create({
        parent: { database_id: HOST_DATABASE_ID },
        properties: {
          Name: {
            title: [{ text: { content: name } }],
          },
          Email: {
            email: email,
          },
          Phone: {
            phone_number: phone,
          },
          'Event Idea': {
            rich_text: [{ text: { content: eventIdea } }],
          },
          'Why Host': {
            rich_text: [{ text: { content: whyHost || '' } }],
          },
          Status: {
            select: { name: 'New' },
          },
        },
      })
    } else {
      if (!interests) {
        return NextResponse.json(
          { error: 'Interests are required for attendees' },
          { status: 400 }
        )
      }

      await notion.pages.create({
        parent: { database_id: ATTENDEE_DATABASE_ID },
        properties: {
          Name: {
            title: [{ text: { content: name } }],
          },
          Email: {
            email: email,
          },
          Phone: {
            phone_number: phone,
          },
          Interests: {
            rich_text: [{ text: { content: interests } }],
          },
          Neighborhoods: {
            rich_text: [{ text: { content: neighborhoods || '' } }],
          },
          Status: {
            select: { name: 'New' },
          },
        },
      })
    }

    return NextResponse.json({ success: true }, { status: 201 })
  } catch (error) {
    console.error('Signup error:', error)
    return NextResponse.json(
      { error: 'Failed to submit signup' },
      { status: 500 }
    )
  }
}
