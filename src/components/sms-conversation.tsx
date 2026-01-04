'use client'

import { useState, useEffect, useRef } from 'react'
import { IPhoneFrame } from './ui/iphone-frame'
import {
  MessageBubble,
  TypingIndicator,
  IMessageHeader,
  IMessageInput,
  OptionButtons,
  IMessageInbox,
  EventConversation,
  SignupView,
  type EventPreview
} from './ui/imessage'

type MessageType = {
  id: string
  text: string
  variant: 'received' | 'sent'
  showTail?: boolean
}

type ConversationPhase =
  | 'initial'
  | 'typing_initial'
  | 'show_options'
  | 'user_selected'
  | 'typing_response'
  | 'host_flow'
  | 'attendee_flow'
  | 'learn_more_flow'
  | 'final_cta'

type ViewState = 'inbox' | 'home' | 'event' | 'signup'

const INITIAL_OPTIONS = [
  { id: 'host', label: 'I want to host' },
  { id: 'attend', label: 'I want to attend' },
  { id: 'learn', label: 'Tell me more' },
]

const HOST_MESSAGES: MessageType[] = [
  { id: 'h1', text: "You want to create a space where strangers meet.", variant: 'received', showTail: false },
  { id: 'h2', text: "Here's what that looks like:", variant: 'received', showTail: true },
  { id: 'h3', text: '"Dinner for 8. Saturday 7pm. $40. Creatives only."', variant: 'received', showTail: false },
  { id: 'h4', text: "You text the idea. We find the strangers. They show up. You host. You get paid.", variant: 'received', showTail: false },
  { id: 'h5', text: "We've done this 35+ times. Now we're giving you the infrastructure.", variant: 'received', showTail: true },
]

const ATTENDEE_MESSAGES: MessageType[] = [
  { id: 'a1', text: "You want to be invited to the right spaces.", variant: 'received', showTail: false },
  { id: 'a2', text: "No more scrolling. No more evaluating. You tell me what you're into—once.", variant: 'received', showTail: true },
  { id: 'a3', text: "Then you wait. Not for a feed. For a text.", variant: 'received', showTail: false },
  { id: 'a4', text: '"Friday 7pm. Strangers & Supper. 8 people. $40. Northeast Minneapolis. The host has a 4.9 rating. You\'re free. Want in?"', variant: 'received', showTail: false },
  { id: 'a5', text: "You reply yes. That's it. You show up.", variant: 'received', showTail: true },
]

const LEARN_MORE_MESSAGES: MessageType[] = [
  { id: 'l1', text: "The loneliness epidemic isn't a lack of events.", variant: 'received', showTail: false },
  { id: 'l2', text: "It's a lack of spaces.", variant: 'received', showTail: true },
  { id: 'l3', text: "Not physical rooms—spaces where strangers feel safe enough to be real with each other.", variant: 'received', showTail: false },
  { id: 'l4', text: "We've hosted 2,800+ strangers over 3.5 years in Minneapolis.", variant: 'received', showTail: false },
  { id: 'l5', text: "Now we're building infrastructure so anyone can create these spaces.", variant: 'received', showTail: true },
]

