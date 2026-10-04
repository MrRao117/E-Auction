const paths = {
  search: (
    <>
      <circle cx="11" cy="11" r="6.5" />
      <path d="m16 16 5 5" />
    </>
  ),

  play: <polygon points="9,7 18,12 9,17" fill="currentColor" stroke="none" />,

  hammer: (
    <>
      <path d="m4 20 8-8M10 4l10 10M8 6l4-4 6 6-4 4Z" />
      <path d="M4 20h7" />
    </>
  ),

  menu: (
    <>
      <line x1="5" y1="7" x2="19" y2="7" />
      <line x1="5" y1="12" x2="19" y2="12" />
      <line x1="5" y1="17" x2="19" y2="17" />
    </>
  ),

  clock: (
    <>
      <circle cx="12" cy="12" r="8.5" />
      <path d="M12 7v5l3.5 2" />
    </>
  ),

  home: (
    <>
      <path d="M3 10.5 12 3l9 7.5" />
      <path d="M5 9.5V21h14V9.5" />
      <path d="M9 21v-6h6v6" />
    </>
  ),

  gavel: (
    <>
      <path d="m14 4 6 6" />
      <path d="m12 6 6 6" />
      <path d="m3 21 9-9" />
      <path d="m5 16 3 3" />
      <path d="m4 13 7 7" />
    </>
  ),

  heart: (
    <path d="M20.8 8.8c0 5.5-8.8 11-8.8 11S3.2 14.3 3.2 8.8A5 5 0 0 1 12 6.2a5 5 0 0 1 8.8 2.6Z" />
  ),

  user: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 21a7 7 0 0 1 14 0" />
    </>
  ),

  trophy: (
    <>
      <path d="M8 4h8v4a4 4 0 0 1-8 0V4Z" />
      <path d="M8 6H4v2a4 4 0 0 0 4 4" />
      <path d="M16 6h4v2a4 4 0 0 1-4 4" />
      <path d="M12 12v5" />
      <path d="M8 21h8" />
      <path d="M9 17h6" />
    </>
  ),

  mail: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <path d="m3 7 9 6 9-6" />
    </>
  ),

  creditCard: (
    <>
      <rect x="3" y="5" width="18" height="14" rx="2" />
      <line x1="3" y1="10" x2="21" y2="10" />
      <line x1="7" y1="15" x2="11" y2="15" />
    </>
  ),

  phone: (
    <path d="M6.5 3.5 9 3l2 5-2 1.5a15 15 0 0 0 5 5L15.5 13l5 2 .5 2.5a2 2 0 0 1-2 2C10.7 19.5 4.5 13.3 4.5 5.5a2 2 0 0 1 2-2Z" />
  ),
};

function Icon({ name, size = 20, strokeWidth = 1.8, className = "" }) {
  return (
    <svg
      className={`icon ${className}`}
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth={strokeWidth}
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {paths[name] || paths.search}
    </svg>
  );
}

export default Icon;
