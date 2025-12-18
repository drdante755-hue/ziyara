"use client"

import type React from "react"
import { useState } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Label } from "@/components/ui/label"
import { Paperclip, X, AlertTriangle } from "lucide-react"
import type { TicketPriority } from "@/types/ticket"

interface CreateTicketModalProps {
  open: boolean
  onClose: () => void
  onCreate: (data: {
    title: string
    category: string
    priority: TicketPriority
    description: string
  }) => void
}

const categories = ["شحن وتوصيل", "فواتير ومدفوعات", "استفسار عن منتج", "مشكلة تقنية", "إرجاع واستبدال", "شكوى", "أخرى"]

export function CreateTicketModal({ open, onClose, onCreate }: CreateTicketModalProps) {
  const [title, setTitle] = useState("")
  const [category, setCategory] = useState("")
  const [priority, setPriority] = useState<TicketPriority>("medium")
  const [description, setDescription] = useState("")
  const [attachments, setAttachments] = useState<File[]>([])

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onCreate({ title, category, priority, description })
    setTitle("")
    setCategory("")
    setPriority("medium")
    setDescription("")
    setAttachments([])
  }

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files) {
      setAttachments([...attachments, ...Array.from(e.target.files)])
    }
  }

  const removeAttachment = (index: number) => {
    setAttachments(attachments.filter((_, i) => i !== index))
  }

  const getPriorityIcon = (p: string) => {
    switch (p) {
      case "high":
        return <AlertTriangle className="w-4 h-4 text-destructive" />
      case "medium":
        return <AlertTriangle className="w-4 h-4 text-secondary" />
      case "low":
        return <AlertTriangle className="w-4 h-4 text-primary" />
      default:
        return null
    }
  }

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="text-xl text-right">إنشاء تذكرة جديدة</DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Title */}
          <div className="space-y-2">
            <Label>العنوان</Label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="عنوان التذكرة..." required />
          </div>

          {/* Category */}
          <div className="space-y-2">
            <Label>الفئة</Label>
            <Select value={category} onValueChange={setCategory} required>
              <SelectTrigger>
                <SelectValue placeholder="اختر الفئة" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {cat}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Priority */}
          <div className="space-y-2">
            <Label>الأولوية</Label>
            <Select value={priority} onValueChange={(value) => setPriority(value as TicketPriority)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">
                  <div className="flex items-center gap-2">
                    {getPriorityIcon("low")}
                    منخفضة
                  </div>
                </SelectItem>
                <SelectItem value="medium">
                  <div className="flex items-center gap-2">
                    {getPriorityIcon("medium")}
                    متوسطة
                  </div>
                </SelectItem>
                <SelectItem value="high">
                  <div className="flex items-center gap-2">
                    {getPriorityIcon("high")}
                    عالية
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Description */}
          <div className="space-y-2">
            <Label>الوصف</Label>
            <Textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder="اكتب تفاصيل المشكلة أو الاستفسار..."
              className="min-h-[120px] resize-none"
              required
            />
          </div>

          {/* Attachments */}
          <div className="space-y-2">
            <Label>المرفقات</Label>
            <div className="space-y-2">
              <label className="flex items-center gap-2 px-4 py-3 bg-muted rounded-xl cursor-pointer hover:bg-muted/80 transition-colors border border-dashed border-border">
                <Paperclip className="w-5 h-5 text-muted-foreground" />
                <span className="text-muted-foreground">إرفاق ملفات</span>
                <input type="file" multiple onChange={handleFileSelect} className="hidden" />
              </label>
              {attachments.length > 0 && (
                <div className="space-y-1">
                  {attachments.map((file, index) => (
                    <div key={index} className="flex items-center justify-between bg-muted/50 px-3 py-2 rounded-lg">
                      <span className="text-sm text-foreground truncate">{file.name}</span>
                      <button
                        type="button"
                        onClick={() => removeAttachment(index)}
                        className="text-muted-foreground hover:text-foreground"
                      >
                        <X className="w-4 h-4" />
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>

          {/* Actions */}
          <div className="flex gap-3 pt-2">
            <Button type="button" variant="outline" onClick={onClose} className="flex-1 bg-transparent">
              إلغاء
            </Button>
            <Button type="submit" className="flex-1">
              إنشاء التذكرة
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  )
}
