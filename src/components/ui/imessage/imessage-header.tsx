'use client'

import { useState } from 'react'

interface IMessageHeaderProps {
  contactName: string
  statusText?: string
  showBackButton?: boolean
  onBackClick?: () => void
  onContactClick?: () => void
}

export function IMessageHeader({ contactName, statusText, showBackButton = false, onBackClick, onContactClick }: IMessageHeaderProps) {
  const [showInfo, setShowInfo] = useState(false)

  const handleContactClick = () => {
    if (onContactClick) {
      onContactClick()
    } else {
      setShowInfo(true)
    }
  }

  return (
    <>
      <div
        className="relative bg-[#f6f6f6]/95 backdrop-blur-xl border-b border-[#c6c6c8]"
        style={{
          fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif',
        }}
      >
        {/* Status bar - iOS style */}
        <div className="flex items-center justify-between px-[28px] pt-[14px] pb-[6px] text-[15px] font-semibold text-black">
          <span>9:41</span>
          <div className="flex items-center gap-[5px]">
            {/* Signal bars */}
            <svg width="18" height="12" viewBox="0 0 18 12" fill="black">
              <rect x="0" y="8" width="3" height="4" rx="0.5" />
              <rect x="5" y="5" width="3" height="7" rx="0.5" />
              <rect x="10" y="2" width="3" height="10" rx="0.5" />
              <rect x="15" y="0" width="3" height="12" rx="0.5" />
            </svg>
            {/* WiFi */}
            <svg width="17" height="12" viewBox="0 0 17 12" fill="black">
              <path d="M8.5 3.5C11.5 3.5 14 4.8 15.5 6.8L17 5C15 2.5 11.9 1 8.5 1C5.1 1 2 2.5 0 5L1.5 6.8C3 4.8 5.5 3.5 8.5 3.5Z" />
              <path d="M8.5 6.5C10.3 6.5 11.9 7.3 13 8.5L14.5 6.8C13 5.2 10.9 4.2 8.5 4.2C6.1 4.2 4 5.2 2.5 6.8L4 8.5C5.1 7.3 6.7 6.5 8.5 6.5Z" />
              <circle cx="8.5" cy="10.5" r="1.5" />
            </svg>
            {/* Battery */}
            <div className="flex items-center gap-[2px]">
              <div className="w-[25px] h-[12px] border border-black rounded-[3px] p-[1px]">
                <div className="w-full h-full bg-black rounded-[1px]" />
              </div>
              <div className="w-[2px] h-[5px] bg-black rounded-r-sm" />
            </div>
          </div>
        </div>

        {/* Navigation bar */}
        <div className="flex items-center px-[16px] py-[10px]">
          {/* Back button */}
          <button
            onClick={onBackClick}
            className={`flex items-center gap-[4px] text-[#007aff] transition-opacity ${showBackButton ? 'opacity-100' : 'opacity-100'} active:opacity-50`}
          >
            <svg width="12" height="20" viewBox="0 0 12 20" fill="currentColor">
              <path d="M10.5 1L2 10L10.5 19" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" fill="none" />
            </svg>
            <span className="text-[17px]">Messages</span>
          </button>

          {/* Contact info - centered, now clickable */}
          <button
            onClick={handleContactClick}
            className="flex-1 flex flex-col items-center -ml-[60px] active:opacity-70 transition-opacity"
          >
            <div className="w-[40px] h-[40px] rounded-full bg-gradient-to-b from-[#a5a5a5] to-[#8e8e8e] flex items-center justify-center mb-[2px]">
              <span className="text-white text-[18px] font-semibold">S</span>
            </div>
            <span className="text-[13px] font-semibold text-black">{contactName}</span>
            {statusText && (
              <span className="text-[11px] text-[#8e8e93]">{statusText}</span>
            )}
          </button>

          {/* Right buttons */}
          <div className="flex items-center gap-[16px] text-[#007aff]">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07 19.5 19.5 0 01-6-6 19.79 19.79 0 01-3.07-8.67A2 2 0 014.11 2h3a2 2 0 012 1.72 12.84 12.84 0 00.7 2.81 2 2 0 01-.45 2.11L8.09 9.91a16 16 0 006 6l1.27-1.27a2 2 0 012.11-.45 12.84 12.84 0 002.81.7A2 2 0 0122 16.92z" />
            </svg>
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <polygon points="23 7 16 12 23 17 23 7" />
              <rect x="1" y="5" width="15" height="14" rx="2" ry="2" />
            </svg>
          </div>
        </div>
      </div>

      {/* Info Sheet Modal */}
      {showInfo && (
        <div className="absolute inset-0 z-50 flex items-end justify-center">
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/40"
            onClick={() => setShowInfo(false)}
          />
          {/* Sheet */}
          <div
            className="relative w-full bg-[#f2f2f7] rounded-t-[14px] animate-slide-up"
            style={{
              fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif',
              maxHeight: '80%',
            }}
          >
            {/* Handle */}
            <div className="flex justify-center pt-[8px] pb-[4px]">
              <div className="w-[36px] h-[5px] bg-[#c6c6c8] rounded-full" />
            </div>

            {/* Profile header */}
            <div className="flex flex-col items-center pt-[16px] pb-[20px] border-b border-[#c6c6c8]">
              <div className="w-[80px] h-[80px] rounded-full bg-gradient-to-b from-[#a5a5a5] to-[#8e8e8e] flex items-center justify-center mb-[8px]">
                <span className="text-white text-[36px] font-semibold">S</span>
              </div>
              <h2 className="text-[22px] font-bold text-black">
                <strong className="italic">SMS</strong>
              </h2>
              <p className="text-[15px] text-[#8e8e93]">Strangers Meeting Strangers</p>
            </div>

            {/* Stats */}
            <div className="px-[20px] py-[16px] bg-white mx-[16px] mt-[16px] rounded-[12px]">
              <div className="grid grid-cols-3 gap-[12px] text-center">
                <div>
                  <p className="text-[24px] font-bold text-black">2,800+</p>
                  <p className="text-[13px] text-[#8e8e93]">strangers met</p>
                </div>
                <div>
                  <p className="text-[24px] font-bold text-black">35+</p>
                  <p className="text-[13px] text-[#8e8e93]">events hosted</p>
                </div>
                <div>
                  <p className="text-[24px] font-bold text-black">3.5</p>
                  <p className="text-[13px] text-[#8e8e93]">years running</p>
                </div>
              </div>
            </div>

            {/* Description */}
            <div className="px-[20px] py-[16px] bg-white mx-[16px] mt-[12px] rounded-[12px]">
              <p className="text-[15px] text-[#3c3c43] leading-[22px]">
                We create spaces where strangers feel safe enough to be real with each other.
                No apps. No algorithms. Just a text when the right space opens up.
              </p>
            </div>

            {/* Location */}
            <div className="px-[20px] py-[14px] bg-white mx-[16px] mt-[12px] rounded-[12px] flex items-center gap-[12px]">
              <span className="text-[20px]">📍</span>
              <span className="text-[17px] text-black">Minneapolis, MN</span>
            </div>

            {/* Close button */}
            <button
              onClick={() => setShowInfo(false)}
              className="w-[calc(100%-32px)] mx-[16px] mt-[20px] mb-[34px] py-[14px] bg-white rounded-[12px] text-[17px] font-semibold text-[#007aff] active:bg-[#e5e5ea]"
            >
              Done
            </button>
          </div>
        </div>
      )}
    </>
  )
}
