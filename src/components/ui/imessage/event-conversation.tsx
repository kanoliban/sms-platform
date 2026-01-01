'use client'

import { useState, useEffect } from 'react'
import { MessageBubble } from './message-bubble'
import { TypingIndicator } from './typing-indicator'
import type { EventPreview } from './imessage-inbox'

interface EventConversationProps {
  event: EventPreview
  onBack: () => void
  onRSVP?: () => void
  onNotify?: () => void
  animate?: boolean
}

type MessageItem = { id: string; text: string; variant: 'received' | 'sent'; showTail?: boolean }

function formatEventDate(dateStr: string | undefined): string {
  if (!dateStr) return ''
  const date = new Date(dateStr)
  const days = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday']
  const hours = date.getHours()
  const ampm = hours >= 12 ? 'pm' : 'am'
  const hour12 = hours % 12 || 12
  return `${days[date.getDay()]} ${hour12}${ampm}`
}

function generateEventMessages(event: EventPreview): MessageItem[] {
  const messages: MessageItem[] = []
  const dateTime = formatEventDate(event.date)
  const priceText = event.price === 0 ? 'Free' : `$${event.price}`

  messages.push({ id: 'm1', text: event.title, variant: 'received', showTail: false })
  messages.push({ id: 'm2', text: `${dateTime}. ${event.location}.`, variant: 'received', showTail: false })
  messages.push({ id: 'm3', text: `${event.capacity} people. ${priceText}.`, variant: 'received', showTail: true })

  if (event.description) {
    messages.push({ id: 'm4', text: event.description, variant: 'received', showTail: false })
  }

  if (event.host) {
    messages.push({ id: 'm5', text: `Hosted by ${event.host}.`, variant: 'received', showTail: false })
  }

  if (event.spotsLeft === 'full') {
    messages.push({ id: 'm6', text: "This one's full. Want to be notified of the next one?", variant: 'received', showTail: true })
  } else if (event.spotsLeft === 'just_posted') {
    messages.push({ id: 'm6', text: "Just posted. You'd be one of the first.", variant: 'received', showTail: true })
  } else {
    messages.push({ id: 'm6', text: `${event.rsvpCount} stranger${event.rsvpCount !== 1 ? 's' : ''} confirmed. ${event.spotsLeft} spot${event.spotsLeft !== 1 ? 's' : ''} left.`, variant: 'received', showTail: true })
  }

  return messages
}

