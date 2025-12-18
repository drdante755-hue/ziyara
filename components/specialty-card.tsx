"use client"

import { Card, CardContent } from "@/components/ui/card"
import Link from "next/link"
import {
  Stethoscope,
  Heart,
  Brain,
  Eye,
  Bone,
  Baby,
  Syringe,
  Smile,
  Ear,
  Pill,
  Activity,
  Scissors,
  type LucideIcon,
} from "lucide-react"

interface Specialty {
  id: string
  name: string
  nameAr: string
  slug: string
  icon?: string
  image?: string
}

interface SpecialtyCardProps {
  specialty: Specialty
  href?: string
}

const iconMap: { [key: string]: LucideIcon } = {
  general: Stethoscope,
  cardiology: Heart,
  neurology: Brain,
  ophthalmology: Eye,
  orthopedics: Bone,
  pediatrics: Baby,
  dermatology: Syringe,
  dentistry: Smile,
  ent: Ear,
  internal: Pill,
  surgery: Scissors,
  default: Activity,
}

export default function SpecialtyCard({ specialty, href }: SpecialtyCardProps) {
  const Icon = iconMap[specialty.slug] || iconMap["default"]

  const content = (
    <Card className="group hover:shadow-lg hover:border-primary/50 transition-all duration-300 cursor-pointer">
      <CardContent className="p-6 flex flex-col items-center text-center">
        <div className="w-16 h-16 rounded-2xl bg-primary/10 flex items-center justify-center mb-3 group-hover:bg-primary/20 transition-colors">
          {specialty.image ? (
            <img
              src={specialty.image || "/placeholder.svg"}
              alt={specialty.nameAr}
              className="w-10 h-10 object-contain"
            />
          ) : (
            <Icon className="w-8 h-8 text-primary" />
          )}
        </div>
        <h3 className="font-semibold text-foreground">{specialty.nameAr}</h3>
        <p className="text-xs text-muted-foreground mt-1">{specialty.name}</p>
      </CardContent>
    </Card>
  )

  if (href) {
    return <Link href={href}>{content}</Link>
  }

  return content
}
