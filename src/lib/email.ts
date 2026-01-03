import { Resend } from 'resend'

// Lazy initialization to avoid build-time errors
let resendClient: Resend | null = null

function getResend(): Resend {
  if (!resendClient) {
    resendClient = new Resend(process.env.RESEND_API_KEY)
  }
  return resendClient
}

// Use verified domain or Resend's test domain
const FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'SMS <onboarding@resend.dev>'

// ============================================
// EMAIL SENDING FUNCTIONS
// ============================================

export async function sendWelcomeEmail(
  to: string,
  name: string,
  type: 'host' | 'attendee'
) {
  const isHost = type === 'host'
  const subject = isHost
    ? "Welcome to SMS — You're in the host queue!"
    : "Welcome to SMS — You're in the pool!"

  const html = isHost ? getHostWelcomeHtml(name) : getAttendeeWelcomeHtml(name)
  const text = isHost ? getHostWelcomeText(name) : getAttendeeWelcomeText(name)

  return sendEmail(to, subject, html, text)
}

export async function sendEventInvitation(
  to: string,
  name: string,
  event: {
    title: string
    date: string
    time: string
    location: string
    price: number
    spotsLeft: number
    rsvpUrl: string
  }
) {
  const subject = `${event.title} — ${event.date} ${event.time}`
  const html = getEventInvitationHtml(name, event)
  const text = getEventInvitationText(name, event)

  return sendEmail(to, subject, html, text)
}

export async function sendRsvpConfirmation(
  to: string,
  name: string,
  event: {
    title: string
    date: string
    time: string
    price: number
  }
) {
  const subject = `You're in — ${event.title}`
  const html = getRsvpConfirmationHtml(name, event)
  const text = getRsvpConfirmationText(name, event)

  return sendEmail(to, subject, html, text)
}

export async function sendEventReminder(
  to: string,
  name: string,
  event: {
    title: string
    date: string
    time: string
    location?: string
  }
) {
  const subject = `Tomorrow: ${event.title}`
  const html = getEventReminderHtml(name, event)
  const text = getEventReminderText(name, event)

  return sendEmail(to, subject, html, text)
}

export async function sendLocationReveal(
  to: string,
  name: string,
  event: {
    title: string
    date: string
    time: string
    address: string
    hostName: string
    hostPhone?: string
    instructions?: string
  }
) {
  const subject = `📍 Location revealed — ${event.title}`
  const html = getLocationRevealHtml(name, event)
  const text = getLocationRevealText(name, event)

  return sendEmail(to, subject, html, text)
}

export async function sendPostEventFollowUp(
  to: string,
  name: string,
  event: {
    title: string
    feedbackUrl: string
  }
) {
  const subject = `How was ${event.title}?`
  const html = getPostEventHtml(name, event)
  const text = getPostEventText(name, event)

  return sendEmail(to, subject, html, text)
}

export async function sendWaitlistNotification(
  to: string,
  name: string,
  event: {
    title: string
    date: string
    time: string
    rsvpUrl: string
  }
) {
  const subject = `A spot opened up — ${event.title}`
  const html = getWaitlistNotificationHtml(name, event)
  const text = getWaitlistNotificationText(name, event)

  return sendEmail(to, subject, html, text)
}

export async function sendHostApproved(
  to: string,
  name: string,
  dashboardUrl: string
) {
  const subject = "You're approved to host!"
  const html = getHostApprovedHtml(name, dashboardUrl)
  const text = getHostApprovedText(name, dashboardUrl)

  return sendEmail(to, subject, html, text)
}

// ============================================
// CORE EMAIL FUNCTION
// ============================================

async function sendEmail(to: string, subject: string, html: string, text: string) {
  try {
    const { data, error } = await getResend().emails.send({
      from: FROM_EMAIL,
      to,
      subject,
      html,
      text,
    })

    if (error) {
      console.error('Resend error:', error)
      return { success: false, error }
    }

    return { success: true, data }
  } catch (error) {
    console.error('Email send error:', error)
    return { success: false, error }
  }
}

// ============================================
// EMAIL WRAPPER (consistent styling)
// ============================================

