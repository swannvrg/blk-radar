import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { nom, prenom, email, description, ambitions, attentes, socials } = await request.json();

    if (!email) {
      return NextResponse.json({ error: "Email manquant" }, { status: 400 });
    }

    const socialList = Object.entries(socials || {})
      .map(([platform, url]) => `<li><b>${platform}:</b> ${url}</li>`)
      .join('');

    const data = await resend.emails.send({
      from: 'BLK RADAR <onboarding@resend.dev>',
      to: ['swannvrg@gmail.com'],
      replyTo: email,
      subject: `🚨 INTERVIEW : ${prenom} ${nom}`,
      html: `
        <div style="font-family: 'Helvetica', Arial, sans-serif; background-color: #09090b; color: #ffffff; padding: 50px 20px;">
          <div style="max-width: 600px; margin: 0 auto; background: #09090b; border: 1px solid #27272a; padding: 40px; border-radius: 20px;">
            <h1 style="color: #EAB308; font-size: 24px; font-weight: 900; letter-spacing: -1px; text-transform: uppercase; margin-bottom: 5px;">REJOINS LE RADAR.</h1>
            <p style="color: #a1a1aa; font-size: 10px; text-transform: uppercase; letter-spacing: 2px; margin-bottom: 30px;">Candidature Interview // Be Yourself</p>
            
            <div style="margin-bottom: 30px;">
              <p style="font-size: 14px; margin: 0;"><strong>Candidat :</strong> ${prenom} ${nom}</p>
              <p style="font-size: 14px; margin: 5px 0; color: #EAB308;"><strong>Contact :</strong> ${email}</p>
            </div>

            <div style="border-left: 2px solid #EAB308; padding-left: 20px; margin: 20px 0;">
              <h3 style="color: #EAB308; font-size: 12px; text-transform: uppercase;">Le Projet</h3>
              <p style="font-size: 15px; line-height: 1.6; color: #d4d4d8;">${description}</p>
            </div>

            <div style="border-left: 2px solid #EAB308; padding-left: 20px; margin: 20px 0;">
              <h3 style="color: #EAB308; font-size: 12px; text-transform: uppercase;">Ambitions & Pourquoi nous ?</h3>
              <p style="font-size: 15px; line-height: 1.6; color: #d4d4d8;">${ambitions}</p>
              <p style="font-size: 15px; line-height: 1.6; color: #d4d4d8;">${attentes}</p>
            </div>

            <div style="background: #18181b; padding: 20px; border-radius: 12px; margin-top: 30px;">
              <h3 style="color: #EAB308; font-size: 12px; text-transform: uppercase; margin-top: 0;">Réseaux Sociaux</h3>
              <ul style="list-style: none; padding: 0; margin: 0; font-size: 13px;">
                ${socialList || '<li style="color: #52525b;">Aucun réseau renseigné</li>'}
              </ul>
            </div>

            <hr style="border: 0; border-top: 1px solid #27272a; margin: 40px 0;" />
            <p style="font-size: 10px; color: #52525b; text-align: center; text-transform: uppercase;">Envoyé via le portail BLK RADAR</p>
          </div>
        </div>
      `,
    });

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Erreur envoi" }, { status: 500 });
  }
}