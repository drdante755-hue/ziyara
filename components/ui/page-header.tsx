"use client"

import type { LucideIcon } from "lucide-react"

interface PageHeaderProps {
  title: string
  description: string
  icon?: LucideIcon
  gradient?: string
}

export default function PageHeader({
  title,
  description,
  icon: Icon,
  gradient = "from-emerald-600 to-emerald-500",
}: PageHeaderProps) {
  return (
    <div className={`bg-gradient-to-l ${gradient} text-white py-8 px-4`}>
      <div className="max-w-7xl mx-auto">
        <div className="flex items-center gap-3 mb-2">
          {Icon && (
            <div className="w-10 h-10 rounded-xl bg-white/20 flex items-center justify-center">
              <Icon className="w-5 h-5" />
            </div>
          )}
          <h1 className="text-2xl font-bold">{title}</h1>
        </div>
        <p className="text-white/80 mr-13">{description}</p>
      </div>
    </div>
  )
}
