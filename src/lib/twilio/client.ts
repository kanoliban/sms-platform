import twilio from 'twilio'

// Lazy-load client to avoid initialization during build
let _client: ReturnType<typeof twilio> | null = null

function getClient() {
  if (!_client) {
    const accountSid = process.env.TWILIO_ACCOUNT_SID
    const authToken = process.env.TWILIO_AUTH_TOKEN

    if (!accountSid || !authToken) {
      throw new Error('Twilio credentials not configured')
    }

    _client = twilio(accountSid, authToken)
  }
  return _client
}

function getFromNumber(): string {
  const phoneNumber = process.env.TWILIO_PHONE_NUMBER
  if (!phoneNumber) {
    throw new Error('TWILIO_PHONE_NUMBER not configured')
  }
  return phoneNumber
}

export async function sendSms(to: string, body: string): Promise<string> {
  try {
    const client = getClient()
    const message = await client.messages.create({
      body,
      from: getFromNumber(),
      to: normalizePhoneNumber(to),
    })
    console.log(`SMS sent: ${message.sid} to ${to}`)
    return message.sid
  } catch (error) {
    console.error('Failed to send SMS:', error)
    throw error
  }
}

export function normalizePhoneNumber(phone: string): string {
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '')

  // If it's already in E.164 format (starts with 1 and has 11 digits)
  if (digits.length === 11 && digits.startsWith('1')) {
    return `+${digits}`
  }

  // If it's a 10-digit US number, add +1
  if (digits.length === 10) {
    return `+1${digits}`
  }

  // If it starts with +, assume it's already formatted
  if (phone.startsWith('+')) {
    return phone
  }

  // Default: return with + prefix
  return `+${digits}`
}

export function validateTwilioSignature(
  signature: string,
  url: string,
  params: Record<string, string>
): boolean {
  const authToken = process.env.TWILIO_AUTH_TOKEN
  if (!authToken) {
    throw new Error('TWILIO_AUTH_TOKEN not configured')
  }
  return twilio.validateRequest(authToken, signature, url, params)
}
