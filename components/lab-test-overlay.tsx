"use client"

import type React from "react"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { X, Clock, Calendar, CheckCircle } from "lucide-react"

interface LabTestOverlayProps {
  isOpen: boolean
  onClose: () => void
}

const labTests = [
  {
    id: "1",
    name: "تحليل الدم الشامل (CBC)",
    price: 80,
    description: "فحص شامل لخلايا الدم الحمراء والبيضاء والصفائح الدموية",
    category: "تحاليل الدم",
    duration: "24 ساعة",
    popular: true,
  },
  {
    id: "2",
    name: "تحليل السكر التراكمي (HbA1c)",
    price: 120,
    description: "قياس متوسط مستوى السكر في الدم خلال الشهرين الماضيين",
    category: "تحاليل السكري",
    duration: "24 ساعة",
    popular: true,
  },
  {
    id: "3",
    name: "تحليل وظائف الكلى",
    price: 150,
    description: "فحص الكرياتينين واليوريا ومعدل الترشيح الكلوي",
    category: "تحاليل الكلى",
    duration: "48 ساعة",
    popular: false,
  },
  {
    id: "4",
    name: "تحليل وظائف الكبد",
    price: 140,
    description: "فحص إنزيمات الكبد والبيليروبين والألبومين",
    category: "تحاليل الكبد",
    duration: "24 ساعة",
    popular: false,
  },
  {
    id: "5",
    name: "تحليل الدهون الثلاثية والكوليسترول",
    price: 100,
    description: "فحص مستويات الكوليسترول والدهون الثلاثية في الدم",
    category: "تحاليل القلب",
    duration: "24 ساعة",
    popular: true,
  },
  {
    id: "6",
    name: "تحليل هرمونات الغدة الدرقية",
    price: 200,
    description: "فحص TSH, T3, T4 لتقييم وظائف الغدة الدرقية",
    category: "تحاليل الهرمونات",
    duration: "48 ساعة",
    popular: false,
  },
  {
    id: "7",
    name: "تحليل فيتامين د",
    price: 90,
    description: "قياس مستوى فيتامين د في الدم",
    category: "تحاليل الفيتامينات",
    duration: "24 ساعة",
    popular: true,
  },
  {
    id: "8",
    name: "تحليل البول الكامل",
    price: 60,
    description: "فحص شامل للبول للكشف عن الالتهابات والأمراض",
    category: "تحاليل البول",
    duration: "12 ساعة",
    popular: false,
  },
]

