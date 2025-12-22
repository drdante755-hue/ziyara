"use client";

import { useEffect } from "react";

export default function MobileSuccess() {
  useEffect(() => {
    // افتح التطبيق
    window.location.href = "com.firstapp.learnapk://oauth-redirect";

    // fallback لو التطبيق مش متسطب
    setTimeout(() => {
      window.location.href = "/";
    }, 1500);
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: 40 }}>
      <h2>جاري تسجيل الدخول...</h2>
      <p>سيتم تحويلك للتطبيق تلقائيًا</p>
    </div>
  );
}
