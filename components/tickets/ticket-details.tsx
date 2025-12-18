"use client"

import { useState } from "react"
import { cn } from "@/lib/utils"
import { formatDistanceToNow, format } from "date-fns"
import { ar } from "date-fns/locale"
import { X, User, Clock, AlertTriangle, Tag, FileText, Mail, Calendar } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog"
import type { Ticket, Agent } from "@/types/ticket"

interface TicketDetailsProps {
  ticket: Ticket
  agents: Agent[]
  onUpdateTicket: (ticketId: string, updates: Partial<Ticket>) => void
  onClose: () => void
  isMobile?: boolean
}

export function TicketDetails({ ticket, agents = [], onUpdateTicket, onClose, isMobile }: TicketDetailsProps) {
  const [internalNote, setInternalNote] = useState("")
  const [showCloseConfirm, setShowCloseConfirm] = useState(false)

  const safeAgents = agents || []

  const getSlaStatus = () => {
    if (!ticket.slaDeadline) return null
    const now = new Date()
    const diff = ticket.slaDeadline.getTime() - now.getTime()
    const hours = Math.floor(diff / (1000 * 60 * 60))
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

    if (diff < 0) {
      return { label: "تجاوز الوقت", color: "bg-destructive/10 text-destructive border-destructive/20" }
    } else if (hours < 1) {
      return { label: `${minutes} دقيقة`, color: "bg-secondary/10 text-secondary border-secondary/20" }
    } else {
      return { label: `${hours} ساعة`, color: "bg-primary/10 text-primary border-primary/20" }
    }
  }

  const slaStatus = getSlaStatus()

  const handleClose = () => {
    onUpdateTicket(ticket.id, { status: "closed" })
    setShowCloseConfirm(false)
  }

  const getInitial = (name?: string) => {
    return name && name.length > 0 ? name.charAt(0) : "?"
  }

  return (
    <>
      <div className={cn("bg-card flex flex-col border-r border-border", isMobile ? "w-full" : "md:w-[340px]")}>
        {/* Header */}
        {!isMobile && (
          <div className="h-16 px-4 flex items-center justify-between border-b border-border flex-shrink-0">
            <h3 className="font-semibold text-foreground">تفاصيل التذكرة</h3>
            <Button
              variant="ghost"
              size="icon"
              onClick={onClose}
              className="text-muted-foreground hover:text-foreground"
            >
              <X className="w-5 h-5" />
            </Button>
          </div>
        )}

        {/* Content */}
        <div className="flex-1 overflow-y-auto p-4 space-y-6">
          {/* Ticket ID & Title */}
          <div className="bg-muted/50 rounded-xl p-4">
            <p className="text-xs text-muted-foreground mb-1">رقم التذكرة</p>
            <p className="text-lg font-bold text-foreground">#{ticket.id}</p>
            <p className="text-sm text-muted-foreground mt-1">{ticket.title}</p>
          </div>

          {/* Status */}
          <div>
            <label className="text-xs text-muted-foreground mb-2 block font-medium">الحالة</label>
            <Select
              value={ticket.status}
              onValueChange={(value) => onUpdateTicket(ticket.id, { status: value as Ticket["status"] })}
            >
              <SelectTrigger className="bg-background border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="open">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-primary" />
                    مفتوحة
                  </div>
                </SelectItem>
                <SelectItem value="pending">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-secondary" />
                    قيد الانتظار
                  </div>
                </SelectItem>
                <SelectItem value="closed">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-muted-foreground" />
                    مغلقة
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Priority */}
          <div>
            <label className="text-xs text-muted-foreground mb-2 block font-medium">الأولوية</label>
            <Select
              value={ticket.priority}
              onValueChange={(value) => onUpdateTicket(ticket.id, { priority: value as Ticket["priority"] })}
            >
              <SelectTrigger className="bg-background border-border">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="low">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-primary" />
                    منخفضة
                  </div>
                </SelectItem>
                <SelectItem value="medium">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-secondary" />
                    متوسطة
                  </div>
                </SelectItem>
                <SelectItem value="high">
                  <div className="flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                    عالية
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Assignee */}
          <div>
            <label className="text-xs text-muted-foreground mb-2 block font-medium">المسؤول</label>
            <Select
              value={ticket.assignee?.name || "unassigned"}
              onValueChange={(value) => {
                if (value === "unassigned") {
                  onUpdateTicket(ticket.id, { assignee: null })
                } else {
                  const agent = safeAgents.find((a) => a.name === value)
                  if (agent) {
                    onUpdateTicket(ticket.id, { assignee: { id: agent.id, name: agent.name, avatar: agent.avatar } })
                  }
                }
              }}
            >
              <SelectTrigger className="bg-background border-border">
                <SelectValue placeholder="غير معين" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="unassigned">
                  <div className="flex items-center gap-2">
                    <User className="w-4 h-4 text-muted-foreground" />
                    غير معين
                  </div>
                </SelectItem>
                {safeAgents.length > 0 &&
                  safeAgents.map((agent) => (
                    <SelectItem key={agent.id} value={agent.name}>
                      <div className="flex items-center gap-2">
                        <Avatar className="w-5 h-5">
                          <AvatarImage src={agent.avatar || "/placeholder.svg"} />
                          <AvatarFallback className="text-xs">{getInitial(agent.name)}</AvatarFallback>
                        </Avatar>
                        {agent.name}
                      </div>
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>

          {/* SLA Timer */}
          {slaStatus && ticket.status !== "closed" && (
            <div>
              <label className="text-xs text-muted-foreground mb-2 block font-medium">الوقت المتبقي (SLA)</label>
              <div className={cn("flex items-center gap-2 px-4 py-3 rounded-xl border", slaStatus.color)}>
                <Clock className="w-4 h-4" />
                <span className="font-semibold">{slaStatus.label}</span>
              </div>
            </div>
          )}

          {/* Tags */}
          {ticket.tags && ticket.tags.length > 0 && (
            <div>
              <label className="text-xs text-muted-foreground mb-2 block font-medium">التصنيفات</label>
              <div className="flex flex-wrap gap-2">
                {ticket.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="bg-primary/10 text-primary border-0 gap-1">
                    <Tag className="w-3 h-3" />
                    {tag}
                  </Badge>
                ))}
              </div>
            </div>
          )}

          <Separator />

          {/* Customer Info */}
          <div className="bg-muted/50 rounded-xl p-4">
            <h4 className="text-sm font-semibold text-foreground mb-4 flex items-center gap-2">
              <User className="w-4 h-4 text-primary" />
              معلومات العميل
            </h4>
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <Avatar className="w-12 h-12 border-2 border-border">
                  <AvatarImage src={ticket.customer?.avatar || "/placeholder.svg"} />
                  <AvatarFallback className="bg-primary/10 text-primary font-semibold">
                    {getInitial(ticket.customer?.name)}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p className="text-foreground font-semibold">{ticket.customer?.name || "عميل"}</p>
                  <p className="text-xs text-muted-foreground flex items-center gap-1">
                    <Mail className="w-3 h-3" />
                    {ticket.customer?.email || "غير متوفر"}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Internal Notes */}
          <div>
            <label className="text-xs text-muted-foreground mb-2 block font-medium flex items-center gap-1">
              <FileText className="w-3 h-3" />
              ملاحظات داخلية
            </label>
            <Textarea
              value={internalNote}
              onChange={(e) => setInternalNote(e.target.value)}
              placeholder="أضف ملاحظة داخلية (لن تظهر للعميل)..."
              className="bg-background border-border resize-none min-h-[100px]"
            />
          </div>

          {/* Timestamps */}
          <div className="bg-muted/30 rounded-xl p-4 space-y-2">
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Calendar className="w-3.5 h-3.5" />
              <span>تم الإنشاء: {format(ticket.createdAt, "dd/MM/yyyy hh:mm a", { locale: ar })}</span>
            </div>
            <div className="flex items-center gap-2 text-xs text-muted-foreground">
              <Clock className="w-3.5 h-3.5" />
              <span>آخر تحديث: {formatDistanceToNow(ticket.updatedAt, { addSuffix: true, locale: ar })}</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="p-4 border-t border-border space-y-2">
          <Button
            variant="outline"
            className="w-full border-primary text-primary hover:bg-primary hover:text-primary-foreground bg-transparent"
          >
            تصعيد التذكرة
          </Button>
          {ticket.status !== "closed" ? (
            <Button variant="destructive" className="w-full" onClick={() => setShowCloseConfirm(true)}>
              إغلاق التذكرة
            </Button>
          ) : (
            <Button
              className="w-full bg-primary hover:bg-primary/90"
              onClick={() => onUpdateTicket(ticket.id, { status: "open" })}
            >
              إعادة فتح التذكرة
            </Button>
          )}
        </div>
      </div>

      {/* Close Confirmation */}
      <AlertDialog open={showCloseConfirm} onOpenChange={setShowCloseConfirm}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="text-right">هل أنت متأكد من إغلاق التذكرة؟</AlertDialogTitle>
            <AlertDialogDescription className="text-right">
              سيتم إغلاق التذكرة رقم #{ticket.id}. يمكنك إعادة فتحها لاحقاً إذا لزم الأمر.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>إلغاء</AlertDialogCancel>
            <AlertDialogAction onClick={handleClose} className="bg-destructive hover:bg-destructive/90">
              إغلاق التذكرة
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  )
}
