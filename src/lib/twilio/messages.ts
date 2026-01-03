// SMS Message Templates for SMS Platform
// All messages are designed for brevity and clarity

interface ContractInviteParams {
  spaceName: string
  hostName: string
  date: Date
  time: string
  locationHint: string
  priceDollars: number
}

export function contractInviteMessage(params: ContractInviteParams): string {
  const { spaceName, hostName, date, time, locationHint, priceDollars } = params
  const dateStr = date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

  return `SMS ROOM INVITATION

You're invited to: ${spaceName}
Hosted by: ${hostName}
${dateStr} at ${time} · ${locationHint}

This is a space where strangers meet with intention.

BY ACCEPTING, YOU COMMIT TO:
• Confidentiality - what's shared stays here
• Presence - phone away, attention here
• Non-transactional - no networking

Your card will be charged $${priceDollars} only after you attend.

Reply ACCEPT to join or DECLINE to pass.

Cancel 48+ hours before: no charge.`
}

interface AcceptedParams {
  spaceName: string
  date: Date
  time: string
}

export function acceptedMessage(params: AcceptedParams): string {
  const { spaceName, date, time } = params
  const dateStr = date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

  return `You're in.

${spaceName}
${dateStr} at ${time}

The full address will be sent 24 hours before.

Remember: What's shared in the space stays in the space.

See you there.`
}

interface DeclinedParams {
  spaceName: string
}

export function declinedMessage(params: DeclinedParams): string {
  return `Got it. You've declined the invitation to ${params.spaceName}.

We hope to see you at a future space. Reply HELP anytime if you have questions.`
}

export function paymentLinkMessage(checkoutUrl: string): string {
  return `Complete your reservation:
${checkoutUrl}

Your card will only be charged after you attend.`
}

interface ConfirmationAfterPaymentParams {
  spaceName: string
  date: Date
  time: string
  locationHint: string
}

export function confirmationAfterPaymentMessage(params: ConfirmationAfterPaymentParams): string {
  const { spaceName, date, time, locationHint } = params
  const dateStr = date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return `Your spot is confirmed.

${spaceName}
${dateStr} at ${time}
${locationHint}

The exact address will arrive 24 hours before.

Three agreements you made:
1. Confidentiality
2. Presence
3. Non-transactional

See you there.`
}

interface LocationRevealParams {
  spaceName: string
  date: Date
  time: string
  address: string
  hostName: string
}

export function locationRevealMessage(params: LocationRevealParams): string {
  const { spaceName, date, time, address, hostName } = params
  const dateStr = date.toLocaleDateString('en-US', {
    weekday: 'long',
    month: 'long',
    day: 'numeric',
  })

  return `Your space is tomorrow.

${spaceName}
${dateStr} at ${time}

ADDRESS:
${address}

Hosted by ${hostName}

Reminders:
• Arrive 5 min early
• Phone goes away at start
• What's shared stays here

See you there.`
}

interface HostLocationReminderParams {
  spaceName: string
  guestCount: number
  date: Date
  time: string
}

export function hostLocationReminderMessage(params: HostLocationReminderParams): string {
  const { spaceName, guestCount, date, time } = params
  const dateStr = date.toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })

  return `TOMORROW: ${spaceName}
${dateStr} at ${time}
${guestCount} confirmed guests

Guests have received the address.

Your first prompt arrives 2 hours before start.

Your calm sets the space's calm.`
}