function emailWrapper(content: string): string {
  return `
<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
</head>
<body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f5f5f5;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 40px 20px;">
    <tr>
      <td align="center">
        <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
          <!-- Header -->
          <tr>
            <td style="background-color: #000000; padding: 40px 40px 30px 40px; text-align: center;">
              <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
                SMS
              </h1>
              <p style="margin: 8px 0 0 0; color: #888888; font-size: 14px;">
                Strangers Meeting Strangers
              </p>
            </td>
          </tr>

          <!-- Body -->
          <tr>
            <td style="padding: 40px;">
              ${content}
            </td>
          </tr>

          <!-- Footer -->
          <tr>
            <td style="background-color: #fafafa; padding: 30px 40px; border-top: 1px solid #eeeeee;">
              <p style="margin: 0 0 10px 0; color: #888888; font-size: 13px; text-align: center;">
                © 2026 Strangers Meeting Strangers
              </p>
              <p style="margin: 0; color: #888888; font-size: 13px; text-align: center;">
                <a href="https://strangersmeetingstrangers.com/privacy" style="color: #666666; text-decoration: underline;">Privacy</a>
                &nbsp;·&nbsp;
                <a href="https://strangersmeetingstrangers.com/terms" style="color: #666666; text-decoration: underline;">Terms</a>
              </p>
            </td>
          </tr>
        </table>
      </td>
    </tr>
  </table>
</body>
</html>
`
}

function ctaButton(text: string, url: string): string {
  return `
<table width="100%" cellpadding="0" cellspacing="0" style="margin: 30px 0;">
  <tr>
    <td align="center">
      <a href="${url}" style="display: inline-block; background-color: #000000; color: #ffffff; font-size: 16px; font-weight: 600; text-decoration: none; padding: 14px 32px; border-radius: 8px;">
        ${text}
      </a>
    </td>
  </tr>
</table>
`
}

function highlightBox(content: string): string {
  return `
<div style="background-color: #f8f8f8; border-radius: 8px; padding: 20px; margin: 24px 0;">
  <p style="margin: 0; color: #666666; font-size: 15px; line-height: 1.6;">
    ${content}
  </p>
</div>
`
}

// ============================================
// WELCOME EMAILS
// ============================================

function getAttendeeWelcomeHtml(name: string): string {
  return emailWrapper(`
    <h2 style="margin: 0 0 20px 0; color: #000000; font-size: 24px; font-weight: 600;">
      Hey ${name}!
    </h2>
    <p style="margin: 0 0 20px 0; color: #444444; font-size: 16px; line-height: 1.6;">
      You're in the pool. That's it.
    </p>
    <p style="margin: 0 0 20px 0; color: #444444; font-size: 16px; line-height: 1.6;">
      No more scrolling. No more evaluating. You told us what you're into—once.
    </p>
    <p style="margin: 0 0 20px 0; color: #444444; font-size: 16px; line-height: 1.6;">
      Now you wait. Not for a feed. For a text.
    </p>
    ${highlightBox('"Friday 7pm. Strangers & Supper. 8 people. $40. Northeast Minneapolis. You\'re free. Want in?"')}
    <p style="margin: 0 0 20px 0; color: #444444; font-size: 16px; line-height: 1.6;">
      You reply yes. That's it. You show up.
    </p>
    <p style="margin: 30px 0 0 0; color: #444444; font-size: 16px; line-height: 1.6;">
      Keep your phone close,<br>
      <strong>SMS</strong>
    </p>
  `)
}

function getHostWelcomeHtml(name: string): string {
  return emailWrapper(`
    <h2 style="margin: 0 0 20px 0; color: #000000; font-size: 24px; font-weight: 600;">
      Hey ${name}!
    </h2>
    <p style="margin: 0 0 20px 0; color: #444444; font-size: 16px; line-height: 1.6;">
      We got your application. You want to create a space where strangers meet.
    </p>
    <p style="margin: 0 0 20px 0; color: #444444; font-size: 16px; line-height: 1.6;">
      Here's what that looks like:
    </p>
    ${highlightBox('"Dinner for 8. Saturday 7pm. $40. Creatives only."')}
    <p style="margin: 0 0 20px 0; color: #444444; font-size: 16px; line-height: 1.6;">
      You text the idea. We find the strangers. They show up. You host. You get paid.
    </p>
    <p style="margin: 0 0 20px 0; color: #444444; font-size: 16px; line-height: 1.6;">
      We've done this 35+ times. Now we're giving you the infrastructure.
    </p>
    <p style="margin: 0 0 20px 0; color: #444444; font-size: 16px; line-height: 1.6;">
      <strong>What's next?</strong> We'll review your application and reach out within 48 hours to chat about your first space.
    </p>
    <p style="margin: 30px 0 0 0; color: #444444; font-size: 16px; line-height: 1.6;">
      Talk soon,<br>
      <strong>SMS</strong>
    </p>
  `)
}

