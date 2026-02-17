
export default function Logo  ( {Logocolor= "amber-50"}){
  return (
    <div className="">
        <svg width="100%" height="100%" viewBox="0 0 300 300" xmlns="http://www.w3.org/2000/svg" className={`bg-white/80 rounded-full `}>
  {/* <!-- Background circle (transparent, can be any color) --> */}
  <circle cx="150" cy="150" r="140" fill="none"/>

  {/* <!-- Venom-inspired jagged T / checkmark --> */}
  <path d="M90 160 L130 200 L210 100" stroke="currentColor" strokeWidth="16" fill="none" strokeLinecap="round" strokeLinejoin="round"/>
  <line x1="90" y1="90" x2="90" y2="160" stroke="currentColor" strokeWidth="16" strokeLinecap="round"/>

  {/* <!-- Dripping effect --> */}
  <path d="M130 200 C140 220, 160 230, 170 210" stroke="currentColor" strokeWidth="12" fill="none" strokeLinecap="round"/>
  <path d="M210 100 C220 120, 230 130, 215 145" stroke="currentColor" strokeWidth="12" fill="none" strokeLinecap="round"/>

  {/* <!-- App Name, jagged font vibe --> */}
  <text x="150" y="280" fontFamily="Impact, Helvetica, Arial, sans-serif" fontSize="36" fontWeight="bold" fill="currentColor" textAnchor="middle">
    Taskify
  </text>
</svg>

    </div>
  )
}
