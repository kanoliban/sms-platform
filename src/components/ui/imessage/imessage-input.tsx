'use client'

import { useState } from 'react'

interface IMessageInputProps {
  onPlusAction?: (action: 'events' | 'host' | 'join') => void
}

export function IMessageInput({ onPlusAction }: IMessageInputProps) {
  const [showMenu, setShowMenu] = useState(false)

  const menuItems = [
    { id: 'events' as const, icon: '📅', label: 'Browse Events' },
    { id: 'host' as const, icon: '🏠', label: 'Host a Space' },
    { id: 'join' as const, icon: '🎱', label: 'Join the Pool' },
  ]

  const handleMenuClick = (action: 'events' | 'host' | 'join') => {
    setShowMenu(false)
    onPlusAction?.(action)
  }

  return (
    <div
      className="bg-[#f6f6f6]/95 backdrop-blur-xl border-t border-[#c6c6c8] px-[8px] py-[8px] pb-[34px] relative"
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif',
      }}
    >
      {/* Plus menu popover */}
      {showMenu && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setShowMenu(false)}
          />
          {/* Menu */}
          <div className="absolute bottom-full left-[8px] mb-[8px] bg-white rounded-[14px] shadow-lg border border-[#e5e5ea] overflow-hidden z-20 animate-slide-up">
            {menuItems.map((item, index) => (
              <button
                key={item.id}
                onClick={() => handleMenuClick(item.id)}
                className={`w-full flex items-center gap-[12px] px-[16px] py-[12px] text-left hover:bg-[#f2f2f7] active:bg-[#e5e5ea] transition-colors ${
                  index !== menuItems.length - 1 ? 'border-b border-[#e5e5ea]' : ''
                }`}
              >
                <span className="text-[20px]">{item.icon}</span>
                <span className="text-[17px] text-black">{item.label}</span>
              </button>
            ))}
          </div>
        </>
      )}

      <div className="flex items-end gap-[8px]">
        {/* Plus button */}
        <button
          onClick={() => setShowMenu(!showMenu)}
          className={`flex-shrink-0 w-[33px] h-[33px] rounded-full flex items-center justify-center transition-all duration-200 ${
            showMenu
              ? 'bg-[#8e8e93] rotate-45'
              : 'bg-[#007aff]'
          }`}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="white">
            <path d="M10 4V16M4 10H16" stroke="white" strokeWidth="2.5" strokeLinecap="round" />
          </svg>
        </button>

        {/* Text input */}
        <div className="flex-1 min-h-[33px] bg-white rounded-[18px] border border-[#c6c6c8] px-[12px] py-[6px] flex items-center">
          <span className="text-[17px] text-[#8e8e93]">Text Message</span>
        </div>

        {/* Voice/Send button */}
        <button className="flex-shrink-0 w-[33px] h-[33px] flex items-center justify-center text-[#007aff]">
          <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
            <path
              d="M12 2C13.1 2 14 2.9 14 4V12C14 13.1 13.1 14 12 14C10.9 14 10 13.1 10 12V4C10 2.9 10.9 2 12 2Z"
              stroke="currentColor"
              strokeWidth="2"
            />
            <path
              d="M6 10V12C6 15.31 8.69 18 12 18C15.31 18 18 15.31 18 12V10"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            />
            <path d="M12 18V22" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            <path d="M8 22H16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
        </button>
      </div>
    </div>
  )
}
