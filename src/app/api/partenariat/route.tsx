import { Resend } from 'resend';
import { NextResponse } from 'next/server';

const resend = new Resend(process.env.RESEND_API_KEY);

export async function POST(request: Request) {
  try {
    const { entreprise, contact, email, budget, message } = await request.json();

    const data = await resend.emails.send({
      from: 'BLK RADAR <onboarding@resend.dev>',
      to: ['swannvrg@gmail.com'],
      replyTo: email,
      subject: `💰 PARTENARIAT : ${entreprise}`,
      html: `
        <div style="font-family: sans-serif; background: #09090b; color: #fff; padding: 40px; border-radius: 20px; border: 1px solid #EAB308;">
          <h1 style="color: #EAB308; text-transform: uppercase;">Nouveau Sponsor Potentiel</h1>
          <p><b>Entreprise :</b> ${entreprise}</p>
          <p><b>Contact :</b> ${contact} (${email})</p>
          <p><b>Budget Estimé :</b> ${budget}</p>
          <hr style="border: 0; border-top: 1px solid #27272a; margin: 20px 0;" />
          <h3 style="color: #EAB308;">PROJET DE PARTENARIAT</h3>
          <p>${message}</p>
        </div>
      `,
    });
    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: "Erreur envoi" }, { status: 500 });
  }
}