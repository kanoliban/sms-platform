# Settings & Profile Analysis

> **Category:** 08-settings-profile (40 images)
> **Screens:** Account settings, preferences, payment, security, onboarding

---

## 1. Profile Completion (Onboarding)

### Complete Your Profile Modal
```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│  Complete Your Profile                                     │
│                                                            │
│  Enter your name and choose an avatar so your              │
│  friends can recognize you.                                │
│                                                            │
│  ┌─────────┐   Name                                        │
│  │   👤    │   ┌────────────────────────────────────────┐ │
│  │   📷    │   │ Alex Smith                             │ │
│  └─────────┘   └────────────────────────────────────────┘ │
│                                                            │
│  [████████████████ Loading... ████████████████]           │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

| Element | Specification |
|---------|---------------|
| **Avatar** | 64px circle with camera upload overlay |
| **Avatar States** | Default, hover (camera icon), uploaded photo |
| **Name Input** | Required field |
| **CTA** | "Let's Go" button (shows loading state) |
| **Background** | Soft gradient (cream/pink/blue) |

---

## 2. Settings Page Structure

### Tab Navigation
```
Settings
─────────────────────────────────────────────────────────────
Account    Preferences    Payment
───────
```

| Tab | Content |
|-----|---------|
| **Account** | Profile, emails, phone, security, third-party |
| **Preferences** | Display theme, language, notifications |
| **Payment** | Payment methods, Luma Plus, history |

---

## 3. Account Tab

### Your Profile Section
```
┌────────────────────────────────────────────────────────────┐
│  Your Profile                                              │
│  Choose how you are displayed as a host or guest.          │
│                                                            │
│  Name                              Profile Picture         │
│  ┌────────────────────────────┐   ┌─────────────────┐     │
│  │ Alex Smith                 │   │      👤         │     │
│  └────────────────────────────┘   │      📷         │     │
│                                   └─────────────────┘     │
│  Username                                                  │
│  ┌────────────────────────────┐                           │
│  │ @  │ alexsmith          ✓  │                           │
│  └────────────────────────────┘                           │
│                                                            │
│  Bio                                                       │
│  ┌────────────────────────────────────────────────────┐   │
│  │ Share a little about your background and interests. │   │
│  └────────────────────────────────────────────────────┘   │
│                                                            │
│  Social Links                                              │
│  ┌─────────────────────────┐  ┌─────────────────────────┐ │
│  │ 📷 instagram.com/ │     │  │ ✕ x.com/      │         │ │
│  └─────────────────────────┘  └─────────────────────────┘ │
│  ┌─────────────────────────┐  ┌─────────────────────────┐ │
│  │ ▶️ youtube.com/@  │     │  │ 🎵 tiktok.com/@│         │ │
│  └─────────────────────────┘  └─────────────────────────┘ │
│  ┌─────────────────────────┐  ┌─────────────────────────┐ │
│  │ 💼 linkedin.com  │/in/  │  │ 🌐 https://...          │ │
│  └─────────────────────────┘  └─────────────────────────┘ │
│                                                            │
│  [👤 Save Changes]                                         │
└────────────────────────────────────────────────────────────┘
```

### Social Links Grid
| Platform | Icon | URL Format |
|----------|------|------------|
| **Instagram** | 📷 | instagram.com/{username} |
| **X (Twitter)** | ✕ | x.com/{username} |
| **YouTube** | ▶️ | youtube.com/@{username} |
| **TikTok** | 🎵 | tiktok.com/@{username} |
| **LinkedIn** | 💼 | linkedin.com/in/{handle} |
| **Website** | 🌐 | Custom URL |

### Emails Section
```
┌────────────────────────────────────────────────────────────┐
│  Emails                                     [+ Add Email]  │
│  Add additional emails to receive event invites sent to    │
│  those addresses.                                          │
│                                                            │
│  ┌────────────────────────────────────────────────────┐   │
│  │ alexsmith.mobbin+1@gmail.com   Primary        ···  │   │
│  │ This email will be shared with hosts when you      │   │
│  │ register for their events.                         │   │
│  └────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────┘
```

| Element | Specification |
|---------|---------------|
| **Primary Badge** | Gray pill indicating default email |
| **Description** | Explains sharing behavior |
| **Actions** | Overflow menu (···) for edit/delete |
| **Add Email** | Secondary button top-right |

### Phone Number Section
```
┌────────────────────────────────────────────────────────────┐
│  Phone Number                                              │
│  Manage the phone number you use to sign in to Luma and    │
│  receive SMS updates.                                      │
│                                                            │
│  Phone Number                                              │
│  ┌──────────────────────────────┐                         │
│  │ +65 8123 4567                │  [Update]               │
│  └──────────────────────────────┘                         │
│                                                            │
│  For your security, we will send you a code to verify     │
│  any change to your phone number.                         │
└────────────────────────────────────────────────────────────┘
```

### Password & Security Section
```
┌────────────────────────────────────────────────────────────┐
│  Password & Security                                       │
│  Secure your account with password and two-factor          │
│  authentication.                                           │
│                                                            │
│  ┌────────────────────────────────────────────────────┐   │
│  │ 🔒 Account Password                [Change Password] │   │
│  │    You can use your password or a code sent to your │   │
│  │    email or phone to sign in.                       │   │
│  ├────────────────────────────────────────────────────┤   │
│  │ 🛡️ Two-Factor Authentication        [Disable 2FA]   │   │
│  │    Two-factor authentication is enabled.            │   │
│  └────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────┘
```

### Third Party Accounts
```
┌────────────────────────────────────────────────────────────┐
│  Third Party Accounts                                      │
│  Link your accounts to sign in to Luma and automate        │
│  your workflows.                                           │
│                                                            │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────┐     │
│  │ G  Google  + │  │ 📹 Zoom   ✓ │  │ ◎ Solana  + │     │
│  └──────────────┘  └──────────────┘  └──────────────┘     │
└────────────────────────────────────────────────────────────┘
```

| Integration | Icon | State |
|-------------|------|-------|
| **Google** | G logo | + (connect) |
| **Zoom** | Video icon | ✓ (connected) |
| **Solana** | S logo | + (connect) |

---

## 4. Preferences Tab

### Display Settings
```
┌────────────────────────────────────────────────────────────┐
│  Display                                                   │
│  Choose your desired Luma interface.                       │
│                                                            │
│  ┌────────────────┐ ┌────────────────┐ ┌────────────────┐ │
│  │ ┌──────────┐   │ │ ┌──────────┐   │ │ ┌──────────┐   │ │
│  │ │ 🌈  Aa Aa │   │ │ │    Aa    │   │ │ │    Aa    │   │ │
│  │ └──────────┘   │ │ └──────────┘   │ │ └──────────┘   │ │
│  │ System     ✓   │ │ Light          │ │ Dark           │ │
│  └────────────────┘ └────────────────┘ └────────────────┘ │
│                                                            │
│  Language                                                  │
│  ┌────────────────────────────────────────────────────┐   │
│  │ English                                         ⌄  │   │
│  └────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────┘
```

### Theme Options
| Theme | Description | Preview |
|-------|-------------|---------|
| **System** | Match device preference | Split light/dark preview |
| **Light** | Always light mode | Light preview |
| **Dark** | Always dark mode | Dark preview |

### Notifications Settings
```
┌────────────────────────────────────────────────────────────┐
│  Notifications                                             │
│  Choose how you would like to be notified about updates,   │
│  invites and subscriptions.                                │
│                                                            │
│  Events You Attend                                         │
│  ┌────────────────────────────────────────────────────┐   │
│  │ 📅 Event Invites                          Off  ⌄   │   │
│  │ ⏰ Event Reminders                        Email ⌄   │   │
│  │ 📢 Event Blasts                           Email ⌄   │   │
│  │ 📰 Event Updates                          Email ⌄   │   │
│  │ 📝 Feedback Requests                      Email ⌄   │   │
│  └────────────────────────────────────────────────────┘   │
│                                                            │
│  Events You Host                                           │
│  (similar structure)                                       │
└────────────────────────────────────────────────────────────┘
```

### Notification Options
| Type | Options |
|------|---------|
| **Event Invites** | Off, Email, Push |
| **Event Reminders** | Off, Email, Push |
| **Event Blasts** | Off, Email |
| **Event Updates** | Off, Email |
| **Feedback Requests** | Off, Email |

---

## 5. Payment Tab

### Payment Methods Section
```
┌────────────────────────────────────────────────────────────┐
│  Payment Methods                                           │
│  Your saved payment methods are encrypted and stored       │
│  securely by Stripe.                                       │
│                                                            │
│  ┌────────────────────────────────────────────────────┐   │
│  │ VISA  Visa  ···· 8880                              │   │
│  │       Expiry: 10/2028              Default    ··· │   │
│  └────────────────────────────────────────────────────┘   │
│                                                            │
│  [+ Add Card]                                              │
└────────────────────────────────────────────────────────────┘
```

### Card Display
| Element | Specification |
|---------|---------------|
| **Card Icon** | Visa/Mastercard/Amex logo |
| **Card Number** | Last 4 digits (···· 8880) |
| **Expiry** | MM/YYYY format |
| **Default Badge** | Teal/green text |
| **Actions** | Overflow menu for edit/delete |

### Luma Plus Section
```
┌────────────────────────────────────────────────────────────┐
│  Luma Plus                                 [Learn More ↗]  │
│  Enjoy 0% platform fees, higher invite and admin limits,   │
│  priority support, and more.                               │
│                                                            │
│  ┌────────────────────────────────────────────────────┐   │
│  │ 👤 Personal                                      > │   │
│  ├────────────────────────────────────────────────────┤   │
│  │ 🗓️ Demo Product Session                          > │   │
│  └────────────────────────────────────────────────────┘   │
│                                                            │
│  Luma Plus applies on the calendar level. Choose the      │
│  desired calendar above to manage its Luma Plus           │
│  membership.                                               │
└────────────────────────────────────────────────────────────┘
```

### Payment History
- Empty state with illustration
- Shows past transactions when available

---

## 6. Security Flows

### Reset Password Page
```
┌────────────────────────────────────────────────────────────┐
│                                                            │
│                   Reset Password                           │
│                                                            │
│  ┌────────────────────────────────────────────────────┐   │
│  │ Choose a new password for your account under       │   │
│  │ alexsmith.mobbin+1@gmail.com:                      │   │
│  │                                                    │   │
│  │ ┌────────────────────────────────────────────┐    │   │
│  │ │ ••••••••••••••••                           │    │   │
│  │ └────────────────────────────────────────────┘    │   │
│  │                                                    │   │
│  │ [████████████ Update Password ████████████]       │   │
│  └────────────────────────────────────────────────────┘   │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