function getAttendeeWelcomeText(name: string): string {
  return `Hey ${name}!

You're in the pool. That's it.

No more scrolling. No more evaluating. You told us what you're into—once.

Now you wait. Not for a feed. For a text.

"Friday 7pm. Strangers & Supper. 8 people. $40. Northeast Minneapolis. You're free. Want in?"

You reply yes. That's it. You show up.

Keep your phone close,
SMS

---
© 2026 Strangers Meeting Strangers
https://strangersmeetingstrangers.com`
}

function getHostWelcomeText(name: string): string {
  return `Hey ${name}!

We got your application. You want to create a space where strangers meet.

Here's what that looks like:

"Dinner for 8. Saturday 7pm. $40. Creatives only."

You text the idea. We find the strangers. They show up. You host. You get paid.

We've done this 35+ times. Now we're giving you the infrastructure.

What's next? We'll review your application and reach out within 48 hours to chat about your first space.

Talk soon,
SMS

---
© 2026 Strangers Meeting Strangers
https://strangersmeetingstrangers.com`
}

// ============================================
// EVENT INVITATION
// ============================================

function getEventInvitationHtml(name: string, event: {
  title: string
  date: string
  time: string
  location: string
  price: number
  spotsLeft: number
  rsvpUrl: string
}): string {
  const priceText = event.price === 0 ? 'Free' : `$${event.price}`
  const spotsText = event.spotsLeft === 1 ? '1 spot left' : `${event.spotsLeft} spots left`

  return emailWrapper(`
    <h2 style="margin: 0 0 20px 0; color: #000000; font-size: 24px; font-weight: 600;">
      Hey ${name}!
    </h2>
    <p style="margin: 0 0 20px 0; color: #444444; font-size: 16px; line-height: 1.6;">
      We found something for you.
    </p>
    ${highlightBox(`
      <strong style="color: #000000; font-size: 18px;">${event.title}</strong><br><br>
      📅 ${event.date} at ${event.time}<br>
      📍 ${event.location}<br>
      💰 ${priceText}<br>
      👥 ${spotsText}
    `)}
    <p style="margin: 0 0 20px 0; color: #444444; font-size: 16px; line-height: 1.6;">
      You in?
    </p>
    ${ctaButton("I'm In", event.rsvpUrl)}
    <p style="margin: 30px 0 0 0; color: #888888; font-size: 14px; line-height: 1.6;">
      If you can't make it, no worries. We'll find you another one.
    </p>
  `)
}

function getEventInvitationText(name: string, event: {
  title: string
  date: string
  time: string
  location: string
  price: number
  spotsLeft: number
  rsvpUrl: string
}): string {
  const priceText = event.price === 0 ? 'Free' : `$${event.price}`
  return `Hey ${name}!

We found something for you.

${event.title}
${event.date} at ${event.time}
${event.location}
${priceText}
${event.spotsLeft} spots left

You in? RSVP here: ${event.rsvpUrl}

If you can't make it, no worries. We'll find you another one.

---
© 2026 Strangers Meeting Strangers
https://strangersmeetingstrangers.com`
}

// ============================================
// RSVP CONFIRMATION
// ============================================

function getRsvpConfirmationHtml(name: string, event: {
  title: string
  date: string
  time: string
  price: number
}): string {
  const priceText = event.price === 0 ? 'Free' : `$${event.price}`

  return emailWrapper(`
    <h2 style="margin: 0 0 20px 0; color: #000000; font-size: 24px; font-weight: 600;">
      You're in, ${name}!
    </h2>
    <p style="margin: 0 0 20px 0; color: #444444; font-size: 16px; line-height: 1.6;">
      Your spot is confirmed.
    </p>
    ${highlightBox(`
      <strong style="color: #000000; font-size: 18px;">${event.title}</strong><br><br>
      📅 ${event.date} at ${event.time}<br>
      💰 ${priceText}
    `)}
    <p style="margin: 0 0 20px 0; color: #444444; font-size: 16px; line-height: 1.6;">
      <strong>What happens next?</strong>
    </p>
    <ul style="margin: 0 0 20px 0; padding-left: 20px; color: #444444; font-size: 16px; line-height: 1.8;">
      <li>You'll get a reminder the day before</li>
      <li>The exact address will be revealed 2 hours before the event</li>
      <li>Show up. Meet strangers. That's it.</li>
    </ul>
    <p style="margin: 30px 0 0 0; color: #444444; font-size: 16px; line-height: 1.6;">
      See you there,<br>
      <strong>SMS</strong>
    </p>
  `)
}

