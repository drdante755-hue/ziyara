"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Input } from "@/components/ui/input"

interface VerificationCodeInputProps {
  length?: number
  onComplete?: (code: string) => void
  onCodeChange?: (code: string) => void
}

export default function VerificationCodeInput({ length = 6, onComplete, onCodeChange }: VerificationCodeInputProps) {
  const [code, setCode] = useState<string[]>(new Array(length).fill(""))
  const inputRefs = useRef<(HTMLInputElement | null)[]>([])

  useEffect(() => {
    // Focus first input on mount
    if (inputRefs.current[0]) {
      inputRefs.current[0].focus()
    }
  }, [])

  const handleChange = (index: number, value: string) => {
    // Only allow numeric input
    if (!/^\d*$/.test(value)) return

    const newCode = [...code]
    newCode[index] = value.slice(-1) // Only take the last digit

    setCode(newCode)
    onCodeChange?.(newCode.join(""))

    // Auto-focus next input
    if (value && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }

    // Check if code is complete
    if (newCode.every((digit) => digit !== "") && newCode.join("").length === length) {
      onComplete?.(newCode.join(""))
    }
  }

  const handleKeyDown = (index: number, e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Backspace" && !code[index] && index > 0) {
      // Move to previous input on backspace if current is empty
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === "ArrowLeft" && index > 0) {
      inputRefs.current[index - 1]?.focus()
    } else if (e.key === "ArrowRight" && index < length - 1) {
      inputRefs.current[index + 1]?.focus()
    }
  }

  const handlePaste = (e: React.ClipboardEvent) => {
    e.preventDefault()
    const pastedData = e.clipboardData.getData("text").replace(/\D/g, "").slice(0, length)

    if (pastedData) {
      const newCode = [...code]
      for (let i = 0; i < pastedData.length && i < length; i++) {
        newCode[i] = pastedData[i]
      }
      setCode(newCode)
      onCodeChange?.(newCode.join(""))

      // Focus the next empty input or the last one
      const nextEmptyIndex = newCode.findIndex((digit) => digit === "")
      const focusIndex = nextEmptyIndex === -1 ? length - 1 : nextEmptyIndex
      inputRefs.current[focusIndex]?.focus()

      // Check if code is complete
      if (newCode.every((digit) => digit !== "") && newCode.join("").length === length) {
        onComplete?.(newCode.join(""))
      }
    }
  }

  return (
    <div className="flex gap-2 sm:gap-3 justify-center" dir="ltr">
      {code.map((digit, index) => (
        <Input
          key={index}
          ref={(el) => { inputRefs.current[index] = el }}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={digit}
          onChange={(e) => handleChange(index, e.target.value)}
          onKeyDown={(e) => handleKeyDown(index, e)}
          onPaste={handlePaste}
          className="w-12 h-12 sm:w-14 sm:h-14 lg:w-16 lg:h-16 text-center text-lg sm:text-xl lg:text-2xl font-bold border-2 border-gray-200 rounded-xl focus:border-emerald-400 focus:ring-emerald-400/20 transition-all duration-200"
          autoComplete="off"
        />
      ))}
    </div>
  )
}