### Two-Factor Authentication Modal
```
┌────────────────────────────────────────────────────────────┐
│  <                                                         │
│                                                            │
│  Two-Factor Authentication                                 │
│                                                            │
│  Please enter the code generated by your                   │
│  authenticator app.                                        │
│                                                            │
│  ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐ ┌────┐              │
│  │    │ │    │ │    │ │    │ │    │ │    │              │
│  └────┘ └────┘ └────┘ └────┘ └────┘ └────┘              │
│                                                            │
│  [📋 Paste Code]                                           │
│                                                            │
└────────────────────────────────────────────────────────────┘
```

| Element | Specification |
|---------|---------------|
| **Code Inputs** | 6 separate square inputs (48x48px) |
| **Input Behavior** | Auto-advance on digit entry |
| **Helper Action** | "Paste Code" button |
| **Back Button** | Chevron left |

---

## 7. Events Page (User View)

### Events List with Slide-over
```
┌────────────────────────────────────────────┬───────────────┐
│  Events                 [Upcoming] [Past]  │ ≫ Copy Link   │
│                                            │   Event Page ↗│
│  Today Tuesday                         ●   │               │
│  LIVE 5:00 AM                              │ You have      │
│  ✦ Tech Meetup                             │ manage access │
│  📹 Zoom                                   │ [Manage ↗]    │
│  👥 No guests                              │               │
│  [□ Start Event] [Manage →]                │ ┌───────────┐ │
│                                            │ │  Event    │ │
│  Nov 18 Monday                         ●   │ │  Image    │ │
│  8:00 AM                                   │ └───────────┘ │
│  ✦ Tech Meetup                             │               │
│  📹 Zoom                                   │ ✦ Private     │
│  👥 No guests                              │   Event       │
│  [Manage Event →]                          │               │
│                                            │ Tech Meetup   │
│                                            │ Demo Product  │
│                                            │ Session       │
│                                            │               │
│                                            │ NOV  Tuesday, │
│                                            │ 11  Nov 12    │
│                                            │     5:00 AM   │
│                                            │               │
│                                            │ 👤 You're Not │
│                                            │    Going      │
│                                            │ We hope to    │
│                                            │ see you next  │
│                                            │ time!         │
│                                            │               │
│                                            │ Changed your  │
│                                            │ mind? You can │
│                                            │ register again│
└────────────────────────────────────────────┴───────────────┘
```

