import {
  Building2,
  Stethoscope,
  UserRound,
  FlaskConical,
  HeartPulse,
  Pill,
  Phone,
  MapPin,
  Star,
  Clock,
  CheckCircle,
  Shield,
  Video,
  Home,
  Calendar,
  AlertCircle,
  Bed,
  Search,
  SlidersHorizontal,
  ChevronLeft,
  ChevronRight,
  ArrowLeft,
  Eye,
  ShoppingCart,
  Truck,
  BadgeCheck,
  Award,
  Users,
  Activity,
  Syringe,
  Thermometer,
  Droplets,
  Brain,
  Bone,
  Baby,
  Heart,
  Ear,
  type LucideIcon,
} from "lucide-react"

// Healthcare Service Icons
export const Icons = {
  // Main Services
  hospital: Building2,
  clinic: Stethoscope,
  doctor: UserRound,
  labTest: FlaskConical,
  nursing: HeartPulse,
  pharmacy: Pill,

  // Contact & Location
  phone: Phone,
  location: MapPin,
  emergency: AlertCircle,

  // Rating & Reviews
  star: Star,
  verified: CheckCircle,
  badge: BadgeCheck,
  award: Award,

  // Time & Scheduling
  clock: Clock,
  calendar: Calendar,

  // Services
  insurance: Shield,
  online: Video,
  homeVisit: Home,
  delivery: Truck,

  // Hospital Facilities
  bed: Bed,
  icu: Activity,

  // UI Actions
  search: Search,
  filter: SlidersHorizontal,
  view: Eye,
  cart: ShoppingCart,
  arrowLeft: ArrowLeft,
  chevronLeft: ChevronLeft,
  chevronRight: ChevronRight,

  // Users
  users: Users,

  // Medical Specialties
  syringe: Syringe,
  thermometer: Thermometer,
  blood: Droplets,
  brain: Brain,
  bone: Bone,
  baby: Baby,
  heart: Heart,
  ear: Ear,
} as const

export type IconName = keyof typeof Icons

// Helper component for consistent icon rendering
interface IconProps {
  name: IconName
  className?: string
  size?: number
}

export function Icon({ name, className, size = 24 }: IconProps) {
  const IconComponent = Icons[name]
  return <IconComponent className={className} size={size} />
}

// Service category icons mapping
export const serviceIcons: Record<string, LucideIcon> = {
  hospitals: Building2,
  clinics: Stethoscope,
  doctors: UserRound,
  "home-tests": FlaskConical,
  "home-nursing": HeartPulse,
  pharmacy: Pill,
}

// Specialty icons mapping
export const specialtyIcons: Record<string, LucideIcon> = {
  قلب: Heart,
  عظام: Bone,
  أطفال: Baby,
  مخ: Brain,
  أنف: Ear,
  تحاليل: FlaskConical,
  باطنة: Activity,
}
