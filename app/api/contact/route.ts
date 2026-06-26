import { NextRequest, NextResponse } from 'next/server'

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
}

export async function POST(req: NextRequest) {
  let body: Record<string, string>
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 })
  }

  const { name, email, subject, message } = body

  if (!name?.trim() || !email?.trim() || !subject?.trim() || !message?.trim()) {
    return NextResponse.json({ error: 'All fields are required.' }, { status: 400 })
  }

  // Basic email format check
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return NextResponse.json({ error: 'Please enter a valid email address.' }, { status: 400 })
  }

  const resendKey = process.env.RESEND_API_KEY

  if (!resendKey) {
    // No API key configured — log server-side so submissions aren't silently lost
    console.log('[MyAfroWaka Contact Form]', { name, email, subject, message })
    // Still return success to user so the UX works during setup
    return NextResponse.json({ ok: true })
  }

  try {
    const { Resend } = await import('resend')
    const resend = new Resend(resendKey)

    const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'onboarding@resend.dev'
    const toEmail   = process.env.CONTACT_TO_EMAIL  ?? 'info@myafrowaka.com'

    await resend.emails.send({
      from:    `MyAfroWaka <${fromEmail}>`,
      to:      [toEmail],
      replyTo: email,
      subject: `[Contact] ${escapeHtml(subject)} from ${escapeHtml(name)}`,
      html: `
        <div style="font-family:sans-serif;max-width:600px;margin:0 auto;padding:24px">
          <h2 style="margin:0 0 20px;color:#1A1813">New contact form submission</h2>
          <table style="width:100%;border-collapse:collapse">
            <tr><td style="padding:8px 0;color:#666;font-size:13px;width:100px">Name</td><td style="padding:8px 0;font-size:13px;color:#1A1813"><strong>${escapeHtml(name)}</strong></td></tr>
            <tr><td style="padding:8px 0;color:#666;font-size:13px">Email</td><td style="padding:8px 0;font-size:13px;color:#1A1813"><a href="mailto:${escapeHtml(email)}" style="color:#A22E29">${escapeHtml(email)}</a></td></tr>
            <tr><td style="padding:8px 0;color:#666;font-size:13px">Reason</td><td style="padding:8px 0;font-size:13px;color:#1A1813">${escapeHtml(subject)}</td></tr>
          </table>
          <hr style="margin:20px 0;border:none;border-top:1px solid #eee"/>
          <p style="color:#666;font-size:13px;margin:0 0 8px">Message:</p>
          <p style="font-size:14px;color:#1A1813;line-height:1.6;white-space:pre-wrap">${escapeHtml(message)}</p>
          <hr style="margin:24px 0;border:none;border-top:1px solid #eee"/>
          <p style="color:#999;font-size:11px">Sent via myafrowaka.com contact form</p>
        </div>
      `,
    })

    return NextResponse.json({ ok: true })
  } catch (err) {
    console.error('[Contact Form] Resend error:', err)
    return NextResponse.json(
      { error: 'Failed to send your message. Please email us directly at info@myafrowaka.com' },
      { status: 500 }
    )
  }
}