### Event Slide-over Elements
| Element | Specification |
|---------|---------------|
| **Header** | Copy Link, Event Page link, nav arrows |
| **Admin Banner** | Pink "You have manage access" with Manage button |
| **Event Image** | Full-width cover |
| **Privacy Badge** | "Private Event" with sparkle |
| **Status Card** | "You're Not Going" with avatar, message, re-register link |

### Empty State (Dark Mode)
```
┌────────────────────────────────────────────────────────────┐
│  Events                               [Upcoming] [Past]    │
│                                                            │
│                        📅                                  │
│                       (0)                                  │
│                                                            │
│                 No Upcoming Events                         │
│         You have no upcoming events. Why not host one?     │
│                                                            │
│                    [+ Create Event]                        │
│                                                            │
├────────────────────────────────────────────────────────────┤
│  ✦ What's New  Discover  Pricing  Help                    │
│                                     📧 👤 ✕ 📷            │
│                                                            │
│              Host your event with Luma ↗                  │
└────────────────────────────────────────────────────────────┘
```

---

## 8. Toast Notifications

### Success Toasts
```
┌────────────────────────────────────────────────────────────┐
│  ✓  Profile updated successfully!                          │
└────────────────────────────────────────────────────────────┘

┌────────────────────────────────────────────────────────────┐
│  ○  Notification turned off successfully!                  │
└────────────────────────────────────────────────────────────┘
```

