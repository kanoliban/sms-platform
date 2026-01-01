import { Client } from '@notionhq/client'

const notion = new Client({
  auth: process.env.NOTION_API_KEY,
})

const ROOMS_DATABASE_ID = '2db9ce6a-b149-81ca-a22f-c9705b0261c2'

const sampleRooms = [
  {
    name: 'Strangers & Supper',
    description: 'An intimate dinner for 8 strangers. Good food, better conversation. No small talk allowed.',
    date: '2026-01-03T19:00:00',
    location: 'NE Minneapolis',
    price: 40,
    capacity: 8,
    rsvpCount: 6,
    status: 'Live',
    host: 'Liban K.',
  },
  {
    name: 'Vinyl Night',
    description: 'Bring your favorite record. Share why it matters. Listen to strangers\' stories through their music.',
    date: '2026-01-04T20:00:00',
    location: 'Uptown',
    price: 25,
    capacity: 12,
    rsvpCount: 8,
    status: 'Live',
    host: 'Marcus T.',
  },
  {
    name: 'Morning Coffee Walk',
    description: '6am. Stone Arch Bridge. Coffee in hand. Walk with strangers as the city wakes up.',
    date: '2026-01-05T06:00:00',
    location: 'Stone Arch Bridge',
    price: 0,
    capacity: 10,
    rsvpCount: 10,
    status: 'Full',
    host: 'Sarah M.',
  },
  {
    name: 'Creatives Dinner',
    description: 'No networking energy. No business cards. Just creatives being human over a long table.',
    date: '2026-01-05T18:30:00',
    location: 'North Loop',
    price: 55,
    capacity: 10,
    rsvpCount: 3,
    status: 'Live',
    host: 'Liban K.',
  },
  {
    name: 'Founders & Fireside',
    description: 'Early-stage founders sharing real struggles. No pitch decks. Just honesty around a fire.',
    date: '2026-01-10T19:00:00',
    location: 'Northeast Minneapolis',
    price: 35,
    capacity: 8,
    rsvpCount: 0,
    status: 'Live',
    host: 'Liban K.',
  },
]

async function seedRooms() {
  console.log('Seeding rooms...')

  for (const room of sampleRooms) {
    try {
      await notion.pages.create({
        parent: { database_id: ROOMS_DATABASE_ID },
        properties: {
          Name: {
            title: [{ text: { content: room.name } }],
          },
          Description: {
            rich_text: [{ text: { content: room.description } }],
          },
          Date: {
            date: { start: room.date },
          },
          Location: {
            rich_text: [{ text: { content: room.location } }],
          },
          Price: {
            number: room.price,
          },
          Capacity: {
            number: room.capacity,
          },
          'RSVP Count': {
            number: room.rsvpCount,
          },
          Status: {
            select: { name: room.status },
          },
          Host: {
            rich_text: [{ text: { content: room.host } }],
          },
        },
      })
      console.log(`✓ Created: ${room.name}`)
    } catch (error) {
      console.error(`✗ Failed to create ${room.name}:`, error)
    }
  }

  console.log('Done!')
}

seedRooms()