function getRsvpConfirmationText(name: string, event: {
  title: string
  date: string
  time: string
  price: number
}): string {
  const priceText = event.price === 0 ? 'Free' : `$${event.price}`
  return `You're in, ${name}!

Your spot is confirmed.

${event.title}
${event.date} at ${event.time}
${priceText}

What happens next?
- You'll get a reminder the day before
- The exact address will be revealed 2 hours before the event
- Show up. Meet strangers. That's it.

See you there,
SMS

---
© 2026 Strangers Meeting Strangers
https://strangersmeetingstrangers.com`
}

// ============================================
// EVENT REMINDER (Day Before)
// ============================================

function getEventReminderHtml(name: string, event: {
  title: string
  date: string
  time: string
  location?: string
}): string {
  return emailWrapper(`
    <h2 style="margin: 0 0 20px 0; color: #000000; font-size: 24px; font-weight: 600;">
      Tomorrow, ${name}.
    </h2>
    ${highlightBox(`
      <strong style="color: #000000; font-size: 18px;">${event.title}</strong><br><br>
      📅 ${event.date} at ${event.time}<br>
      ${event.location ? `📍 ${event.location}` : '📍 Address coming tomorrow'}
    `)}
    <p style="margin: 0 0 20px 0; color: #444444; font-size: 16px; line-height: 1.6;">
      The exact address will be sent 2 hours before the event.
    </p>
    <p style="margin: 0 0 20px 0; color: #444444; font-size: 16px; line-height: 1.6;">
      Can't make it? Reply to this email and let us know so someone else can take your spot.
    </p>
    <p style="margin: 30px 0 0 0; color: #444444; font-size: 16px; line-height: 1.6;">
      See you soon,<br>
      <strong>SMS</strong>
    </p>
  `)
}

function getEventReminderText(name: string, event: {
  title: string
  date: string
  time: string
  location?: string
}): string {
  return `Tomorrow, ${name}.

${event.title}
${event.date} at ${event.time}
${event.location || 'Address coming tomorrow'}

The exact address will be sent 2 hours before the event.

Can't make it? Reply to this email and let us know so someone else can take your spot.

See you soon,
SMS

---
© 2026 Strangers Meeting Strangers
https://strangersmeetingstrangers.com`
}

// ============================================
// LOCATION REVEAL (2 Hours Before)
// ============================================

