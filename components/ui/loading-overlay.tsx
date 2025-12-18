"use client"

import React from 'react'

export default function LoadingOverlay({ message }: { message?: string }) {
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm">
      <div className="flex flex-col items-center gap-4 bg-white/90 p-6 rounded-xl shadow-lg">
        <div className="w-16 h-16 border-4 border-emerald-200 border-t-emerald-600 rounded-full animate-spin"></div>
        <div className="text-gray-700 font-medium">{message || 'جاري المعالجة...'}</div>
      </div>
    </div>
  )
}
