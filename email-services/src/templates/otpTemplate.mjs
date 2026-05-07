export const otpTemplate = (otp_code) => {
    return `
    <!DOCTYPE html>
    <html>
    <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
    </head>
    <body style="margin:0; padding:0; background-color:#f4f4f7; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
        <table width="100%" cellpadding="0" cellspacing="0" style="background-color:#f4f4f7; padding:40px 0;">
            <tr>
                <td align="center">
                    <table width="480" cellpadding="0" cellspacing="0" style="background-color:#ffffff; border-radius:12px; overflow:hidden; box-shadow:0 4px 12px rgba(0,0,0,0.08);">
                        <tr>
                            <td style="background: linear-gradient(135deg, #667eea 0%, #764ba2 100%); padding:30px; text-align:center;">
                                <h1 style="color:#ffffff; margin:0; font-size:24px; font-weight:700;">Wuthering Wares</h1>
                                <p style="color:rgba(255,255,255,0.85); margin:8px 0 0; font-size:14px;">Verifikasi Email Anda</p>
                            </td>
                        </tr>
                        <tr>
                            <td style="padding:40px 36px;">
                                <p style="color:#333; font-size:16px; margin:0 0 20px; line-height:1.6;">
                                    Gunakan kode OTP berikut untuk menyelesaikan proses registrasi akun Anda:
                                </p>
                                <div style="background-color:#f0f0ff; border-radius:8px; padding:24px; text-align:center; margin:24px 0;">
                                    <span style="font-size:36px; font-weight:700; letter-spacing:8px; color:#667eea;">
                                        ${otp_code}
                                    </span>
                                </div>
                                <p style="color:#666; font-size:14px; margin:20px 0 0; line-height:1.6;">
                                    Kode ini berlaku selama <strong>5 menit</strong>. Jangan bagikan kode ini kepada siapapun.
                                </p>
                            </td>
                        </tr>
                        <tr>
                            <td style="background-color:#f9f9fb; padding:20px 36px; text-align:center; border-top:1px solid #eee;">
                                <p style="color:#999; font-size:12px; margin:0;">
                                    Jika Anda tidak melakukan registrasi, abaikan email ini.
                                </p>
                            </td>
                        </tr>
                    </table>
                </td>
            </tr>
        </table>
    </body>
    </html>
    `;
};
