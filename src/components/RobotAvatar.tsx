import React from 'react'

interface RobotAvatarProps {
  className?: string
  size?: number
}

export const RobotAvatar: React.FC<RobotAvatarProps> = ({
  className = '',
  size = 28,
}) => {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 40 40"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
    >
      {/* Antenna */}
      <path
        d="M20 5V11"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
      />
      <circle cx="20" cy="4" r="1.5" fill="currentColor" />

      {/* Head outer box */}
      <rect
        x="8"
        y="11"
        width="24"
        height="21"
        rx="6"
        stroke="currentColor"
        strokeWidth="2.5"
      />

      {/* Ears / Side antennas */}
      <rect x="5" y="18" width="3" height="7" rx="1.5" fill="currentColor" />
      <rect x="32" y="18" width="3" height="7" rx="1.5" fill="currentColor" />

      {/* Eyes */}
      <circle cx="15" cy="20" r="2.2" fill="currentColor" />
      <circle cx="25" cy="20" r="2.2" fill="currentColor" />

      {/* Mouth */}
      <path
        d="M16 26C17.2 27.2 22.8 27.2 24 26"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
      />
    </svg>
  )
}