export function SMSConversation() {
  const [events, setEvents] = useState<EventPreview[]>([])
  const [eventsLoading, setEventsLoading] = useState(true)

  useEffect(() => {
    async function fetchEvents() {
      try {
        const res = await fetch('/api/events')
        const data = await res.json()
        if (data.events) {
          setEvents(data.events.map((e: {
            id: string
            title: string
            description: string
            preview: string
            date: string
            timestamp: string
            location: string
            price: number
            capacity: number
            rsvpCount: number
            spotsLeft: number | 'full' | 'just_posted'
            host: string
          }) => ({
            id: e.id,
            title: e.title,
            preview: e.preview,
            timestamp: e.timestamp,
            spotsLeft: e.spotsLeft,
            description: e.description,
            date: e.date,
            location: e.location,
            price: e.price,
            capacity: e.capacity,
            rsvpCount: e.rsvpCount,
            host: e.host,
          })))
        }
      } catch (err) {
        console.error('Failed to fetch events:', err)
      } finally {
        setEventsLoading(false)
      }
    }
    fetchEvents()
  }, [])

  const [view, setView] = useState<ViewState>('home')
  const [selectedEvent, setSelectedEvent] = useState<EventPreview | null>(null)
  const [animateView, setAnimateView] = useState(false)
  const [signupType, setSignupType] = useState<'host' | 'attendee'>('attendee')

  // Home conversation state
  const [phase, setPhase] = useState<ConversationPhase>('initial')
  const [messages, setMessages] = useState<MessageType[]>([])
  const [showTyping, setShowTyping] = useState(false)
  const [showOptions, setShowOptions] = useState(false)
  const [selectedPath, setSelectedPath] = useState<string | null>(null)
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [showFinalOptions, setShowFinalOptions] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const messagesContainerRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    if (messagesContainerRef.current) {
      messagesContainerRef.current.scrollTo({
        top: messagesContainerRef.current.scrollHeight,
        behavior: 'smooth'
      })
    }
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages, showTyping, showOptions])

  // Initial sequence
  useEffect(() => {
    if (view !== 'home') return

    const timer1 = setTimeout(() => {
      setShowTyping(true)
    }, 500)

    const timer2 = setTimeout(() => {
      setShowTyping(false)
      setMessages([
        { id: '1', text: "Hey—this is SMS.", variant: 'received', showTail: false },
      ])
    }, 1500)

    const timer3 = setTimeout(() => {
      setMessages(prev => [...prev, { id: '2', text: "Strangers Meeting Strangers.", variant: 'received', showTail: true }])
    }, 2200)

    const timer4 = setTimeout(() => {
      setShowTyping(true)
    }, 2800)

    const timer5 = setTimeout(() => {
      setShowTyping(false)
      setMessages(prev => [...prev, { id: '3', text: "What brings you here?", variant: 'received', showTail: true }])
    }, 3800)

    const timer6 = setTimeout(() => {
      setShowOptions(true)
      setPhase('show_options')
    }, 4300)

    return () => {
      clearTimeout(timer1)
      clearTimeout(timer2)
      clearTimeout(timer3)
      clearTimeout(timer4)
      clearTimeout(timer5)
      clearTimeout(timer6)
    }
  }, [view])

  // Handle path-specific message sequences
  useEffect(() => {
    if (!selectedPath || phase !== 'typing_response') return

    const pathMessages = selectedPath === 'host'
      ? HOST_MESSAGES
      : selectedPath === 'attend'
        ? ATTENDEE_MESSAGES
        : LEARN_MORE_MESSAGES

    if (currentMessageIndex >= pathMessages.length) return

    const message = pathMessages[currentMessageIndex]
    if (!message) return

    const timer = setTimeout(() => {
      setShowTyping(false)
      setMessages(prev => [...prev, message])
      setCurrentMessageIndex(prev => prev + 1)

      if (currentMessageIndex < pathMessages.length - 1) {
        setTimeout(() => setShowTyping(true), 300)
      } else {
        setTimeout(() => {
          if (selectedPath === 'learn') {
            setShowFinalOptions(true)
          } else {
            setPhase('final_cta')
          }
        }, 800)
      }
    }, 1200)

    return () => clearTimeout(timer)
  }, [selectedPath, phase, currentMessageIndex])

  const handleOptionSelect = (option: { id: string; label: string }) => {
    setShowOptions(false)
    setShowFinalOptions(false)
    setMessages(prev => [...prev, { id: `user-${Date.now()}`, text: option.label, variant: 'sent', showTail: true }])

    setTimeout(() => {
      setShowTyping(true)
      setSelectedPath(option.id)
      setCurrentMessageIndex(0)
      setPhase('typing_response')
    }, 500)
  }

  const handleCTAClick = (type: 'host' | 'attend') => {
    setSignupType(type === 'host' ? 'host' : 'attendee')
    setAnimateView(true)
    setView('signup')
  }

  const handleBackFromSignup = () => {
    setAnimateView(true)
    // Go back to event view if we came from an event, otherwise go home
    if (selectedEvent) {
      setView('event')
    } else {
      setView('home')
    }
  }

  const handleEventRSVP = () => {
    setSignupType('attendee')
    setAnimateView(true)
    setView('signup')
  }

  const handleEventNotify = () => {
    setSignupType('attendee')
    setAnimateView(true)
    setView('signup')
  }

  const handleBackToMessages = () => {
    setAnimateView(true)
    setView('inbox')
  }

  const handleSelectHome = () => {
    setAnimateView(true)
    setView('home')
  }

  const handleSelectEvent = (event: EventPreview) => {
    setSelectedEvent(event)
    setAnimateView(true)
    setView('event')
  }

  const handleBackToInbox = () => {
    setAnimateView(true)
    setView('inbox')
  }

  const currentOptions = showFinalOptions
    ? [
        { id: 'host', label: 'I want to host' },
        { id: 'attend', label: 'I want to attend' },
      ]
    : INITIAL_OPTIONS

  return (
    <IPhoneFrame className="transform scale-[0.85] md:scale-100 origin-top">
      <div className="h-full overflow-hidden relative">
        {/* Inbox View */}
        {view === 'inbox' && (
          <IMessageInbox
            events={events}
            onSelectEvent={handleSelectEvent}
            onSelectHome={handleSelectHome}
            animate={animateView}
            loading={eventsLoading}
          />
        )}

        {/* Home Conversation View */}
        {view === 'home' && (
          <div className={`h-full flex flex-col bg-[#f2f2f7] ${animateView ? 'animate-slide-in-right' : ''}`}>
            <IMessageHeader
              contactName="SMS"
              statusText="Strangers Meeting Strangers"
              onBackClick={handleBackToMessages}
              showBackButton
            />

            <div
              ref={messagesContainerRef}
              className="flex-1 overflow-y-auto px-[16px] py-[12px] space-y-[8px]"
              style={{ overscrollBehavior: 'contain' }}
            >
              <div className="text-center text-[12px] text-[#8e8e93] mb-[8px]" style={{
                fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif',
              }}>
                Today
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

              {(showOptions || showFinalOptions) && (
                <div className="pt-[12px]">
                  <OptionButtons
                    options={currentOptions}
                    onSelect={handleOptionSelect}
                    animate
                  />
                </div>
              )}

              {phase === 'final_cta' && (
                <div className="pt-[16px] space-y-[12px] animate-options-in">
                  <button
                    onClick={() => handleCTAClick(selectedPath === 'host' ? 'host' : 'attend')}
                    className="w-full py-[14px] px-[20px] rounded-[12px] text-[17px] font-semibold
                      bg-[#34c759] text-white
                      transition-all duration-200 hover:bg-[#2db550] active:scale-[0.98]"
                    style={{
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif',
                    }}
                  >
                    {selectedPath === 'host' ? 'Apply to Host' : 'Join the Pool'}
                  </button>
                  <button
                    onClick={() => {
                      setPhase('show_options')
                      setShowOptions(true)
                      setSelectedPath(null)
                      setCurrentMessageIndex(0)
                    }}
                    className="w-full py-[12px] px-[16px] text-[15px] text-[#007aff] hover:underline"
                    style={{
                      fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif',
                    }}
                  >
                    ← Start over
                  </button>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            <IMessageInput />
          </div>
        )}

        {/* Event Conversation View */}
        {view === 'event' && selectedEvent && (
          <EventConversation
            event={selectedEvent}
            onBack={handleBackToInbox}
            onRSVP={handleEventRSVP}
            onNotify={handleEventNotify}
            animate={animateView}
          />
        )}

        {/* Signup View */}
        {view === 'signup' && (
          <SignupView
            type={signupType}
            onBack={handleBackFromSignup}
            animate={animateView}
          />
        )}
      </div>
    </IPhoneFrame>
  )
}
