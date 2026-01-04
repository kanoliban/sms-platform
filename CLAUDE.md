# SMS Platform - Claude Code Guidelines

## Brand: SMS (Strangers Meeting Strangers)

### SMS Brand Name Styling
When displaying "SMS" as the brand name in UI components, **always** apply this styling:
- **Bold** + **Italic** + **White text**

**React/TSX Pattern:**
```tsx
<strong className="text-white"><em>SMS</em></strong>
```

**Helper function (for dynamic text):**
```tsx
function styleSMS(text: string) {
  const parts = text.split(/(SMS)/g)
  return parts.map((part, i) => {
    if (part === 'SMS') {
      return <strong key={i} className="text-white"><em>SMS</em></strong>
    }
    return part
  })
}

// Usage: {styleSMS("Welcome to SMS hosting")}
```

### When to Apply SMS Branding
- Modal titles and headers mentioning "SMS"
- Terms and legal documents referencing "SMS"
- Onboarding flows and welcome messages
- Marketing copy and descriptions
- Navigation items (e.g., "What is SMS?")

### Avoid Brand Confusion
- Do NOT use "an SMS" when referring to text messages (use "a text message" instead)
- "SMS" as the brand should always be styled; "SMS" as a technology term should be avoided

## Tech Stack
- Next.js 14+ with App Router
- TypeScript (strict mode)
- Tailwind CSS with CSS variables
- Supabase (auth + database)
- Vercel deployment

## Code Style
- Use functional components with hooks
- Prefer `const` over `let`, never `var`
- Use explicit return types on functions
- Prefer early returns over nested conditionals

## Testing
- Dev login API: `POST /api/dev/login` with `{ role: "guest" | "host" | "founder" }`
- Reset user: `DELETE /api/dev/login` with `{ phone: "+15550000001" }`