function getLocationRevealHtml(name: string, event: {
  title: string
  date: string
  time: string
  address: string
  hostName: string
  hostPhone?: string
  instructions?: string
}): string {
  return emailWrapper(`
    <h2 style="margin: 0 0 20px 0; color: #000000; font-size: 24px; font-weight: 600;">
      📍 Here's where you're going, ${name}
    </h2>
    ${highlightBox(`
      <strong style="color: #000000; font-size: 18px;">${event.title}</strong><br><br>
      📅 Today at ${event.time}<br>
      📍 <strong>${event.address}</strong><br>
      👋 Your host: ${event.hostName}${event.hostPhone ? `<br>📱 ${event.hostPhone}` : ''}
    `)}
    ${event.instructions ? `
    <p style="margin: 0 0 20px 0; color: #444444; font-size: 16px; line-height: 1.6;">
      <strong>From your host:</strong><br>
      ${event.instructions}
    </p>
    ` : ''}
    ${ctaButton('Get Directions', `https://maps.google.com/?q=${encodeURIComponent(event.address)}`)}
    <p style="margin: 30px 0 0 0; color: #444444; font-size: 16px; line-height: 1.6;">
      Have fun meeting strangers,<br>
      <strong>SMS</strong>
    </p>
  `)
}

function getLocationRevealText(name: string, event: {
  title: string
  date: string
  time: string
  address: string
  hostName: string
  hostPhone?: string
  instructions?: string
}): string {
  return `Here's where you're going, ${name}

${event.title}
Today at ${event.time}
${event.address}
Your host: ${event.hostName}${event.hostPhone ? ` (${event.hostPhone})` : ''}

${event.instructions ? `From your host: ${event.instructions}\n\n` : ''}Get directions: https://maps.google.com/?q=${encodeURIComponent(event.address)}

Have fun meeting strangers,
SMS

---
© 2026 Strangers Meeting Strangers
https://strangersmeetingstrangers.com`
}

// ============================================
// POST-EVENT FOLLOW-UP
// ============================================

function getPostEventHtml(name: string, event: {
  title: string
  feedbackUrl: string
}): string {
  return emailWrapper(`
    <h2 style="margin: 0 0 20px 0; color: #000000; font-size: 24px; font-weight: 600;">
      How was it, ${name}?
    </h2>
    <p style="margin: 0 0 20px 0; color: #444444; font-size: 16px; line-height: 1.6;">
      You showed up to <strong>${event.title}</strong>. You met strangers.
    </p>
    <p style="margin: 0 0 20px 0; color: #444444; font-size: 16px; line-height: 1.6;">
      We'd love to hear how it went. Takes 30 seconds.
    </p>
    ${ctaButton('Share Your Thoughts', event.feedbackUrl)}
    <p style="margin: 30px 0 0 0; color: #444444; font-size: 16px; line-height: 1.6;">
      Thanks for being part of this,<br>
      <strong>SMS</strong>
    </p>
  `)
}

function getPostEventText(name: string, event: {
  title: string
  feedbackUrl: string
}): string {
  return `How was it, ${name}?

You showed up to ${event.title}. You met strangers.

We'd love to hear how it went. Takes 30 seconds.

Share your thoughts: ${event.feedbackUrl}

Thanks for being part of this,
SMS

---
© 2026 Strangers Meeting Strangers
https://strangersmeetingstrangers.com`
}

// ============================================
// WAITLIST NOTIFICATION
// ============================================

function getWaitlistNotificationHtml(name: string, event: {
  title: string
  date: string
  time: string
  rsvpUrl: string
}): string {
  return emailWrapper(`
    <h2 style="margin: 0 0 20px 0; color: #000000; font-size: 24px; font-weight: 600;">
      A spot just opened, ${name}!
    </h2>
    <p style="margin: 0 0 20px 0; color: #444444; font-size: 16px; line-height: 1.6;">
      Someone dropped out of <strong>${event.title}</strong>. Their loss, your gain.
    </p>
    ${highlightBox(`
      <strong style="color: #000000; font-size: 18px;">${event.title}</strong><br><br>
      📅 ${event.date} at ${event.time}
    `)}
    <p style="margin: 0 0 20px 0; color: #444444; font-size: 16px; line-height: 1.6;">
      Claim it before someone else does.
    </p>
    ${ctaButton('Claim My Spot', event.rsvpUrl)}
    <p style="margin: 30px 0 0 0; color: #888888; font-size: 14px; line-height: 1.6;">
      First come, first served. This spot won't last.
    </p>
  `)
}

function getWaitlistNotificationText(name: string, event: {
  title: string
  date: string
  time: string
  rsvpUrl: string
}): string {
  return `A spot just opened, ${name}!

Someone dropped out of ${event.title}. Their loss, your gain.

${event.title}
${event.date} at ${event.time}

Claim it before someone else does: ${event.rsvpUrl}

First come, first served. This spot won't last.

---
© 2026 Strangers Meeting Strangers
https://strangersmeetingstrangers.com`
}

// ============================================
// HOST APPROVED
// ============================================

function getHostApprovedHtml(name: string, dashboardUrl: string): string {
  return emailWrapper(`
    <h2 style="margin: 0 0 20px 0; color: #000000; font-size: 24px; font-weight: 600;">
      You're in, ${name}!
    </h2>
    <p style="margin: 0 0 20px 0; color: #444444; font-size: 16px; line-height: 1.6;">
      Your host application has been approved. Welcome to the other side.
    </p>
    <p style="margin: 0 0 20px 0; color: #444444; font-size: 16px; line-height: 1.6;">
      Here's what you can do now:
    </p>
    <ul style="margin: 0 0 20px 0; padding-left: 20px; color: #444444; font-size: 16px; line-height: 1.8;">
      <li>Create your first space</li>
      <li>Set your price and capacity</li>
      <li>We'll find the strangers</li>
      <li>You host. You get paid.</li>
    </ul>
    ${ctaButton('Go to Host Dashboard', dashboardUrl)}
    <p style="margin: 30px 0 0 0; color: #444444; font-size: 16px; line-height: 1.6;">
      Let's create something,<br>
      <strong>SMS</strong>
    </p>
  `)
}

function getHostApprovedText(name: string, dashboardUrl: string): string {
  return `You're in, ${name}!

Your host application has been approved. Welcome to the other side.

Here's what you can do now:
- Create your first space
- Set your price and capacity
- We'll find the strangers
- You host. You get paid.

Go to your dashboard: ${dashboardUrl}

Let's create something,
SMS

---
© 2026 Strangers Meeting Strangers
https://strangersmeetingstrangers.com`
}
