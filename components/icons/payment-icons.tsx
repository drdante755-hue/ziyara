"use client"

export function InstapayIcon({ className }: { className?: string }) {
  return <img src="/images/InstaPay_Logo.png" className={`${className ?? ""} object-contain`} alt="InstaPay" />
}

export function VodafoneCashIcon({ className }: { className?: string }) {
  return (
    <img
      src="/images/Economic-Cash.png"
      className={`${className ?? ""} w-12 h-12 object-contain`}
      alt="Vodafone Cash"
    />
  )
}

export function WalletIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
      <rect width="48" height="48" rx="8" fill="#F59E0B" />
      <rect x="10" y="16" width="28" height="20" rx="3" fill="white" />
      <rect x="10" y="14" width="28" height="6" rx="2" fill="#FCD34D" />
      <circle cx="32" cy="26" r="3" fill="#F59E0B" />
      <rect x="14" y="22" width="10" height="2" rx="1" fill="#FCD34D" />
      <rect x="14" y="26" width="6" height="2" rx="1" fill="#FCD34D" />
    </svg>
  )
}
