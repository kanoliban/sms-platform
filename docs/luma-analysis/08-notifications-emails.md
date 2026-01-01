# Notifications & Emails Analysis

> **Category:** 07-notifications-emails (10 images)
> **Screens:** Newsletter management, email stats, payment settings

---

## 1. Newsletter Tab Overview

### Newsletter List Layout
```
┌────────────────────────────────────────────────────────────────┐
│  🔲 Demo Product Session                     Calendar Page ↗   │
│  [Events] [People] [Newsletters] [Insights] [Settings]         │
│                     ───────────                                 │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  Drafts                                                        │
│  As you write, your drafts are saved automatically             │
│                                                                │
│  [+ New Draft]                                                 │
│                                                                │
│  ─────────────────────────────────────────────────────────────│
│                                                                │
│  Published                                                     │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ Exciting Updates Ahead!                              ⋯   │ │
│  │ November 12, 2024                                        │ │
│  │                                                          │ │
│  │ We're thrilled to share the latest improvements...       │ │
│  │                                                          │ │
│  │ Sent    Opens                                            │ │
│  │ 6       1 17%                           📊 View Stats    │ │
│  └──────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

| Element | Specification |
|---------|---------------|
| **Drafts Section** | Auto-save messaging, "+ New Draft" button |
| **Published List** | Cards with title, date, preview text |
| **Stats Summary** | Sent count + Opens with percentage |
| **View Stats** | Link to detailed analytics |

---

## 2. Email Preview Modal

```
┌────────────────────────────────────────────────────────────────┐
│  Exciting Updates Ahead! Discover What's New in Our Product ✕  │
├────────────────────────────────────────────────────────────────┤
│  🔲 Demo Product Session                                       │
│                                                                │
│  Exciting Updates Ahead! Discover                              │
│  What's New in Our Product                                     │
│                                                                │
│  We're thrilled to share the latest improvements and features  │
│  designed to enhance your experience. Dive in to explore the   │
│  updates and learn how they can benefit you!                   │
│                                                                │
│  ─────────────────────────────────────────────────────────────│
│                                                                │
│  luma                                           Unsubscribe    │
│  Host your event with Luma ↗                                   │
│                                                                │
│  ─────────────────────────────────────────────────────────────│
│                                                                │
│  Email ID emsent-uH8NRntxgoCTXHvaFdiB                         │
│                                                                │
│  ┌──────────────────────────────────────────────────────────┐ │
│  │ 👤 Sam Lee                                    Delivered   │ │
│  │    samlee.mobbin+1@gmail.com                             │ │
│  └──────────────────────────────────────────────────────────┘ │
└────────────────────────────────────────────────────────────────┘
```

| Element | Specification |
|---------|---------------|
| **Header** | Email subject line + close button |
| **Calendar Badge** | Source calendar with icon |
| **Email Content** | Full preview of sent email |
| **Footer** | Luma branding + Unsubscribe link |
| **Recipient Row** | Avatar, name, email, status badge |

---

## 3. Email Stats Modal

```
┌────────────────────────────────────────────────────────────────┐
│  Email Stats                                               ✕   │
├────────────────────────────────────────────────────────────────┤
│                                                                │
│  ┌─────────────────────┐  ┌─────────────────────┐             │
│  │        6            │  │      33%            │             │
│  │      Sent           │  │    Open Rate        │             │
│  └─────────────────────┘  └─────────────────────┘             │
│                                                                │
│  Recipients                                                    │
│                                                                │
│  👤 John Doe                                        Delivered  │
│     johndoe.mobbin+1@gmail.com                                │
│                                                                │
│  👤 Sam Lee                                         Opened     │
│     samlee.mobbin+1@gmail.com                                 │
│                                                                │
│  👤 Jane Smith                                      Delivered  │
│     janesmith@example.com                                     │
│                                                                │
└────────────────────────────────────────────────────────────────┘
```

### Stats Cards
| Stat | Display |
|------|---------|
| **Sent** | Large number in card |
| **Open Rate** | Percentage with visual emphasis |

### Recipient Status Badges
| Status | Color | Meaning |
|--------|-------|---------|
| **Delivered** | Blue (`#3b82f6`) | Email sent successfully |
| **Opened** | Green (`#22c55e`) | Recipient opened email |
| **Bounced** | Red (`#ef4444`) | Delivery failed |

---

## 4. Calendar Payment Settings