| Element | Specification |
|---------|---------------|
| **Position** | Bottom center |
| **Background** | Green (`#22c55e`) |
| **Icon** | Checkmark or toggle indicator |
| **Duration** | ~3 seconds |
| **Animation** | Slide up + fade |

---

## 9. Design Tokens Extracted

### Settings-Specific Colors
| Token | Value | Usage |
|-------|-------|-------|
| `--badge-default` | `#e5e7eb` | Default badge background |
| `--badge-default-text` | `#6b7280` | Default badge text |
| `--link-primary` | `#ec4899` | "register again" links |
| `--toast-success` | `#22c55e` | Success toast background |
| `--theme-system` | Split gradient | System theme preview |

### Component Patterns
| Pattern | Usage |
|---------|-------|
| **Tab Navigation** | Settings section tabs |
| **Form Sections** | Grouped with title + description |
| **Social Input Grid** | 2-column layout with icon prefixes |
| **Theme Picker** | Visual preview cards with selection |
| **Notification Rows** | Icon + label + dropdown |
| **Card List** | Payment methods, calendars |
| **Slide-over Panel** | Event details without full navigation |

---

## 10. UX Patterns Summary

### Settings Organization
- **Tab-based navigation** for major categories
- **Sections** within tabs for logical grouping
- **Inline editing** with Save Changes button
- **Modals** for destructive/sensitive actions

### Profile Completion
- Required during onboarding
- Avatar + name minimum
- Can be enhanced later in settings

### Security Features
- Passwordless primary (OTP)
- Optional password for convenience
- 2FA via authenticator app
- Phone verification for sensitive changes

### Third-Party Integrations
- Visual cards for each service
- Clear connected/disconnected states
- One-click connect flow

### Notification Preferences
- Granular per-notification-type control
- Dropdown for delivery method (Off/Email/Push)
- Grouped by user role (Attend vs Host)

### Dark Mode Support
- System/Light/Dark options
- Visual preview of each theme
- Persisted preference
