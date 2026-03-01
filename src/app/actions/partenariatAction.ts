"use client";

export async function sendPartenariatEmail(formData: any) {
  const response = await fetch('/api/partenariat', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(formData),
  });
  return await response.json();
}