### Payment Tab Layout
```
┌────────────────────────────────────────────────────────────────┐
│  🔲 Demo Product Session                     Calendar Page ↗   │
│  [Events] [People] [Newsletters] [Insights] [Settings]         │
│                                              ─────────         │
├───────────────┬────────────────────────────────────────────────┤
│ ✨ Display    │  Ticket Sales                                  │
│ $ Payment ◄   │                                                │
│ ⚙️ Options    │  ┌──────────────────────────────────────────┐ │
│ 👥 Admins     │  │ ✦ + stripe                               │ │
│ 🏷️ Tags       │  │                                          │ │
│ 📦 Embed      │  │ Start Selling Tickets                    │ │
│ ⏱️ Send Limit │  │ Start selling tickets to your events by  │ │
│ 💜 Luma Plus  │  │ creating a Stripe account. It usually    │ │
│               │  │ takes less than 5 minutes to set up.     │ │
│               │  │                                          │ │
│               │  │ [Get Started ↗]                          │ │
│               │  └──────────────────────────────────────────┘ │
│               │                                                │
│               │  Stripe is a secure payment processor with    │
│               │  low fees that handles all of Luma's sales.   │
│               │                                                │
│               │  ─────────────────────────────────────────────│
│               │                                                │
│               │  Coupons                              + Create │
│               │  Create coupons that can be applied to any    │
│               │  event managed by your calendar.              │
│               │                                                │
│               │  ┌──────────────────────────────────────────┐ │
│               │  │ 🎫 No Coupons                            │ │
│               │  │    You have not set up any coupons.      │ │
│               │  └──────────────────────────────────────────┘ │
│               │                                                │
│               │  ─────────────────────────────────────────────│
│               │                                                │
│               │  Payment Methods                               │
│               │  Choose accepted payment methods for your      │
│               │  events and memberships.                       │
│               │                                                │
│               │  iDEAL                                    ○    │
│               │  Popular in the Netherlands                    │
└───────────────┴────────────────────────────────────────────────┘
```

### Payment Sections
| Section | Description |
|---------|-------------|
| **Ticket Sales** | Stripe integration CTA |
| **Coupons** | Discount code management |
| **Payment Methods** | Regional payment toggles |

### Payment Method Options
| Method | Region | Toggle |
|--------|--------|--------|
| **iDEAL** | Netherlands | On/Off |
| **Apple Pay** | Global | On/Off |
| **Google Pay** | Global | On/Off |

---

## 5. Activity Notifications Dropdown

```
┌────────────────────────────────────────────────────────────────┐
│  🔔                                                            │
├────────────────────────────────────────────────────────────────┤
│  👤 registered for Tech Meetup                      4m    [🖼️] │
│                                                                │
│  👤 john doe accepted an invite to                  6m    [🖼️] │
│     Tech Meetup                                                │
│                                                                │
│  ✓ Alex Smith approved your                         6m    [🖼️] │
│    request to join Tech Meetup                                │
│                                                                │
│  👤 Alex Smith accepted an invite to                Mon   [🖼️] │
│     Tech Meetup                                                │
└────────────────────────────────────────────────────────────────┘
```

### Notification Types
| Type | Icon | Format |
|------|------|--------|
| **Registration** | Avatar | "{name} registered for {event}" |
| **Invite Accepted** | Avatar | "{name} accepted an invite to {event}" |
| **Request Approved** | ✓ checkmark | "{name} approved your request to join {event}" |

### Notification Elements
| Element | Specification |
|---------|---------------|
| **Timestamp** | Relative time (4m, 6m, Mon) |
| **Event Thumbnail** | Small preview image (right side) |
| **Avatar** | User profile picture |

---

## 6. Event Payment Settings

### Refund Policy Section
```
┌────────────────────────────────────────────────────────────────┐
│  Refund Policy                                                 │
│                                                                │
│  ● No Refunds                                                  │
│    Guests cannot request refunds via Luma.                     │
│                                                                │
│  ○ Automatic Refunds                                           │
│    Guests can automatically get refunded if they cancel        │
│    within a specified time before the event.                   │
└────────────────────────────────────────────────────────────────┘
```

### Invoicing Toggle
```
┌────────────────────────────────────────────────────────────────┐
│  Invoicing                                             [○───]  │
│  Allow guests to request an invoice when they register         │
└────────────────────────────────────────────────────────────────┘
```

---

## 7. Design Tokens Extracted

### Colors (Notifications)
| Token | Value | Usage |
|-------|-------|-------|
| `--delivered-blue` | `#3b82f6` | Delivered badge |
| `--opened-green` | `#22c55e` | Opened badge |
| `--bounced-red` | `#ef4444` | Bounced/failed badge |
| `--stripe-purple` | `#635bff` | Stripe brand color |

### Typography
| Element | Specification |
|---------|---------------|
| **Stat Number** | 32px, bold, centered |
| **Stat Label** | 14px, gray, uppercase |
| **Notification Text** | 14px, regular |
| **Timestamp** | 12px, muted gray |

### Component Patterns
| Pattern | Usage |
|---------|-------|
| **Stat cards** | Two-column metrics display |
| **Recipient list** | Avatar + name + email + status |
| **Empty state** | Icon + title + description |
| **Toggle with description** | Label above, help text below |

---

## 8. UX Patterns Summary

### Newsletter Management
- Drafts auto-save as you write
- Published list shows quick stats
- Click to view full preview
- Stats modal for detailed analytics

### Email Analytics
- Two key metrics: Sent + Open Rate
- Per-recipient tracking (delivered/opened)
- Email ID for debugging/support

### Payment Configuration
- Progressive disclosure (connect Stripe first)
- Regional payment methods as toggles
- Coupon system for promotions
- Refund policy radio selection

### Notifications
- Activity feed in dropdown
- Relative timestamps
- Event thumbnails for context
- Grouped by recency
