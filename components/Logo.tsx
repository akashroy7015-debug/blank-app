interface LogoProps {
  size?: number
  className?: string
}

/**
 * FlirtIQ brand mark — a heart with a spark of connection cut into its center,
 * plus an external spark for the "IQ" (intelligence). Original, hand-built.
 */
export default function Logo({ size = 32, className }: LogoProps) {
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 512 512"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={className}
      role="img"
      aria-label="FlirtIQ"
    >
      <defs>
        <linearGradient id="flirtiqLogoBg" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#E8395A" />
          <stop offset="1" stopColor="#FF6B5E" />
        </linearGradient>
        <linearGradient id="flirtiqLogoShine" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0" stopColor="#FFFFFF" stopOpacity="0.30" />
          <stop offset="0.55" stopColor="#FFFFFF" stopOpacity="0" />
        </linearGradient>
      </defs>

      <rect x="0" y="0" width="512" height="512" rx="120" fill="url(#flirtiqLogoBg)" />
      <rect x="0" y="0" width="512" height="512" rx="120" fill="url(#flirtiqLogoShine)" />

      <path
        transform="translate(46 109) scale(14.5)"
        fillRule="evenodd"
        clipRule="evenodd"
        fill="#FFFFFF"
        d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41 0.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z M12 7.4 C12.42 9.46 13.54 10.58 15.6 11 C13.54 11.42 12.42 12.54 12 14.6 C11.58 12.54 10.46 11.42 8.4 11 C10.46 10.58 11.58 9.46 12 7.4 Z"
      />

      <path
        transform="translate(392 132) scale(40)"
        fill="#FFFFFF"
        d="M0 -1 C0.12 -0.42 0.42 -0.12 1 0 C0.42 0.12 0.12 0.42 0 1 C-0.12 0.42 -0.42 0.12 -1 0 C-0.42 -0.12 -0.12 -0.42 0 -1 Z"
      />
    </svg>
  )
}
