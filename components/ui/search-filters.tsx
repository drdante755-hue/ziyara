"use client"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger } from "@/components/ui/sheet"
import { Search, SlidersHorizontal } from "lucide-react"
import type { ReactNode } from "react"

interface SearchFiltersProps {
  searchValue: string
  onSearchChange: (value: string) => void
  onSearch: () => void
  placeholder?: string
  filterContent?: ReactNode
}

export default function SearchFilters({
  searchValue,
  onSearchChange,
  onSearch,
  placeholder = "بحث...",
  filterContent,
}: SearchFiltersProps) {
  return (
    <div className="sticky top-0 z-40 bg-background border-b border-border px-4 py-3">
      <div className="max-w-7xl mx-auto flex gap-2">
        <div className="relative flex-1">
          <Search className="absolute right-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder={placeholder}
            value={searchValue}
            onChange={(e) => onSearchChange(e.target.value)}
            onKeyDown={(e) => e.key === "Enter" && onSearch()}
            className="pr-10 rounded-xl border-gray-200 focus:border-emerald-500 focus:ring-emerald-500"
          />
        </div>
        <Button onClick={onSearch} size="icon" className="bg-emerald-600 hover:bg-emerald-700 rounded-xl">
          <Search className="h-4 w-4" />
        </Button>
        {filterContent && (
          <Sheet>
            <SheetTrigger asChild>
              <Button variant="outline" size="icon" className="rounded-xl border-gray-200 bg-transparent">
                <SlidersHorizontal className="h-4 w-4" />
              </Button>
            </SheetTrigger>
            <SheetContent side="left" className="w-80">
              <SheetHeader>
                <SheetTitle>الفلاتر</SheetTitle>
              </SheetHeader>
              <div className="py-4">{filterContent}</div>
            </SheetContent>
          </Sheet>
        )}
      </div>
    </div>
  )
}
