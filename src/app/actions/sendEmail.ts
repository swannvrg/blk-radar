"use client";

export async function sendInterviewEmail(formData: any) {
  try {
    const response = await fetch('/api/interview', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(formData),
    });

    if (!response.ok) throw new Error("Erreur réseau");
    return await response.json();
  } catch (err) {
    return { error: "Erreur d'envoi" };
  }
}