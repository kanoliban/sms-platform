'use client'

export function IMessageInput() {
  return (
    <div
      className="bg-[#f6f6f6]/95 backdrop-blur-xl border-t border-[#c6c6c8] px-[8px] py-[8px] pb-[34px]"
      style={{
        fontFamily: '-apple-system, BlinkMacSystemFont, "SF Pro Text", "Helvetica Neue", sans-serif',
      }}
    >
      <div className="flex items-end gap-[8px]">
        {/* Plus button */}
        <button className="flex-shrink-0 w-[33px] h-[33px] rounded-full bg-[#007aff] flex items-center justify-center">
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
