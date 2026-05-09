import React from 'react'

// Minimal inline SVG icon set (no dependency) for a premium, consistent UI.
// Usage: <Icon name="check" size={18} />
function Icon({ name, size = 18, className = '', title = null, ...props }) {
  const common = {
    width: size,
    height: size,
    viewBox: '0 0 24 24',
    fill: 'none',
    xmlns: 'http://www.w3.org/2000/svg',
    stroke: 'currentColor',
    strokeWidth: 2,
    strokeLinecap: 'round',
    strokeLinejoin: 'round',
    className,
    ...props,
  }

  const paths = {
    check: <path d="M20 6L9 17l-5-5" />,
    x: <path d="M18 6L6 18M6 6l12 12" />,
    checkCircle: (
      <>
        <path d="M22 11.1V12a10 10 0 1 1-5.93-9.14" />
        <path d="M22 4L12 14.01l-3-3" />
      </>
    ),
    xCircle: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M15 9l-6 6M9 9l6 6" />
      </>
    ),
    warning: (
      <>
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0Z" />
        <path d="M12 9v4" />
        <path d="M12 17h.01" />
      </>
    ),
    arrowLeft: <path d="M15 18l-6-6 6-6" />,
    arrowRight: <path d="M9 18l6-6-6-6" />,
    refresh: (
      <>
        <path d="M21 12a9 9 0 1 1-2.64-6.36" />
        <path d="M21 3v6h-6" />
      </>
    ),
    book: (
      <>
        <path d="M4 19.5A2.5 2.5 0 0 1 6.5 17H20" />
        <path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v20H6.5A2.5 2.5 0 0 1 4 19.5v-15Z" />
      </>
    ),
    trophy: (
      <>
        <path d="M8 21h8" />
        <path d="M12 17v4" />
        <path d="M7 4h10v3a5 5 0 0 1-10 0V4Z" />
        <path d="M17 4h3v3a4 4 0 0 1-4 4" />
        <path d="M7 4H4v3a4 4 0 0 0 4 4" />
      </>
    ),
    star: (
      <path d="M12 2l3.09 6.26L22 9.27l-5 4.87L18.18 22 12 18.77 5.82 22 7 14.14l-5-4.87 6.91-1.01L12 2Z" />
    ),
    bolt: <path d="M13 2L3 14h7l-1 8 10-12h-7l1-8Z" />,
    headphones: (
      <>
        <path d="M3 18v-6a9 9 0 0 1 18 0v6" />
        <path d="M21 19a2 2 0 0 1-2 2h-1v-6h1a2 2 0 0 1 2 2Z" />
        <path d="M3 19a2 2 0 0 0 2 2h1v-6H5a2 2 0 0 0-2 2Z" />
      </>
    ),
    mic: (
      <>
        <path d="M12 14a3 3 0 0 0 3-3V6a3 3 0 0 0-6 0v5a3 3 0 0 0 3 3Z" />
        <path d="M19 11a7 7 0 0 1-14 0" />
        <path d="M12 19v3" />
        <path d="M8 22h8" />
      </>
    ),
    link: (
      <>
        <path d="M10 13a5 5 0 0 0 7.07 0l1.41-1.41a5 5 0 0 0-7.07-7.07L10 5" />
        <path d="M14 11a5 5 0 0 0-7.07 0L5.52 12.41a5 5 0 0 0 7.07 7.07L14 19" />
      </>
    ),
    translate: (
      <>
        <path d="M4 5h7" />
        <path d="M7.5 3v2" />
        <path d="M6 9c1.2 1.8 3.1 3.3 5 4" />
        <path d="M11 5c-.5 3-2.5 6-5 8" />
        <path d="M13 21h7" />
        <path d="M16 5l5 16" />
        <path d="M14 13h6" />
      </>
    ),
    wifiOff: (
      <>
        <path d="M2 8.82a15 15 0 0 1 20 0" />
        <path d="M5 12.55a10 10 0 0 1 14 0" />
        <path d="M8.5 16.27a5 5 0 0 1 7 0" />
        <path d="M12 20h.01" />
        <path d="M2 2l20 20" />
      </>
    ),
    clock: (
      <>
        <circle cx="12" cy="12" r="10" />
        <path d="M12 6v6l4 2" />
      </>
    ),
    lock: (
      <>
        <rect x="4" y="11" width="16" height="10" rx="2" />
        <path d="M8 11V8a4 4 0 1 1 8 0v3" />
      </>
    ),
    messageCircle: (
      <>
        <path d="M21 15a4 4 0 0 1-4 4H9l-6 3V7a4 4 0 0 1 4-4h10a4 4 0 0 1 4 4v8Z" />
      </>
    ),
    edit: (
      <>
        <path d="M12 20h9" />
        <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4 12.5-12.5Z" />
      </>
    ),
    gem: (
      <>
        <path d="M6 3h12l4 6-10 13L2 9l4-6Z" />
        <path d="M2 9h20" />
        <path d="M12 22 6 9l6-6 6 6-6 13Z" />
      </>
    ),
    home: (
      <>
        <path d="M3 10.5 12 3l9 7.5V21a1 1 0 0 1-1 1h-5v-7H9v7H4a1 1 0 0 1-1-1V10.5Z" />
      </>
    ),
    users: (
      <>
        <path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
        <path d="M9 11a4 4 0 1 0 0-8 4 4 0 0 0 0 8Z" />
        <path d="M23 21v-2a4 4 0 0 0-3-3.87" />
        <path d="M16 3.13a4 4 0 0 1 0 7.75" />
      </>
    ),
  }

  const content = paths[name] || null
  if (!content) return null

  return (
    <svg {...common} aria-hidden={title ? undefined : true} role={title ? 'img' : 'presentation'}>
      {title ? <title>{title}</title> : null}
      {content}
    </svg>
  )
}

export default Icon