// Pocket Liban Prompts - Sent to hosts at key moments
export const pocketLibanPrompts = {
  pre_space: {
    timing: -120, // 2 hours before
    message: `Your space starts in 2 hours.

Take a breath. Your energy sets the space's energy.

Quick checklist:
□ Space is ready (chairs, minimal clutter)
□ Water/drinks accessible
□ Phones collected at the door
□ You feel calm

Your calm sets the space's calm.`,
  },

  opening: {
    timing: 0, // At start time
    message: `Time to open.

OPENING CONTAINER (say this or similar):

"Welcome to SMS. This is a space where strangers meet with intention.

Before we begin, three agreements:

1. CONFIDENTIALITY - What's shared here stays here. No photos, no social media, no telling others who was here or what they said.

2. PRESENCE - Phones are away. Not on the table—away. If you need to check something urgent, step outside.

3. NON-TRANSACTIONAL - We're not here to network, sell, or exchange contacts. We're here to connect as humans.

By staying, you agree to these terms.

Now: your name, something true about today, and one thing you're leaving at the door."`,
  },

  check_in: {
    timing: 15, // 15 min in
    message: `Quick check:

• Is everyone present (not on phone)?
• Anyone dominating the conversation?
• Anyone too quiet?

If someone's on their phone, gentle reminder:
"Hey, phones away please."

If someone's dominating:
"Let's hear from someone who hasn't spoken yet."

You're doing great.`,
  },

  energy_check: {
    timing: 60, // 1 hour in
    message: `Halfway point.

How's the energy?

If conversation is lagging:
"What's something you've never told a stranger before?"

If things are too surface:
"What are you actually afraid of?"

If it's flowing well:
Let it flow. You don't need to do anything.`,
  },

  closing_warning: {
    timing: -30, // 30 min before end
    message: `30 minutes left.

Start winding down naturally. Don't cut off conversation abruptly.

If deep conversation is happening, let it finish.

Prepare for closing ritual in 15-20 minutes.`,
  },

  closing: {
    timing: -10, // 10 min before end
    message: `Time to close.

CLOSING RITUAL:

"Before we go, let's close the container.

Go around: One word for what you're taking with you from tonight."

After everyone shares:

"Thank you for being here. Remember: what was shared stays here.

If you feel called to connect with someone, do it the old way—ask them in person before you leave.

From one stranger to another."

You did it.`,
  },
}

// Schedule prompts for a space
export function schedulePocketLibanPrompts(spaceId: string, spaceDateTime: Date): Array<{
  space_id: string
  prompt_type: string
  message: string
  send_at: string
  sent: boolean
}> {
  const prompts: Array<{
    space_id: string
    prompt_type: string
    message: string
    send_at: string
    sent: boolean
  }> = []

  for (const [type, prompt] of Object.entries(pocketLibanPrompts)) {
    const sendAt = new Date(spaceDateTime.getTime() + prompt.timing * 60 * 1000)

    prompts.push({
      space_id: spaceId,
      prompt_type: type,
      message: prompt.message,
      send_at: sendAt.toISOString(),
      sent: false,
    })
  }

  return prompts
}

// Feedback request messages
interface FeedbackRequestParams {
  spaceName: string
  guestName: string
}

export function guestFeedbackRequest(params: FeedbackRequestParams): string {
  return `Thanks for attending ${params.spaceName}!

Quick feedback (takes 30 seconds):

Did this feel different from typical social events?

Reply:
A) Much different
B) Somewhat
C) Not really`
}

export function hostFeedbackRequest(spaceName: string): string {
  return `How did ${spaceName} go?

Did it feel like an SMS space?

Reply:
1) Yes, it felt like SMS
2) Mostly, with some rough spots
3) Not quite`
}

// Follow-up feedback based on responses
export const guestFeedbackFollowups = {
  felt_different: {
    A: 'Great! Did you share something you normally wouldn\'t?\n\nReply: Y/N',
    B: 'Thanks. Were the three agreements (confidentiality, presence, non-transactional) followed?\n\nReply:\nA) Completely\nB) Mostly\nC) There were issues',
    C: 'Thanks for the honesty. What would have made it feel more meaningful?\n\n(Reply with your thoughts)',
  },
  shared_something: {
    Y: 'That\'s what it\'s about. Would you attend another SMS space?\n\nReply:\nA) Definitely\nB) Maybe\nC) Probably not',
    N: 'That\'s okay. Would you attend another SMS space?\n\nReply:\nA) Definitely\nB) Maybe\nC) Probably not',
  },
}

export const hostFeedbackFollowups = {
  felt_like_sms: {
    '1': 'Great! Did the Pocket Liban prompts help?\n\nReply:\nA) Very helpful\nB) Somewhat\nC) Not really\nD) Didn\'t use them',
    '2': 'What felt off? Any difficult guests or moments?\n\n(Reply with your thoughts)',
    '3': 'What would have helped? What do you need from us?\n\n(Reply with your thoughts)',
  },
}

// Reminder messages
export function reminder24hMessage(spaceName: string, time: string): string {
  return `Reminder: ${spaceName} is tomorrow at ${time}.

The address will arrive in a few hours.

Looking forward to seeing you there.`
}

export function reminder2hMessage(spaceName: string, address: string): string {
  return `${spaceName} starts in 2 hours.

Address: ${address}

See you soon.`
}
