'use client'

export interface EventPreview {
  id: string
  title: string
  preview: string
  timestamp: string
  spotsLeft: number | 'full' | 'just_posted'
  isPinned?: boolean
  description?: string
  date?: string
  location?: string
  price?: number
  capacity?: number
  rsvpCount?: number
  host?: string
}

interface IMessageInboxProps {
  events: EventPreview[]
  onSelectEvent: (event: EventPreview) => void
  onSelectHome: () => void
  onComposeClick?: () => void
  animate?: boolean
  loading?: boolean
}

function getEventEmoji(title: string): string {
  const lower = title.toLowerCase()
  if (lower.includes('dinner') || lower.includes('supper')) return '🍽️'
  if (lower.includes('vinyl') || lower.includes('music')) return '🎵'
  if (lower.includes('coffee') || lower.includes('morning')) return '☕'
  if (lower.includes('creative')) return '✨'
  if (lower.includes('founder') || lower.includes('fire')) return '🔥'
  if (lower.includes('walk')) return '🚶'
  return '🎉'
}

export function IMessageInbox({ events, onSelectEvent, onSelectHome, onComposeClick, animate = false, loading = false }: IMessageInboxProps) {
  const pinnedEvent: EventPreview = {
    id: 'home',
    title: 'SMS',
    preview: 'What brings you here?',
    timestamp: 'now',
    spotsLeft: 0,
    isPinned: true,
  }

  return (
    <div className={`h-full flex flex-col bg-[#f2f2f7] ${animate ? 'animate-slide-in-left' : ''}`}>
      {/* Status bar */}
      <div className="h-[54px] px-[20px] flex items-end justify-between pb-[8px]"
        style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif' }}>
        <span className="text-[15px] font-semibold text-black">9:41</span>
        <div className="flex items-center gap-[5px]">
          <svg className="w-[18px] h-[12px]" viewBox="0 0 18 12" fill="black">
            <rect x="0" y="3" width="3" height="9" rx="1" fillOpacity="0.3"/>
            <rect x="5" y="2" width="3" height="10" rx="1" fillOpacity="0.5"/>
            <rect x="10" y="1" width="3" height="11" rx="1" fillOpacity="0.7"/>
            <rect x="15" y="0" width="3" height="12" rx="1"/>
          </svg>
          <svg className="w-[16px] h-[12px]" viewBox="0 0 16 12" fill="black">
            <path d="M8 2.4c2.7 0 5.2 1.1 7 2.9.3.3.3.7 0 1-.3.3-.7.3-1 0C12.5 4.8 10.3 3.9 8 3.9S3.5 4.8 2 6.3c-.3.3-.7.3-1 0-.3-.3-.3-.7 0-1C2.8 3.5 5.3 2.4 8 2.4zm0 3c1.8 0 3.5.7 4.7 1.9.3.3.3.7 0 1-.3.3-.7.3-1 0-1-.9-2.3-1.4-3.7-1.4s-2.7.5-3.7 1.4c-.3.3-.7.3-1 0-.3-.3-.3-.7 0-1C4.5 6.1 6.2 5.4 8 5.4zm0 3c.9 0 1.8.4 2.4 1 .3.3.3.7 0 1-.3.3-.7.3-1 0-.4-.4-.9-.6-1.4-.6s-1 .2-1.4.6c-.3.3-.7.3-1 0-.3-.3-.3-.7 0-1 .6-.6 1.5-1 2.4-1z"/>
          </svg>
          <svg className="w-[25px] h-[12px]" viewBox="0 0 25 12" fill="black">
            <rect x="0" y="1" width="21" height="10" rx="2.5" stroke="black" strokeWidth="1" fill="none"/>
            <rect x="22" y="4" width="2" height="4" rx="0.5"/>
            <rect x="2" y="3" width="17" height="6" rx="1" fill="#34c759"/>
          </svg>
        </div>
      </div>

      {/* Header */}
      <div className="px-[16px] pb-[8px] flex items-center justify-between">
        <button className="text-[17px] text-[#007aff] font-normal"
          style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif' }}>
          Edit
        </button>
        <h1 className="text-[34px] font-bold text-black"
          style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Display", "Helvetica Neue", sans-serif' }}>
          Messages
        </h1>
        <button
          onClick={onComposeClick}
          className="text-[#007aff] active:opacity-50 transition-opacity"
        >
          <svg className="w-[24px] h-[24px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125" />
          </svg>
        </button>
      </div>

      {/* Search bar */}
      <div className="px-[16px] pb-[12px]">
        <div className="bg-[#e5e5ea] rounded-[10px] px-[12px] py-[8px] flex items-center gap-[8px]">
          <svg className="w-[16px] h-[16px] text-[#8e8e93]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
            <path strokeLinecap="round" strokeLinejoin="round" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <span className="text-[17px] text-[#8e8e93]"
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif' }}>
            Search
          </span>
        </div>
      </div>

      {/* Conversation list */}
      <div className="flex-1 overflow-y-auto" style={{ overscrollBehavior: 'contain' }}>
        {/* Pinned SMS home conversation */}
        <button
          onClick={onSelectHome}
          className="w-full px-[16px] py-[12px] flex items-start gap-[12px] active:bg-[#e5e5ea] transition-colors border-b border-[#c6c6c8]/30"
        >
          <div className="relative flex-shrink-0">
            <div className="w-[56px] h-[56px] rounded-full bg-gradient-to-br from-[#34c759] to-[#30b350] flex items-center justify-center">
              <span className="text-white font-bold text-[20px] italic">S</span>
            </div>
            <div className="absolute -top-1 -left-1 w-[20px] h-[20px] bg-[#007aff] rounded-full flex items-center justify-center">
              <svg className="w-[10px] h-[10px] text-white" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 2a6 6 0 00-6 6v3.586l-.707.707A1 1 0 004 14h12a1 1 0 00.707-1.707L16 11.586V8a6 6 0 00-6-6z" />
              </svg>
            </div>
          </div>
          <div className="flex-1 min-w-0 text-left">
            <div className="flex items-center justify-between mb-[2px]">
              <span className="text-[17px] font-semibold text-black"
                style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif' }}>
                SMS
              </span>
              <span className="text-[15px] text-[#8e8e93]"
                style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif' }}>
                now
              </span>
            </div>
            <p className="text-[15px] text-[#8e8e93] truncate"
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif' }}>
              What brings you here?
            </p>
          </div>
          <svg className="w-[7px] h-[12px] text-[#c7c7cc] flex-shrink-0 mt-[6px]" viewBox="0 0 7 12" fill="none" stroke="currentColor" strokeWidth={2}>
            <path d="M1 1l5 5-5 5" />
          </svg>
        </button>

        {/* Loading skeleton */}
        {loading && (
          <>
            {[1, 2, 3].map((i) => (
              <div key={i} className="w-full px-[16px] py-[12px] flex items-start gap-[12px] border-b border-[#c6c6c8]/30 animate-pulse">
                <div className="w-[56px] h-[56px] rounded-full bg-[#e5e5ea]" />
                <div className="flex-1 space-y-[8px] py-[4px]">
                  <div className="h-[16px] bg-[#e5e5ea] rounded w-3/4" />
                  <div className="h-[14px] bg-[#e5e5ea] rounded w-1/2" />
                </div>
              </div>
            ))}
          </>
        )}

        {/* Event conversations */}
        {!loading && events.map((event, index) => (
          <button
            key={event.id}
            onClick={() => onSelectEvent(event)}
            className="w-full px-[16px] py-[12px] flex items-start gap-[12px] active:bg-[#e5e5ea] transition-colors border-b border-[#c6c6c8]/30"
            style={{ animationDelay: animate ? `${(index + 1) * 50}ms` : undefined }}
          >
            <div className="relative flex-shrink-0">
              <div className="w-[56px] h-[56px] rounded-full bg-gradient-to-br from-[#5856d6] to-[#af52de] flex items-center justify-center">
                <span className="text-white text-[24px]">
                  {getEventEmoji(event.title)}
                </span>
              </div>
              {event.spotsLeft !== 'full' && (
                <div className="absolute -top-1 -right-1 w-[20px] h-[20px] bg-[#34c759] rounded-full flex items-center justify-center">
                  <span className="text-white text-[11px] font-bold">
                    {event.spotsLeft === 'just_posted' ? '!' : event.spotsLeft}
                  </span>
                </div>
              )}
            </div>
            <div className="flex-1 min-w-0 text-left">
              <div className="flex items-center justify-between mb-[2px]">
                <span className="text-[17px] font-semibold text-black"
                  style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif' }}>
                  {event.title}
                </span>
                <span className="text-[15px] text-[#8e8e93]"
                  style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif' }}>
                  {event.timestamp}
                </span>
              </div>
              <div className="flex items-center gap-[8px]">
                <p className="text-[15px] text-[#8e8e93] truncate flex-1"
                  style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif' }}>
                  {event.preview}
                </p>
                {event.spotsLeft === 'full' && (
                  <span className="text-[12px] text-[#ff3b30] font-medium flex-shrink-0">Full</span>
                )}
                {event.spotsLeft === 'just_posted' && (
                  <span className="text-[12px] text-[#34c759] font-medium flex-shrink-0">New</span>
                )}
              </div>
            </div>
            <svg className="w-[7px] h-[12px] text-[#c7c7cc] flex-shrink-0 mt-[6px]" viewBox="0 0 7 12" fill="none" stroke="currentColor" strokeWidth={2}>
              <path d="M1 1l5 5-5 5" />
            </svg>
          </button>
        ))}

        {/* Typing indicator at bottom */}
        <div className="px-[16px] py-[16px] flex items-center gap-[12px]">
          <div className="w-[56px] h-[56px] rounded-full bg-[#e5e5ea] flex items-center justify-center">
            <div className="flex gap-[4px]">
              <div className="w-[8px] h-[8px] rounded-full bg-[#8e8e93] animate-typing-dot" />
              <div className="w-[8px] h-[8px] rounded-full bg-[#8e8e93] animate-typing-dot" style={{ animationDelay: '0.2s' }} />
              <div className="w-[8px] h-[8px] rounded-full bg-[#8e8e93] animate-typing-dot" style={{ animationDelay: '0.4s' }} />
            </div>
          </div>
          <span className="text-[15px] text-[#8e8e93] italic"
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif' }}>
            New events brewing...
          </span>
        </div>
      </div>
    </div>
  )
}