export function LabTestOverlay({ isOpen, onClose }: LabTestOverlayProps) {
  const [selectedTests, setSelectedTests] = useState<string[]>([])
  const [formData, setFormData] = useState({
    patientName: "",
    phone: "",
    address: "",
    preferredDate: "",
    preferredTime: "",
    notes: "",
  })

  if (!isOpen) return null

  const handleTestSelection = (testId: string) => {
    setSelectedTests((prev) => (prev.includes(testId) ? prev.filter((id) => id !== testId) : [...prev, testId]))
  }

  const selectedTestsData = labTests.filter((test) => selectedTests.includes(test.id))
  const totalPrice = selectedTestsData.reduce((sum, test) => sum + test.price, 0)

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    console.log("Lab test request submitted:", { ...formData, selectedTests, totalPrice })
    onClose()
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-2xl max-w-5xl w-full max-h-[90vh] overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-gray-200 p-6 rounded-t-2xl">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-2xl font-bold text-gray-900">حجز تحليل منزلي</h2>
              <p className="text-gray-600 mt-1">اختر التحاليل المطلوبة واحجز موعد في منزلك</p>
            </div>
            <Button variant="ghost" size="icon" onClick={onClose}>
              <X className="w-6 h-6" />
            </Button>
          </div>
        </div>

        <div className="p-6 space-y-8">
          {/* Available Tests */}
          <div>
            <h3 className="text-xl font-semibold text-gray-900 mb-4">التحاليل المتاحة</h3>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {labTests.map((test) => (
                <Card
                  key={test.id}
                  className={`cursor-pointer transition-all duration-200 ${
                    selectedTests.includes(test.id)
                      ? "ring-2 ring-emerald-500 border-emerald-500 bg-emerald-50"
                      : "hover:shadow-lg"
                  }`}
                  onClick={() => handleTestSelection(test.id)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-start gap-3">
                      <Checkbox
                        checked={selectedTests.includes(test.id)}
                        onChange={() => handleTestSelection(test.id)}
                        className="mt-1"
                      />
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h4 className="font-semibold text-gray-900">{test.name}</h4>
                          {test.popular && (
                            <Badge variant="secondary" className="text-xs">
                              شائع
                            </Badge>
                          )}
                        </div>

                        <p className="text-sm text-gray-600 mb-3">{test.description}</p>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-4 text-xs text-gray-500">
                            <div className="flex items-center gap-1">
                              <Clock className="w-3 h-3" />
                              <span>{test.duration}</span>
                            </div>
                            <Badge variant="outline" className="text-xs">
                              {test.category}
                            </Badge>
                          </div>
                          <div className="text-lg font-bold text-emerald-600">{test.price} ر.س</div>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Selected Tests Summary */}
          {selectedTests.length > 0 && (
            <Card className="bg-emerald-50 border-emerald-200">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-emerald-800">
                  <CheckCircle className="w-5 h-5" />
                  التحاليل المختارة ({selectedTests.length})
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 mb-4">
                  {selectedTestsData.map((test) => (
                    <div key={test.id} className="flex items-center justify-between text-sm">
                      <span className="text-gray-700">{test.name}</span>
                      <span className="font-semibold text-emerald-600">{test.price} ر.س</span>
                    </div>
                  ))}
                </div>
                <div className="border-t border-emerald-200 pt-2">
                  <div className="flex items-center justify-between text-lg font-bold text-emerald-800">
                    <span>المجموع الكلي:</span>
                    <span>{totalPrice} ر.س</span>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Booking Form */}
          {selectedTests.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5" />
                  تفاصيل الحجز
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="patientName">اسم المريض</Label>
                      <Input
                        id="patientName"
                        value={formData.patientName}
                        onChange={(e) => setFormData({ ...formData, patientName: e.target.value })}
                        placeholder="أدخل اسم المريض"
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">رقم الهاتف</Label>
                      <Input
                        id="phone"
                        type="tel"
                        value={formData.phone}
                        onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                        placeholder="05xxxxxxxx"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="address">العنوان</Label>
                    <Textarea
                      id="address"
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      placeholder="أدخل العنوان التفصيلي"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="preferredDate">التاريخ المفضل</Label>
                      <Input
                        id="preferredDate"
                        type="date"
                        value={formData.preferredDate}
                        onChange={(e) => setFormData({ ...formData, preferredDate: e.target.value })}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="preferredTime">الوقت المفضل</Label>
                      <Input
                        id="preferredTime"
                        type="time"
                        value={formData.preferredTime}
                        onChange={(e) => setFormData({ ...formData, preferredTime: e.target.value })}
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <Label htmlFor="notes">ملاحظات إضافية</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="أي ملاحظات أو تعليمات خاصة"
                    />
                  </div>

                  <div className="bg-gray-50 p-4 rounded-lg">
                    <h4 className="font-semibold text-gray-900 mb-2">معلومات مهمة:</h4>
                    <ul className="text-sm text-gray-600 space-y-1">
                      <li>• يجب الصيام 12 ساعة قبل تحاليل الدهون والسكر</li>
                      <li>• سيتم التواصل معك لتأكيد الموعد</li>
                      <li>• النتائج ستكون متاحة خلال المدة المحددة لكل تحليل</li>
                      <li>• رسوم الزيارة المنزلية: 50 ر.س إضافية</li>
                    </ul>
                  </div>

                  <div className="flex gap-4">
                    <Button type="submit" className="flex-1 bg-emerald-600 hover:bg-emerald-700">
                      تأكيد الحجز - {totalPrice + 50} ر.س
                    </Button>
                    <Button type="button" variant="outline" onClick={onClose}>
                      إلغاء
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}
