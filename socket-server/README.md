# Ticket Support Socket.IO Server

خادم WebSocket في الوقت الفعلي لنظام دعم التذاكر.

## المميزات

- رسائل في الوقت الفعلي
- مؤشرات الكتابة
- تتبع حضور المستخدمين/الوكلاء
- تحديثات حالة التذكرة
- تعيين الوكلاء
- تخزين MongoDB

## المتطلبات

- Node.js 18+
- MongoDB 6+
- npm أو yarn

## التثبيت

\`\`\`bash
cd socket-server
npm install
\`\`\`

## الإعداد

1. انسخ ملف البيئة:
\`\`\`bash
cp .env.example .env
\`\`\`

2. عدّل `.env`:
\`\`\`env
PORT=5000
MONGO_URI=mongodb://localhost:27017/ticket-system
CORS_ORIGIN=http://localhost:3000
\`\`\`

## التشغيل

### وضع التطوير
\`\`\`bash
npm run dev
\`\`\`

### وضع الإنتاج
\`\`\`bash
npm run build
npm start
\`\`\`

## API Endpoints

| Method | Endpoint | الوصف |
|--------|----------|-------|
| GET | `/health` | فحص صحة الخادم |
| GET | `/tickets` | جلب جميع التذاكر |
| POST | `/tickets` | إنشاء تذكرة جديدة |
| GET | `/tickets/:id` | جلب تذكرة محددة |
| GET | `/tickets/:id/messages` | جلب رسائل التذكرة |
| GET | `/tickets/stats/counts` | إحصائيات التذاكر |

## Socket Events

### من العميل إلى الخادم

\`\`\`typescript
// الانضمام لغرفة تذكرة
socket.emit("join_ticket", {
  ticketId: "...",
  userId: "...",
  userType: "user" | "agent",
  userName: "..."
});

// إرسال رسالة
socket.emit("send_message", {
  ticketId: "...",
  senderId: "...",
  senderType: "user" | "agent",
  senderName: "...",
  content: "..."
});

// مؤشر الكتابة
socket.emit("typing", {
  ticketId: "...",
  senderId: "...",
  senderName: "...",
  isTyping: true
});

// تغيير حالة التذكرة
socket.emit("ticket_status_change", {
  ticketId: "...",
  status: "open" | "pending" | "closed",
  changedBy: "...",
  changedByName: "..."
});
\`\`\`

### من الخادم إلى العميل

\`\`\`typescript
// استقبال رسالة
socket.on("message_received", (data) => {
  console.log(data.message);
});

// مؤشر الكتابة
socket.on("typing_indicator", (data) => {
  console.log(`${data.senderName} يكتب...`);
});

// تحديث التذكرة
socket.on("ticket_updated", (data) => {
  console.log(`تم تغيير الحالة إلى ${data.status}`);
});

// انضمام مستخدم
socket.on("user_joined", (data) => {
  console.log(`${data.userName} انضم للمحادثة`);
});

// مغادرة مستخدم
socket.on("user_left", (data) => {
  console.log(`${data.userName} غادر المحادثة`);
});
\`\`\`

## الاتصال من Next.js

\`\`\`typescript
import { io, Socket } from "socket.io-client";

const SOCKET_URL = process.env.NEXT_PUBLIC_SOCKET_URL || "http://localhost:5000";

let socket: Socket | null = null;

export const connectSocket = (): Socket => {
  if (!socket) {
    socket = io(SOCKET_URL, {
      transports: ["websocket"],
      autoConnect: true,
    });
  }
  return socket;
};

export const disconnectSocket = (): void => {
  if (socket) {
    socket.disconnect();
    socket = null;
  }
};

// استخدام في component
const socket = connectSocket();

socket.emit("join_ticket", {
  ticketId: "ticket_id_here",
  userId: "user_id_here",
  userType: "user",
  userName: "اسم المستخدم"
});

socket.on("message_received", (data) => {
  // أضف الرسالة للقائمة
  setMessages(prev => [...prev, data.message]);
});
\`\`\`

## البنية

\`\`\`
socket-server/
├── src/
│   ├── config/
│   │   └── db.ts          # اتصال MongoDB
│   ├── models/
│   │   ├── Ticket.ts      # نموذج التذكرة
│   │   └── Message.ts     # نموذج الرسالة
│   ├── socket/
│   │   └── index.ts       # معالجات Socket.IO
│   ├── types.ts           # تعريفات TypeScript
│   └── app.ts             # نقطة الدخول
├── package.json
├── tsconfig.json
├── .env.example
└── README.md
\`\`\`

## الترخيص

MIT
