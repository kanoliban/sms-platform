# Luma Design System Synthesis

> **Purpose:** Consolidated design tokens, patterns, and components extracted from 295 Lu.ma screenshots
> **Use Case:** Reference for SMS Platform development

---

## Table of Contents

1. [Color System](#1-color-system)
2. [Typography](#2-typography)
3. [Spacing & Layout](#3-spacing--layout)
4. [Border Radius](#4-border-radius)
5. [Component Library](#5-component-library)
6. [UX Patterns](#6-ux-patterns)
7. [Page Templates](#7-page-templates)
8. [Interaction Patterns](#8-interaction-patterns)

---

## 1. Color System

### Primary Palette

| Token | Value | Usage |
|-------|-------|-------|
| `--primary-teal` | `#14b8a6` | Primary CTAs, brand accent |
| `--primary-teal-hover` | `#0d9488` | Button hover state |
| `--accent-pink` | `#ec4899` | Luma Plus, date selection |
| `--accent-orange` | `#f97316` | Feature highlights, warnings |

### Semantic Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--success` | `#22c55e` | Confirmations, "Going" status |
| `--error` | `#ef4444` | Validation errors, "Not Going" |
| `--warning` | `#f59e0b` | Pending states |
| `--info` | `#3b82f6` | "Invited" status, links |

### Status Badge Colors

| Status | Background | Text |
|--------|------------|------|
| **Going** | `#dcfce7` | `#16a34a` |
| **Invited** | `#dbeafe` | `#2563eb` |
| **Pending Approval** | `#fef3c7` | `#d97706` |
| **Waitlist** | `#f3f4f6` | `#6b7280` |
| **Not Going** | `#fee2e2` | `#dc2626` |
| **Sold Out** | `#fee2e2` | `#dc2626` |

### Tag Color Palette (8 colors)

```css
--tag-red: #ef4444;
--tag-cranberry: #be185d;
--tag-orange: #f97316;
--tag-yellow: #eab308;
--tag-green: #22c55e;
--tag-blue: #3b82f6;
--tag-purple: #8b5cf6;
--tag-barney: #a855f7;
```

### Calendar Tint Colors (10 options)

```css
--tint-red: #f87171;
--tint-orange: #fb923c;
--tint-amber: #fbbf24;
--tint-lime: #a3e635;
--tint-green: #4ade80;
--tint-teal: #2dd4bf;
--tint-cyan: #22d3ee;
--tint-blue: #60a5fa;
--tint-violet: #a78bfa;
--tint-pink: #f472b6;
```

### Backgrounds

| Token | Value | Usage |
|-------|-------|-------|
| `--bg-page` | `#f8f6f4` | Default page background |
| `--bg-gradient` | `linear-gradient(135deg, #f8f6f4, #f0e8e4, #e8e0dc)` | Auth backgrounds |
| `--bg-teal` | `#e8f4f8` | Event creation page |
| `--surface-white` | `#ffffff` | Cards, modals |
| `--dark-bg` | `#000000` | Marketing pages |

### Text Colors

| Token | Value | Usage |
|-------|-------|-------|
| `--text-primary` | `#1a1a1a` | Headings, body |
| `--text-secondary` | `#6b7280` | Subtitles, placeholders |
| `--text-muted` | `#9ca3af` | Helper text, timestamps |
| `--text-link` | `#2563eb` | Clickable links |

---

## 2. Typography

### Font Stack

```css
--font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
--font-display: 'Georgia', serif; /* Event titles */
```

### Type Scale

| Token | Size | Weight | Usage |
|-------|------|--------|-------|
| `--text-xs` | 12px | 400 | Labels, captions, timestamps |
| `--text-sm` | 14px | 400 | Body text, form labels |
| `--text-base` | 16px | 400 | Default body |
| `--text-lg` | 18px | 500 | Section headers |
| `--text-xl` | 20px | 600 | Card titles |
| `--text-2xl` | 24px | 600 | Modal titles |
| `--text-3xl` | 32px | 700 | Page titles |
| `--text-4xl` | 48px | 700 | Hero headlines |

### Line Heights

| Token | Value | Usage |
|-------|-------|-------|
| `--leading-tight` | 1.25 | Headings |
| `--leading-normal` | 1.5 | Body text |
| `--leading-relaxed` | 1.75 | Long-form content |

---

## 3. Spacing & Layout

### Spacing Scale

| Token | Value | Usage |
|-------|-------|-------|
| `--space-1` | 4px | Tight padding |
| `--space-2` | 8px | Icon gaps |
| `--space-3` | 12px | Button padding |
| `--space-4` | 16px | Card gaps, list spacing |
| `--space-5` | 20px | Section margins |
| `--space-6` | 24px | Modal padding |
| `--space-8` | 32px | Page margins |
| `--space-10` | 40px | Section separators |
| `--space-12` | 48px | Large gaps |

### Layout Widths

| Token | Value | Usage |
|-------|-------|-------|
| `--modal-width-sm` | 400px | Small modals, dropdowns |
| `--modal-width-md` | 500px | Standard modals |
| `--modal-width-lg` | 640px | Large modals (invite) |
| `--sidebar-width` | 240px | Settings sidebar |
| `--content-max` | 960px | Page content max-width |
| `--slide-over-width` | 400px | Right panel detail views |

### Column Layouts

| Layout | Ratio | Usage |
|--------|-------|-------|
| **Event Page** | 40/60 | Cover + form |
| **Settings** | 200px/1fr | Sidebar + content |
| **Invite Modal** | 50/50 | Sources + recipients |
| **Dashboard** | 1fr/320px | Content + sidebar |

---

## 4. Border Radius

| Token | Value | Usage |
|-------|-------|-------|
| `--radius-sm` | 6px | Inputs, small buttons |
| `--radius-md` | 8px | Buttons, dropdowns |
| `--radius-lg` | 12px | Cards, modals |
| `--radius-xl` | 16px | Large cards, images |
| `--radius-full` | 9999px | Avatars, pills, badges |

---

## 5. Component Library

### Buttons

#### Primary Button
```css
.btn-primary {
  background: #1a1a1a;
  color: #ffffff;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 500;
  height: 44px;
}
.btn-primary:hover {
  background: #374151;
}
```

#### Secondary Button
```css
.btn-secondary {
  background: transparent;
  border: 1px solid #d1d5db;
  color: #1a1a1a;
  padding: 12px 24px;
  border-radius: 8px;
}
```

#### Ghost Button
```css
.btn-ghost {
  background: transparent;
  color: #6b7280;
  padding: 8px 16px;
}
```

#### Teal CTA (Event Creation)
```css
.btn-teal {
  background: #14b8a6;
  color: #ffffff;
  width: 100%;
  padding: 12px;
  border-radius: 8px;
}
```

#### Destructive Button
```css
.btn-destructive {
  background: #f43f5e;
  color: #ffffff;
}
```

### Form Inputs

#### Text Input
```css
.input {
  height: 44px;
  padding: 0 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  font-size: 14px;
}
.input:focus {
  border-color: #14b8a6;
  outline: none;
  box-shadow: 0 0 0 2px rgba(20, 184, 166, 0.1);
}
.input-error {
  border-color: #ef4444;
}
```

#### Textarea
```css
.textarea {
  min-height: 120px;
  padding: 12px;
  border: 1px solid #d1d5db;
  border-radius: 6px;
  resize: vertical;
}
```

#### Toggle Switch
```css
.toggle {
  width: 44px;
  height: 24px;
  border-radius: 12px;
  background: #e5e7eb;
}
.toggle.active {
  background: #14b8a6;
}
```

### Cards

#### Standard Card
```css
.card {
  background: #ffffff;
  border-radius: 12px;
  padding: 16px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
}
```

#### Stats Card
```css
.stats-card {
  background: #ffffff;
  border-radius: 12px;
  padding: 24px;
  text-align: center;
}
.stats-card .value {
  font-size: 32px;
  font-weight: 700;
}
.stats-card .label {
  font-size: 14px;
  color: #6b7280;
}
```

#### Action Card (Icon + Label)
```css
.action-card {
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 16px;
  border: 1px solid #e5e7eb;
  border-radius: 12px;
  cursor: pointer;
}
.action-card:hover {
  border-color: #14b8a6;
}
```

### Modals

#### Modal Container
```css
.modal {
  background: #ffffff;
  border-radius: 12px;
  max-width: 500px;
  max-height: 90vh;
  overflow: auto;
}
.modal-header {
  padding: 24px 24px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.modal-body {
  padding: 0 24px 24px;
}
```

#### Modal with Icon Header
```css
.modal-icon {
  width: 48px;
  height: 48px;
  border-radius: 12px;
  background: #f3f4f6;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 16px;
}
```

### Badges & Pills

#### Status Badge
```css
.badge {
  display: inline-flex;
  align-items: center;
  padding: 4px 12px;
  border-radius: 9999px;
  font-size: 12px;
  font-weight: 500;
}
.badge-going {
  background: #dcfce7;
  color: #16a34a;
}
.badge-invited {
  background: #dbeafe;
  color: #2563eb;
}
```

#### Tag
```css
.tag {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 12px;
}
.tag-removable {
  cursor: pointer;
}
.tag-removable .close {
  margin-left: 4px;
}
```

### Navigation

#### Tab Navigation
```css
.tabs {
  display: flex;
  gap: 0;
  border-bottom: 1px solid #e5e7eb;
}
.tab {
  padding: 12px 16px;
  color: #6b7280;
  border-bottom: 2px solid transparent;
}
.tab.active {
  color: #1a1a1a;
  border-bottom-color: #1a1a1a;
}
```

#### Sidebar Navigation
```css
.sidebar-nav {
  display: flex;
  flex-direction: column;
  gap: 4px;
}
.sidebar-nav-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 8px 12px;
  border-radius: 6px;
  color: #6b7280;
}
.sidebar-nav-item.active {
  background: #f3f4f6;
  color: #1a1a1a;
  font-weight: 500;
}
```

### Avatars

```css
.avatar {
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: #e5e7eb;
}
.avatar-sm { width: 24px; height: 24px; }
.avatar-md { width: 40px; height: 40px; }
.avatar-lg { width: 64px; height: 64px; }

.avatar-stack {
  display: flex;
}
.avatar-stack .avatar {
  margin-left: -8px;
  border: 2px solid #ffffff;
}
```

### Toast Notifications

```css
.toast {
  position: fixed;
  bottom: 24px;
  left: 50%;
  transform: translateX(-50%);
  padding: 12px 24px;
  border-radius: 8px;
  color: #ffffff;
  display: flex;
  align-items: center;
  gap: 8px;
}
.toast-success {
  background: #22c55e;
}
.toast-error {
  background: #ef4444;
}
```

### Dropdowns

```css
.dropdown {
  position: absolute;
  background: #ffffff;
  border-radius: 8px;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  min-width: 200px;
  padding: 8px 0;
}
.dropdown-item {
  padding: 8px 16px;
  cursor: pointer;
}
.dropdown-item:hover {
  background: #f3f4f6;
}
.dropdown-item.selected {
  background: #f0fdf4;
}
```

---

## 6. UX Patterns

### Progressive Disclosure

| Pattern | Implementation |
|---------|----------------|
| **Optional Fields** | "Add" buttons reveal additional inputs |
| **Expanded Options** | Click to expand full settings |
| **Modals for Complexity** | Capacity, tickets, themes in modals |
| **Smart Defaults** | Pre-filled values reduce input needed |

### Form Patterns

| Pattern | Implementation |
|---------|----------------|
| **Inline Validation** | Red border + label on error |
| **Pre-fill from Auth** | Email auto-populated if logged in |
| **Custom Questions** | Event hosts add registration fields |
| **Character Count** | Show remaining for limited fields |

### Feedback Patterns

| Pattern | Implementation |
|---------|----------------|
| **Toast Notifications** | Success/error messages bottom-center |
| **Loading States** | Spinners for async operations |
| **Empty States** | Icon + title + description + CTA |
| **Skeleton Loading** | Gray placeholders while loading |

### Navigation Patterns

| Pattern | Implementation |
|---------|----------------|
| **Tab Navigation** | Horizontal for page sections |
| **Sidebar Navigation** | Vertical for settings categories |
| **Slide-over Panels** | Detail views without leaving context |
| **Command Palette** | ⌘K for quick navigation |

### Social Patterns

| Pattern | Implementation |
|---------|----------------|
| **Avatar Stacks** | Show attendee count visually |
| **Host Display** | Photo + name + social links |
| **Activity Feed** | Notifications with timestamps |
| **Social Proof** | "X people going" counters |

---

## 7. Page Templates

### Two-Column Form (Event Creation)
```
┌─────────────────────────────────────────────────────────────┐
│  [Nav Bar]                                                   │
├────────────────────────┬────────────────────────────────────┤
│                        │                                    │
│  [Preview Panel]       │  [Form Fields]                     │
│  - Cover image         │  - Title input                     │
│  - Theme selector      │  - Date/time pickers               │
│                        │  - Location                        │
│  ~40% width            │  - Description                     │
│                        │  - Options                         │
│                        │  - Primary CTA                     │
│                        │                                    │
│                        │  ~60% width                        │
└────────────────────────┴────────────────────────────────────┘
```

### Settings Page (Sidebar + Content)
```
┌─────────────────────────────────────────────────────────────┐
│  [Page Header + Tabs]                                        │
├────────────────┬────────────────────────────────────────────┤
│                │                                            │
│  [Sidebar Nav] │  [Content Area]                            │
│  - Section 1   │  - Section title                           │
│  - Section 2   │  - Form fields / cards                     │
│  - Section 3   │  - Toggle options                          │
│                │  - Action buttons                          │
│  200px fixed   │                                            │
│                │  Flexible width                            │
└────────────────┴────────────────────────────────────────────┘
```

### Dashboard (Content + Stats Sidebar)
```
┌─────────────────────────────────────────────────────────────┐
│  [Event Title] [Actions: Share, Edit, Settings]             │
├────────────────────────────────────────────────┬────────────┤
│                                                │            │
│  [Main Content]                                │ [Sidebar]  │
│  - Tab navigation                              │ - Stats    │
│  - Content area                                │ - Quick    │
│                                                │   actions  │
│  Flexible                                      │ 320px      │
└────────────────────────────────────────────────┴────────────┘
```

### Modal (Two-Column)
```
┌────────────────────────────────────────────────────────────┐
│  [Title]                                              [X]  │
├────────────────────────────┬───────────────────────────────┤
│                            │                               │
│  [Left Panel]              │  [Right Panel]                │
│  - Navigation/Sources      │  - Selected items             │
│  - Filters                 │  - Actions                    │
│                            │                               │
├────────────────────────────┴───────────────────────────────┤
│  [Footer: Count] [Secondary Action] [Primary Action]       │
└────────────────────────────────────────────────────────────┘
```

---

## 8. Interaction Patterns

### Hover States
- Buttons: Darken background 10%
- Cards: Subtle border color change
- Links: Underline or color change
- Rows: Light gray background

### Focus States
- Inputs: Teal border + subtle shadow ring
- Buttons: Focus ring (2px offset)
- Interactive elements: Visible focus indicator

### Transitions
```css
--transition-fast: 150ms ease;
--transition-normal: 200ms ease;
--transition-slow: 300ms ease;
```

### Loading States
- Buttons: Spinner replaces text
- Pages: Skeleton placeholders
- Images: Gray background until loaded
- Modals: Centered spinner

### Animation Patterns
- Toast: Slide up + fade in
- Modal: Fade in + scale up
- Dropdown: Fade in + slide down
- Slide-over: Slide from right

---

## Quick Reference: Most Used Patterns

### For Event Features
- Use **teal** (`#14b8a6`) as primary action color
- Status badges with semantic colors
- Two-column layout for forms with preview
- Progress bar for capacity/attendance

### For Guest Management
- Avatar stacks for attendee display
- Tag system with 8-color palette
- Slide-over panels for detail views
- Toast notifications for actions

### For Settings
- Sidebar navigation with icons
- Toggle switches for boolean options
- Cards for grouped settings
- Modal dialogs for complex configuration

### For Discovery
- Card grid for event browsing
- Timeline view for chronological lists
- Hero with overlay for city pages
- Tab navigation for categories

---

## Files Reference

| Document | Content |
|----------|---------|
| `01-landing-discovery.md` | Auth flows, marketing pages, help center |
| `02-event-creation.md` | Event form, themes, location, options |
| `03-host-dashboard.md` | Dashboard tabs, share, registration settings |
| `04-guest-management.md` | Invite flows, guest list, CRM, approvals |
| `05-calendar-management.md` | Calendar creation, settings, embed, verification |
| `06-settings-profile.md` | Account settings, preferences, payment, security |
| `07-event-pages-public.md` | Public event view, registration, guest interactions |
| `08-notifications-emails.md` | Newsletter management, email stats, payments |
| `09-discover-explore.md` | Discover page, city pages, search, submission |