export function EventConversation({ event, onBack, onRSVP, onNotify, animate = false }: EventConversationProps) {
  const [messages, setMessages] = useState<MessageItem[]>([])
  const [showTyping, setShowTyping] = useState(false)
  const [currentIndex, setCurrentIndex] = useState(0)
  const [showCTA, setShowCTA] = useState(false)

  const eventMessages = generateEventMessages(event)
  const confirmed = event.rsvpCount || 0
  const capacity = event.capacity || 8

  useEffect(() => {
    setMessages([])
    setCurrentIndex(0)
    setShowCTA(false)
    setShowTyping(true)
  }, [event.id])

  useEffect(() => {
    if (currentIndex < eventMessages.length) {
      const timer = setTimeout(() => {
        setShowTyping(false)
        setMessages(prev => [...prev, eventMessages[currentIndex]])
        setCurrentIndex(prev => prev + 1)

        if (currentIndex < eventMessages.length - 1) {
          setTimeout(() => setShowTyping(true), 200)
        } else {
          setTimeout(() => setShowCTA(true), 500)
        }
      }, currentIndex === 0 ? 800 : 600)

      return () => clearTimeout(timer)
    }
  }, [currentIndex, eventMessages.length])

  const isFull = event.spotsLeft === 'full'

  return (
    <div className={`h-full flex flex-col bg-[#f2f2f7] ${animate ? 'animate-slide-in-right' : ''}`}>
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

      {/* Header with back button */}
      <div className="h-[44px] px-[8px] flex items-center justify-between border-b border-[#c6c6c8]/50">
        <button
          onClick={onBack}
          className="flex items-center gap-[4px] text-[#007aff] active:opacity-50 transition-opacity px-[8px] py-[8px] -ml-[8px]"
        >
          <svg className="w-[12px] h-[20px]" viewBox="0 0 12 20" fill="none" stroke="currentColor" strokeWidth={2.5}>
            <path d="M10 2L2 10L10 18" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
          <span className="text-[17px]" style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif' }}>
            Messages
          </span>
        </button>

        <div className="absolute left-1/2 -translate-x-1/2 flex flex-col items-center">
          <span className="text-[17px] font-semibold text-black"
            style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif' }}>
            {event.title}
          </span>
        </div>

        <div className="w-[80px]" />
      </div>

      {/* Messages area */}
      <div className="flex-1 overflow-y-auto px-[16px] py-[12px] space-y-[8px]" style={{ overscrollBehavior: 'contain' }}>
        {/* Time stamp */}
        <div className="text-center text-[12px] text-[#8e8e93] mb-[8px]"
          style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif' }}>
          {event.timestamp === 'Fri' ? 'Friday' : event.timestamp === 'Sat' ? 'Saturday' : event.timestamp === 'Sun' ? 'Sunday' : 'Today'}
        </div>

        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            variant={msg.variant}
            showTail={msg.showTail}
            animate
          >
            {msg.text}
          </MessageBubble>
        ))}

        {showTyping && <TypingIndicator animate />}

        {showCTA && (
          <div className="pt-[16px] space-y-[12px] animate-options-in">
            <button
              onClick={isFull ? onNotify : onRSVP}
              className={`w-full py-[14px] px-[20px] rounded-[12px] text-[17px] font-semibold
                transition-all duration-200 active:scale-[0.98]
                ${isFull
                  ? 'bg-[#ff9500] text-white hover:bg-[#e68600]'
                  : 'bg-[#34c759] text-white hover:bg-[#2db550]'
                }`}
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif' }}
            >
              {isFull ? 'Notify Me' : 'I\'m In'}
            </button>

            {/* Confirmed strangers indicator */}
            <div className="flex items-center justify-center gap-[8px] pt-[8px]">
              <div className="flex -space-x-[8px]">
                {Array.from({ length: Math.min(confirmed, 4) }).map((_, i) => (
                  <div
                    key={i}
                    className="w-[28px] h-[28px] rounded-full bg-gradient-to-br from-[#8e8e93] to-[#636366] border-2 border-[#f2f2f7] flex items-center justify-center"
                  >
                    <span className="text-white text-[12px]">?</span>
                  </div>
                ))}
                {confirmed > 4 && (
                  <div className="w-[28px] h-[28px] rounded-full bg-[#e5e5ea] border-2 border-[#f2f2f7] flex items-center justify-center">
                    <span className="text-[#8e8e93] text-[10px] font-medium">+{confirmed - 4}</span>
                  </div>
                )}
              </div>
              <span className="text-[13px] text-[#8e8e93]"
                style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif' }}>
                {confirmed} stranger{confirmed !== 1 ? 's' : ''} confirmed
              </span>
            </div>
          </div>
        )}
      </div>

      {/* Input bar */}
      <div className="bg-[#f2f2f7] border-t border-[#c6c6c8]/50 px-[12px] py-[8px] pb-[34px]">
        <div className="flex items-center gap-[8px]">
          <button className="w-[33px] h-[33px] rounded-full bg-[#007aff] flex items-center justify-center flex-shrink-0">
            <svg className="w-[20px] h-[20px] text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
            </svg>
          </button>
          <div className="flex-1 bg-white rounded-full border border-[#c6c6c8] px-[16px] py-[8px] flex items-center">
            <span className="text-[17px] text-[#c7c7cc]"
              style={{ fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif' }}>
              iMessage
            </span>
          </div>
          <button className="text-[#007aff] flex-shrink-0">
            <svg className="w-[28px] h-[28px]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 18.75a6 6 0 006-6v-1.5m-6 7.5a6 6 0 01-6-6v-1.5m6 7.5v3.75m-3.75 0h7.5M12 15.75a3 3 0 01-3-3V4.5a3 3 0 116 0v8.25a3 3 0 01-3 3z" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  )
}
