import mongoose, { Mongoose } from "mongoose";

// الحصول على رابط الاتصال من متغيرات البيئة
const MONGODB_URI = process.env.MONGODB_URI;

if (!MONGODB_URI) {
  throw new Error(
    "⚠️ لم يتم العثور على رابط الاتصال بـ MongoDB.\n" +
    "يرجى إضافة MONGODB_URI في ملف .env.local\n" +
    "راجع ملف .env.local.example للتعليمات"
  );
}

interface MongooseCache {
  conn: Mongoose | null;
  promise: Promise<Mongoose> | null;
}

declare global {
  // eslint-disable-next-line no-var
  var mongooseCache: MongooseCache | undefined;
}

let cached: MongooseCache = global.mongooseCache || { conn: null, promise: null };

async function dbConnect(): Promise<Mongoose> {
  if (cached.conn) {
    return cached.conn;
  }

  if (!cached.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 10,
    };

    // لاحظ هنا: استخدمنا MONGODB_URI! علشان نؤكد إنه مش undefined
    cached.promise = mongoose
      .connect(MONGODB_URI!, opts)
      .then((mongoose) => {
        console.log("✅ تم الاتصال بـ MongoDB بنجاح.");
        return mongoose;
      })
      .catch((err) => {
        console.error("❌ خطأ أثناء الاتصال بـ MongoDB:", err);

        if (err.code === "ECONNREFUSED") {
          console.error("❌ فشل الاتصال: تم رفض الاتصال بخادم MongoDB.");
        } else if (err.code === "ENOTFOUND" || err.code === "EAI_AGAIN") {
          console.error("❌ فشل الاتصال: يرجى التحقق من أن خادم MongoDB يعمل وأن رابط الاتصال صحيح.");
        } else if (err.message?.includes("authentication failed")) {
          console.error("❌ فشل التوثيق: يرجى التحقق من اسم المستخدم وكلمة المرور في رابط الاتصال.");
        }

        throw err;
      });
  }

  cached.conn = await cached.promise;
  global.mongooseCache = cached;
  return cached.conn;
}

export default dbConnect;
