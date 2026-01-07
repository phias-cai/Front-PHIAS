export function SenaLogo({ className = "" }: { className?: string }) {
  return (
    <svg 
      className={className}
      viewBox="0 0 200 60" 
      fill="none" 
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Logo simplificado del SENA */}
      <circle cx="30" cy="30" r="25" fill="#39A900" />
      <path 
        d="M25 20 L35 20 L30 30 L40 30 L25 45 L28 32 L20 32 Z" 
        fill="white"
      />
      <text 
        x="65" 
        y="40" 
        fontFamily="Arial, sans-serif" 
        fontSize="28" 
        fontWeight="bold"
        fill="#00304D"
      >
        SENA
      </text>
    </svg>
  );
}
