"use client";

import { useEffect } from "react";

export default function MobileSuccessPage() {
  useEffect(() => {
    // 🔁 رجّع للتطبيق
    window.location.href = "com.firstapp.learnapk://oauth-redirect";
  }, []);

  return (
    <div style={{ textAlign: "center", marginTop: "50px" }}>
      <h2>تم تسجيل الدخول بنجاح</h2>
      <p>سيتم الرجوع للتطبيق...</p>
    </div>
  );
}
