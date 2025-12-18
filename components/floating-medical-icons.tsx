"use client"

import { useEffect, useState } from "react"
import Image from "next/image"

export default function FloatingMedicalIcons() {
  const [mounted, setMounted] = useState(false)

  useEffect(() => {
    setMounted(true)
  }, [])

  if (!mounted) return null

  const logoVariations = [
    { delay: "0s", duration: "20s", x: "10%", y: "20%", size: "w-8 h-8" },
    { delay: "3s", duration: "25s", x: "80%", y: "10%", size: "w-10 h-10" },
    { delay: "6s", duration: "18s", x: "15%", y: "70%", size: "w-6 h-6" },
    { delay: "9s", duration: "22s", x: "85%", y: "60%", size: "w-8 h-8" },
    { delay: "12s", duration: "24s", x: "50%", y: "15%", size: "w-7 h-7" },
    { delay: "15s", duration: "19s", x: "25%", y: "45%", size: "w-9 h-9" },
    { delay: "18s", duration: "21s", x: "75%", y: "35%", size: "w-6 h-6" },
    { delay: "21s", duration: "23s", x: "40%", y: "80%", size: "w-8 h-8" },
    { delay: "24s", duration: "17s", x: "60%", y: "25%", size: "w-7 h-7" },
  ]

  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      {logoVariations.map(({ delay, duration, x, y, size }, index) => (
        <div
          key={index}
          className="absolute opacity-5"
          style={{
            left: x,
            top: y,
            animation: `float ${duration} ${delay} infinite ease-in-out`,
          }}
        >
          <div className={`${size} relative opacity-30`}>
            <Image
              src="/images/Ziyara-logo.png"
              alt="زيارة"
              fill
              className="object-contain filter brightness-0 invert opacity-20"
            />
          </div>
        </div>
      ))}

      <style jsx>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px) rotate(0deg);
            opacity: 0.05;
          }
          25% {
            transform: translateY(-20px) rotate(90deg);
            opacity: 0.1;
          }
          50% {
            transform: translateY(-10px) rotate(180deg);
            opacity: 0.05;
          }
          75% {
            transform: translateY(-30px) rotate(270deg);
            opacity: 0.08;
          }
        }
      `}</style>
    </div>
  )
}
