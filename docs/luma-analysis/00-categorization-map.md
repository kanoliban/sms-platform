# Luma Screenshot Categorization Map

> **Source:** 295 screenshots from Mobbin (Lu.ma web, Dec 2024)
> **Purpose:** Extract design system and UX patterns for SMS Platform

---

## Content Distribution (by image number)

| Range | Screen/Feature | Category Folder |
|-------|----------------|-----------------|
| 0 | Landing page - Hero ("Delightful events start here") | `01-landing-discovery` |
| 1-9 | Landing pages, marketing | `01-landing-discovery` |
| 10-19 | Onboarding - Complete profile, sign up flows | `08-settings-profile` |
| 20-29 | Event creation - Image picker, templates | `02-event-creation` |
| 30-49 | Event creation - Form states (themes, location, Zoom) | `02-event-creation` |
| 50-69 | Event creation - Modals (capacity, tickets, approval) | `02-event-creation` |
| 70-79 | Guest invites - Invite modal, email entry | `05-guest-management` |
| 80-89 | Share event - Social sharing modal | `04-host-dashboard` |
| 90-99 | Host dashboard - Overview tab (guests, hosts, visibility) | `04-host-dashboard` |
| 100-109 | Host dashboard - Guests tab (empty state, list) | `05-guest-management` |
| 110-119 | Host dashboard - Guests tab (approval, search, filters) | `05-guest-management` |
| 120-129 | Registration settings - Question types, form builder | `04-host-dashboard` |
| 130-139 | Host dashboard - More tab (clone, embed, URL) | `04-host-dashboard` |
| 140-149 | Host dashboard - Cancel event modal | `04-host-dashboard` |
| 150-159 | Calendar creation page | `06-calendar-management` |
| 160-169 | Calendar page - Events list, calendar view | `06-calendar-management` |
| 170-179 | People management - Import, tags, subscribers | `05-guest-management` |
| 180-189 | Calendar verification, send limits | `06-calendar-management` |
| 190-199 | Newsletters - Email stats, drafts, published | `07-notifications-emails` |
| 200-209 | Calendar settings - Embed, display options | `06-calendar-management` |
| 210-219 | Calendar settings - Status (active/archived/coming soon) | `06-calendar-management` |
| 220-229 | Discover Events page - Popular, local events | `09-discover-explore` |
| 230-239 | RSVP/Registration - User info form, registration flow | `03-event-pages-public` |
| 240-249 | Global search/command palette | `09-discover-explore` |
| 250-259 | Settings - Account, profile, social links | `08-settings-profile` |
| 260-269 | Settings - Security, phone, 2FA | `08-settings-profile` |
| 270-279 | Settings - Payment methods, Luma Plus | `08-settings-profile` |
| 280-289 | Marketing pages - "Host Like a Pro", features | `01-landing-discovery` |
| 290-294 | Help Center, documentation pages | `01-landing-discovery` |

---

## Category Folders Summary

| Folder | Content | Est. Count |
|--------|---------|------------|
| `01-landing-discovery` | Landing pages, marketing, help center | ~25 |
| `02-event-creation` | Event form, themes, modals, settings | ~50 |
| `03-event-pages-public` | Public event page, RSVP flow, registration | ~20 |
| `04-host-dashboard` | Overview, share, registration settings, more tab | ~40 |
| `05-guest-management` | Invites, guest list, approval, people import | ~35 |
| `06-calendar-management` | Calendar creation, settings, embed, status | ~40 |
| `07-notifications-emails` | Newsletters, email stats, blasts | ~20 |
| `08-settings-profile` | Account, profile, security, payment, onboarding | ~35 |
| `09-discover-explore` | Discover page, search, command palette | ~20 |
| `10-mobile-responsive` | (To be identified during detailed review) | ~10 |

---

## Key Observations (Initial Scan)

### Visual Patterns Identified
- **Gradient backgrounds:** Soft purple/pink/cream gradients
- **Card-based UI:** White cards with subtle shadows on gradient backgrounds
- **Modal system:** Centered modals with icon headers, clear CTAs
- **Color palette:** Muted pastels with accent colors (teal CTA buttons, status badges)
- **Typography:** Clean sans-serif, clear hierarchy (large titles, small labels)

### Interaction Patterns Identified
- **Progressive disclosure:** Modals reveal options (capacity, tickets, questions)
- **Inline editing:** Direct field editing in forms
- **Status indicators:** Color-coded badges (Going, Invited, Pending Approval)
- **Toast notifications:** Success messages at bottom of screen
- **Empty states:** Helpful text + action buttons

### Component Library (to extract)
- Buttons (primary, secondary, ghost, icon)
- Form inputs (text, select, toggle, date picker)
- Modals (standard, confirmation, multi-step)
- Cards (event card, guest card, setting card)
- Navigation (top bar, tabs, sidebar)
- Status badges
- Avatar/profile components
- Toast notifications

---

## Next Steps

1. **Move images** to category folders based on mapping above
2. **Batch analysis** of each category (10-12 images at a time)
3. **Extract** specific components, colors, spacing, typography
4. **Document** design system in structured markdown files
