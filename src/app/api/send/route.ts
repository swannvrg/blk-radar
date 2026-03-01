import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    // 1. AJOUT de senderEmail ici pour pouvoir l'utiliser plus bas
    const { senderName, senderEmail, subject, message, talentEmail, talentName } = await request.json();

    // 2. Vérification de sécurité pour éviter d'envoyer un mail vide
    if (!senderEmail || !talentEmail) {
    return NextResponse.json({ error: "Emails manquants" }, { status: 400 });
    }

    const data = await resend.emails.send({
      from: 'BLK RADAR <onboarding@resend.dev>',
      to: [talentEmail],
      replyTo: senderEmail,
      subject: `[CONTACT BLK] ${subject}`,
      html: `
        <div style="font-family: 'Helvetica', Arial, sans-serif; background-color: #09090b; color: #ffffff; padding: 50px 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: #09090b; border: 1px solid #27272a; padding: 40px; border-radius: 20px;">
            <h2 style="color: #ffffff; font-size: 20px; font-weight: 900; text-transform: uppercase; margin-bottom: 5px;">Nouveau message pour <span style="color: #EAB308;">${talentName}</span></h2>
            <p style="color: #a1a1aa; font-size: 12px; margin-bottom: 30px;">Un utilisateur souhaite entrer en contact avec toi.</p>
            
            <div style="background: #18181b; padding: 30px; border-radius: 16px; border: 1px solid #27272a; margin-bottom: 30px;">
              <p style="color: #EAB308; font-size: 10px; font-weight: 800; text-transform: uppercase; margin-bottom: 10px; letter-spacing: 1px;">Message :</p>
              <div style="font-size: 16px; line-height: 1.6; color: #e4e4e7; white-space: pre-wrap;">
                ${message}
              </div>
            </div>

            <div style="text-align: center; margin: 40px 0;">
              <p style="color: #a1a1aa; font-size: 13px; margin-bottom: 20px;">De : <strong>${senderName}</strong> (${senderEmail})</p>
              <a href="mailto:${senderEmail}" style="background-color: #EAB308; color: #000000; padding: 15px 35px; border-radius: 10px; text-decoration: none; font-weight: 900; font-size: 14px; text-transform: uppercase; display: inline-block;">Répondre directement</a>
            </div>

            <hr style="border: 0; border-top: 1px solid #27272a; margin: 40px 0;" />
            <p style="font-size: 9px; color: #52525b; text-align: center; text-transform: uppercase; letter-spacing: 1px;">Message sécurisé via BLK RADAR // Stay Real</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json(data);
  } catch (error) {
    console.error("Erreur Resend:", error);
    return NextResponse.json({ error: "Erreur lors de l'envoi" }, { status: 500 });
  }
}