import { NextResponse } from 'next/server'




export async function POST(request: Request) {
    try {
        const nodemailer = (await import('nodemailer')).default; // or just import * as nodemailer
        const body = await request.json()
        const { firstName, lastName, email, message } = body

        // Validate input
        if (!firstName || !email || !message) {
            return NextResponse.json(
                { error: 'Missing required fields' },
                { status: 400 }
            )
        }

        // Configure transporter
        // NOTE: User must set GMAIL_USER and GMAIL_APP_PASSWORD env vars
        const transporter = nodemailer.createTransport({
            service: 'gmail',
            auth: {
                user: process.env.GMAIL_USER,
                pass: process.env.GMAIL_APP_PASSWORD,
            },
        })

        const mailOptions = {
            // We cannot legitimate "spoof" the sender due to SPF/DMARC (Gmail will block or flag it).
            // Best practice: Send FROM your authenticated email, but set REPLY-TO to the user's email.
            from: `"Adapt Contact Form" <${process.env.GMAIL_USER}>`,
            to: process.env.GMAIL_USER,
            replyTo: `${firstName} ${lastName} <${email}>`,
            subject: `Contact Form: ${firstName} ${lastName}`,
            text: `Name: ${firstName} ${lastName}\nEmail: ${email}\n\nMessage:\n${message}`,
            html: `
                <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; border: 1px solid #eee; border-radius: 8px; overflow: hidden;">
                    <div style="background-color: #000; color: #fff; padding: 20px;">
                        <h2 style="margin: 0;">New Contact Request</h2>
                    </div>
                    <div style="padding: 20px; background-color: #fff;">
                        <p style="margin-bottom: 10px; color: #666;"><strong>From:</strong></p>
                        <p style="margin-top: 0; font-size: 16px;">${firstName} ${lastName} (<a href="mailto:${email}" style="color: #0070f3;">${email}</a>)</p>
                        
                        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;">
                        
                        <p style="margin-bottom: 10px; color: #666;"><strong>Message:</strong></p>
                        <div style="background-color: #f9f9f9; padding: 15px; border-radius: 4px; font-size: 16px; line-height: 1.5;">
                            ${message.replace(/\n/g, '<br>')}
                        </div>
                    </div>
                    <div style="background-color: #f5f5f5; padding: 15px; text-align: center; font-size: 12px; color: #888;">
                        Sent via Adapt Robotics Website
                    </div>
                </div>
            `,
        }

        // Send email
        await transporter.sendMail(mailOptions)

        return NextResponse.json({ success: true })
    } catch (error) {
        console.error('Email error:', error)
        return NextResponse.json(
            { error: 'Failed to send email' },
            { status: 500 }
        )
    }
}
