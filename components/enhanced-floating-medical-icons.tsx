"use client"

import { Heart, Stethoscope, Cross, Pill, Activity, Shield, UserCheck, Thermometer } from "lucide-react"

export default function EnhancedFloatingMedicalIcons() {
  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      {/* Top area icons */}
      <div className="absolute top-20 left-10 text-emerald-400/20 animate-float">
        <Heart className="w-8 h-8" />
      </div>

      <div className="absolute top-32 right-16 text-teal-400/25 animate-float-reverse">
        <Stethoscope className="w-10 h-10" />
      </div>

      <div className="absolute top-16 left-1/3 text-cyan-400/20 animate-float">
        <Cross className="w-6 h-6" />
      </div>

      {/* Middle area icons */}
      <div className="absolute top-1/2 left-8 text-emerald-500/15 animate-float-reverse">
        <Pill className="w-7 h-7" />
      </div>

      <div className="absolute top-1/2 right-12 text-teal-500/20 animate-float">
        <Activity className="w-9 h-9" />
      </div>

      <div className="absolute top-1/3 right-1/4 text-emerald-400/25 animate-float-reverse">
        <Shield className="w-8 h-8" />
      </div>

      {/* Bottom area icons */}
      <div className="absolute bottom-32 left-16 text-cyan-500/20 animate-float">
        <UserCheck className="w-8 h-8" />
      </div>

      <div className="absolute bottom-20 right-20 text-emerald-400/15 animate-float-reverse">
        <Thermometer className="w-7 h-7" />
      </div>

      <div className="absolute bottom-40 left-1/3 text-teal-400/20 animate-float">
        <Heart className="w-6 h-6" />
      </div>

      {/* Additional scattered icons for richness */}
      <div className="absolute top-1/4 left-1/4 text-emerald-300/10 animate-float-reverse">
        <Cross className="w-5 h-5" />
      </div>

      <div className="absolute bottom-1/3 right-1/3 text-teal-300/15 animate-float">
        <Pill className="w-6 h-6" />
      </div>
    </div>
  )
}
