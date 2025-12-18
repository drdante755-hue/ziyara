import nodemailer from "nodemailer";

type Transporter = nodemailer.Transporter;

function getTransporter(): Transporter {
  if (!process.env.EMAIL_USER || !process.env.EMAIL_PASS) {
    throw new Error("EMAIL_USER or EMAIL_PASS is not set in environment variables");
  }
  return nodemailer.createTransport({
    service: "gmail",
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });
}

function baseEmailWrapper(contentHtml: string, previewText?: string) {
  return `
<!DOCTYPE html>
<html lang="ar" dir="rtl">
  <head>
    <meta http-equiv="Content-Type" content="text/html; charset=UTF-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <title>زيارة</title>
    <style>
      @media (max-width: 600px) {
        .container { padding: 16px !important; }
        .card { padding: 20px !important; }
      }
      .btn:hover { filter: brightness(0.95); }
    </style>
  </head>
  <body style="margin:0;background:#f6f9fc;font-family:Tahoma, Arial, sans-serif;color:#0f172a;">
    ${previewText ? `<span style="display:none !important;visibility:hidden;opacity:0;color:transparent;height:0;width:0;">${previewText}</span>` : ""}
    <div class="container" style="padding:24px;">
      <table role="presentation" cellspacing="0" cellpadding="0" border="0" align="center" width="100%" style="max-width:620px;margin:auto;">
        <tr>
          <td style="text-align:center;padding:16px 0 8px;">
            <div style="display:inline-flex;align-items:center;justify-content:center;width:56px;height:56px;border-radius:16px;background:linear-gradient(135deg,#10b981,#0ea5a6);box-shadow:0 6px 16px rgba(16,185,129,0.25);">
              <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="#ffffff" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                <path d="M19.428 15.428a2 2 0 00-1.022-.547l-2.387-.477a6 6 0 00-3.86.517l-.318.158a6 6 0 01-3.86.517L6.05 15.21a2 2 0 00-1.806.547M8 4h8l-1 1v5.172a2 2 0 00.586 1.414l5 5c1.26 1.26.367 3.414-1.415 3.414H4.828c-1.782 0-2.674-2.154-1.414-3.414l5-5A2 2 0 009 10.172V5L8 4z"/>
              </svg>
            </div>
            <div style="font-size:22px;font-weight:700;background:linear-gradient(90deg,#059669,#0ea5a6,#06b6d4);-webkit-background-clip:text;background-clip:text;color:transparent;margin-top:8px;">زيارة</div>
          </td>
        </tr>
        <tr>
          <td>
            <div class="card" style="background:#ffffff;border-radius:16px;padding:28px;box-shadow:0 8px 24px rgba(2,6,23,0.06);">
              ${contentHtml}
            </div>
            <div style="text-align:center;color:#64748b;font-size:12px;margin-top:16px;">
              هذا البريد تم إرساله تلقائياً، لا ترد على هذه الرسالة.
              <br/>© ${new Date().getFullYear()} زيارة. جميع الحقوق محفوظة.
            </div>
          </td>
        </tr>
      </table>
    </div>
  </body>
</html>`;
}

function verificationContentHtml(code: string) {
  return `
    <h1 style="margin:0 0 12px;font-size:20px;color:#0f172a;">رمز التحقق من زيارة</h1>
    <p style="margin:0 0 16px;font-size:14px;color:#334155;line-height:1.8;">
      شكراً لانضمامك إلى <strong>زيارة</strong>.
      يرجى استخدام رمز التحقق التالي لإكمال عملية التأكيد. صلاحية الرمز محدودة.
    </p>
    <div style="text-align:center;margin:24px 0;">
      <div style="display:inline-block;padding:12px 20px;border-radius:12px;border:1px dashed #10b981;background:#ecfdf5;color:#065f46;font-size:24px;font-weight:800;letter-spacing:6px;">
        ${code}
      </div>
    </div>
    <p style="margin:0;font-size:13px;color:#475569;">إذا لم تقم بهذا الطلب، يمكنك تجاهل هذا البريد بأمان.</p>
  `;
}

function resetContentHtml({
  code,
  resetLink,
}: { code?: string; resetLink?: string }) {
  const intro = `
    <h1 style=\"margin:0 0 12px;font-size:20px;color:#0f172a;\">استعادة كلمة المرور</h1>
    <p style=\"margin:0 0 16px;font-size:14px;color:#334155;line-height:1.8;\">
      تلقينا طلباً لاستعادة كلمة المرور لحسابك في <strong>زيارة</strong>.
      يرجى اتباع الخطوات التالية لإكمال العملية.
    </p>
  `;
  if (resetLink) {
    return `
      ${intro}
      <div style=\"text-align:center;margin:24px 0;\">
        <a class=\"btn\" href=\"${resetLink}\" target=\"_blank\" rel=\"noopener noreferrer\" style=\"display:inline-block;padding:12px 20px;border-radius:12px;background:linear-gradient(90deg,#10b981,#0ea5a6);color:#ffffff;text-decoration:none;font-weight:700;\">
          إعادة تعيين كلمة المرور
        </a>
      </div>
      <p style=\"margin:0;font-size:12px;color:#64748b;\">إن لم يعمل الزر، انسخ هذا الرابط وافتحه في المتصفح:</p>
      <div style=\"margin-top:8px;word-break:break-all;font-size:12px;color:#0ea5a6;\">${resetLink}</div>
    `;
  }
  if (code) {
    return `
      ${intro}
      <p style=\"margin:0 0 8px;font-size:13px;color:#475569;\">استخدم رمز التحقق التالي لإعادة التعيين:</p>
      <div style=\"text-align:center;margin:24px 0;\">
        <div style=\"display:inline-block;padding:12px 20px;border-radius:12px;border:1px dashed #10b981;background:#ecfdf5;color:#065f46;font-size:24px;font-weight:800;letter-spacing:6px;\">
          ${code}
        </div>
      </div>
    `;
  }
  return intro;
}

