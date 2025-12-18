"use client"

import { useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Phone, Mail, MapPin, Calendar, Edit2, Check, X, Loader2 } from "lucide-react"

interface UserData {
  firstName: string
  lastName: string
  email: string
  phone: string
  address: string
  createdAt: string
}

interface ProfileHeaderProps {
  user: UserData | null
  loading: boolean
  onUpdate: (data: Partial<UserData>) => Promise<void>
}

export default function ProfileHeader({ user, loading, onUpdate }: ProfileHeaderProps) {
  const [isEditing, setIsEditing] = useState(false)
  const [saving, setSaving] = useState(false)
  const [editData, setEditData] = useState({
    firstName: "",
    lastName: "",
    phone: "",
    address: "",
  })

  const handleStartEdit = () => {
    if (user) {
      setEditData({
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone || "",
        address: user.address || "",
      })
    }
    setIsEditing(true)
  }

  const handleSave = async () => {
    setSaving(true)
    try {
      await onUpdate(editData)
      setIsEditing(false)
    } catch (error) {
      console.error("Error saving:", error)
    } finally {
      setSaving(false)
    }
  }

  const handleCancel = () => {
    setIsEditing(false)
  }

  const getInitials = () => {
    if (!user) return "?"
    return `${user.firstName?.charAt(0) || ""}${user.lastName?.charAt(0) || ""}`
  }

  const formatDate = (dateString: string) => {
    if (!dateString) return "غير محدد"
    const date = new Date(dateString)
    return date.toLocaleDateString("ar-EG", { year: "numeric", month: "long" })
  }

  if (loading) {
    return (
      <Card className="mb-4 xs:mb-6 sm:mb-8 bg-white/90 backdrop-blur-sm shadow-xl border-0">
        <CardContent className="p-4 xs:p-6 sm:p-8">
          <div className="flex items-center justify-center py-8">
            <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card className="mb-4 xs:mb-6 sm:mb-8 bg-white/90 backdrop-blur-sm shadow-xl border-0 overflow-hidden">
      <div className="relative">
        <div className="absolute inset-0 bg-gradient-to-br from-emerald-400/30 via-teal-400/30 to-cyan-400/30"></div>

        <CardContent className="relative p-4 xs:p-6 sm:p-8">
          <div className="flex flex-col lg:flex-row items-center gap-4 xs:gap-6 lg:gap-8">
            {/* Avatar Section */}
            <div className="relative group">
              <div className="absolute inset-0 bg-gradient-to-br from-emerald-500 to-teal-600 rounded-full blur-xl opacity-40 group-hover:opacity-60 transition-opacity"></div>
              <Avatar className="w-24 xs:w-28 sm:w-36 h-24 xs:h-28 sm:h-36 ring-4 ring-white shadow-2xl relative">
                <AvatarImage src="/placeholder.svg?height=144&width=144" />
                <AvatarFallback className="bg-gradient-to-br from-emerald-500 to-teal-600 text-white text-2xl xs:text-3xl sm:text-4xl font-bold">
                  {getInitials()}
                </AvatarFallback>
              </Avatar>
            </div>

            {/* User Info */}
            <div className="flex-1 text-center lg:text-right space-y-3 xs:space-y-4 w-full">
              {isEditing ? (
                <div className="space-y-3 xs:space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 xs:gap-4">
                    <div>
                      <label className="text-xs xs:text-sm text-gray-700 font-medium mb-1.5 block">الاسم الأول</label>
                      <Input
                        value={editData.firstName}
                        onChange={(e) => setEditData({ ...editData, firstName: e.target.value })}
                        className="text-right text-sm xs:text-base bg-white/80"
                        dir="rtl"
                      />
                    </div>
                    <div>
                      <label className="text-xs xs:text-sm text-gray-700 font-medium mb-1.5 block">الاسم الأخير</label>
                      <Input
                        value={editData.lastName}
                        onChange={(e) => setEditData({ ...editData, lastName: e.target.value })}
                        className="text-right text-sm xs:text-base bg-white/80"
                        dir="rtl"
                      />
                    </div>
                    <div>
                      <label className="text-xs xs:text-sm text-gray-700 font-medium mb-1.5 block">رقم الهاتف</label>
                      <Input
                        value={editData.phone}
                        onChange={(e) => setEditData({ ...editData, phone: e.target.value })}
                        className="text-right text-sm xs:text-base bg-white/80"
                        dir="rtl"
                      />
                    </div>
                    <div>
                      <label className="text-xs xs:text-sm text-gray-700 font-medium mb-1.5 block">العنوان</label>
                      <Input
                        value={editData.address}
                        onChange={(e) => setEditData({ ...editData, address: e.target.value })}
                        className="text-right text-sm xs:text-base bg-white/80"
                        dir="rtl"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2 justify-center lg:justify-start">
                    <Button
                      size="sm"
                      onClick={handleSave}
                      disabled={saving}
                      className="bg-emerald-600 hover:bg-emerald-700 min-h-[44px] px-4 xs:px-6 touch-manipulation shadow-md"
                    >
                      {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                      <span className="mr-1 text-xs xs:text-sm">حفظ</span>
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={handleCancel}
                      disabled={saving}
                      className="min-h-[44px] px-4 xs:px-6 touch-manipulation bg-white/80"
                    >
                      <X className="w-4 h-4" />
                      <span className="mr-1 text-xs xs-text-sm">إلغاء</span>
                    </Button>
                  </div>
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex flex-col lg:flex-row lg:items-center gap-2 xs:gap-3 justify-center lg:justify-start">
                    <h1 className="text-2xl xs:text-3xl sm:text-4xl font-bold text-gray-900">
                      {user ? `${user.firstName} ${user.lastName}` : "جاري التحميل..."}
                    </h1>
                    <Button
                      size="sm"
                      variant="ghost"
                      onClick={handleStartEdit}
                      className="text-emerald-600 hover:text-emerald-700 hover:bg-emerald-50/50 min-h-[44px] touch-manipulation"
                    >
                      <Edit2 className="w-4 xs:w-5 h-4 xs:h-5" />
                      <span className="mr-1.5 text-sm xs:text-base">تعديل الملف</span>
                    </Button>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 xs:gap-4 text-sm xs:text-base">
                    <div className="flex items-center justify-center lg:justify-start gap-2 bg-white/60 backdrop-blur-sm px-3 py-2 rounded-lg">
                      <Phone className="w-4 xs:w-5 h-4 xs:h-5 text-emerald-600 shrink-0" />
                      <span className="truncate font-medium">{user?.phone || "لم يتم إضافة رقم"}</span>
                    </div>
                    <div className="flex items-center justify-center lg:justify-start gap-2 bg-white/60 backdrop-blur-sm px-3 py-2 rounded-lg">
                      <Mail className="w-4 xs:w-5 h-4 xs:h-5 text-emerald-600 shrink-0" />
                      <span className="truncate font-medium">{user?.email || "غير محدد"}</span>
                    </div>
                    <div className="flex items-center justify-center lg:justify-start gap-2 bg-white/60 backdrop-blur-sm px-3 py-2 rounded-lg">
                      <Calendar className="w-4 xs:w-5 h-4 xs:h-5 text-emerald-600 shrink-0" />
                      <span className="truncate font-medium">عضو منذ {formatDate(user?.createdAt || "")}</span>
                    </div>
                    <div className="flex items-center justify-center lg:justify-start gap-2 bg-white/60 backdrop-blur-sm px-3 py-2 rounded-lg">
                      <MapPin className="w-4 xs:w-5 h-4 xs:h-5 text-emerald-600 shrink-0" />
                      <span className="truncate font-medium">{user?.address || "لم يتم إضافة عنوان"}</span>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </div>
    </Card>
  )
}