export async function sendVerificationCode(email: string, code: string) {
  let transporter: Transporter;
  try {
    transporter = getTransporter();
  } catch (err) {
    console.error('Failed to create transporter for verification code:', err);
    throw err;
  }
  const html = baseEmailWrapper(verificationContentHtml(code), "رمز التحقق من زيارة");
  try {
    await transporter.sendMail({
      from: `"زيارة Ziyara" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "رمز التحقق من زيارة",
      text: `رمز التحقق الخاص بك هو: ${code}. إذا لم تطلب ذلك يمكنك تجاهل الرسالة.`,
      html,
    });
  } catch (err) {
    console.error('Failed to send verification email to', email, err);
    throw err;
  }
}

export async function sendPasswordResetEmail(
  email: string,
  params: { code?: string; resetLink?: string }
) {
  let transporter: Transporter;
  try {
    transporter = getTransporter();
  } catch (err) {
    console.error('Failed to create transporter for password reset email:', err);
    throw err;
  }
  const html = baseEmailWrapper(
    resetContentHtml({ code: params.code, resetLink: params.resetLink }),
    "تعليمات استعادة كلمة المرور من زيارة"
  );
  try {
    await transporter.sendMail({
      from: `" Ziyara" <${process.env.EMAIL_USER}>`,
      to: email,
      subject: "استعادة كلمة المرور - زيارة",
      text: params.resetLink
        ? `لاستعادة كلمة المرور، افتح الرابط التالي: ${params.resetLink}`
        : `رمز استعادة كلمة المرور: ${params.code}`,
      html,
    });
  } catch (err) {
    console.error('Failed to send password reset email to', email, err);
    throw err;
  }
}

// New generic sendMail function (replacement for sendVerificationEmail)
export async function sendMail(to: string, code: string) {
  const user = process.env.EMAIL_USER;
  const pass = process.env.EMAIL_PASS;
  const host = process.env.smtp_host || process.env.EMAIL_HOST;
  const portEnv = process.env.smtp_port || process.env.EMAIL_PORT;

  // default to 587 if not set
  const port = Number(portEnv) || 587;
  const explicitSecure = typeof process.env.smtp_secure !== 'undefined'
    ? String(process.env.smtp_secure)
    : typeof process.env.EMAIL_SECURE !== 'undefined'
      ? String(process.env.EMAIL_SECURE)
      : "";

  const secureFlag = explicitSecure.toLowerCase() === 'true' ? true
    : explicitSecure.toLowerCase() === 'false' ? false
    : (port === 465);

  console.log("SMTP SETTINGS (sendMail):", {
    host,
    port,
    secure: secureFlag,
    user,
    pass: pass ? "***HIDDEN***" : null,
  });

  if (!user || !pass) {
    throw new Error('EMAIL_USER or EMAIL_PASS environment variables are not set');
  }

  if (!host || !portEnv) {
    console.warn('SMTP host/port not set; nodemailer may fail to create transporter. Check .env variables (smtp_host/smtp_port or EMAIL_HOST/EMAIL_PORT)');
  }

  const transporter = nodemailer.createTransport({
    host,
    port,
    secure: secureFlag,
    auth: { user, pass },
  });

  try {
    await transporter.verify();
  } catch (vErr) {
    console.error('Nodemailer transporter verification failed (sendMail):', vErr);
    const ve: any = vErr;
    throw new Error(`Failed to verify SMTP transporter: ${ve?.message || String(ve)}`);
  }

  const html = baseEmailWrapper(verificationContentHtml(code), "رمز التحقق من زيارة");

  try {
    const info = await transporter.sendMail({
      from: `"زيارة Ziyara" <${process.env.EMAIL_USER}>`,
      to,
      subject: "رمز التحقق من زيارة",
      text: `رمز التحقق الخاص بك هو: ${code}. إذا لم تطلب ذلك يمكنك تجاهل الرسالة.`,
      html,
    });
    console.log('Verification email (sendMail) sent to', to, 'messageId=', info?.messageId);
    return info;
  } catch (err) {
    console.error('Failed to send verification email (sendMail) to', to, err);
    throw err;
  }
}
