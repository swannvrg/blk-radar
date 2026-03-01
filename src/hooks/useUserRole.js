import { useState, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';

/**
 * @param {string | null | undefined} currentPageTalentId 
 */

export function useUserRole(currentPageTalentId ) {
 const [role, setRole] = useState('user');
  const searchParams = useSearchParams();

  useEffect(() => {
    if (typeof window === 'undefined') return;

    // 1. On récupère le token de l'URL s'il existe
    const urlToken = searchParams.get('token');
    if (urlToken) {
      // On stocke le token spécifique à ce talent (ex: key: BLK_TOKEN_pnl)
      localStorage.setItem(`BLK_TOKEN_${currentPageTalentId}`, urlToken);
    }

    // 2. VÉRIFICATION DES DROITS
    const globalAdminKey = localStorage.getItem('BLK_ADMIN_KEY');
    const specificToken = localStorage.getItem(`BLK_TOKEN_${currentPageTalentId}`);

    // CAS A : Tu es l'Admin Global (Ton mot de passe fort)
    if (globalAdminKey === process.env.NEXT_PUBLIC_ADMIN_SECRET) {
      setRole('admin');
    } 
    // CAS B : Tu es le Talent et ton token correspond à l'ID de la page
    else if (specificToken && specificToken === `token_${currentPageTalentId}`) {
      setRole('talent');
    } 
    else {
      setRole('user');
    }
  }, [searchParams, currentPageTalentId]);

  return { role };
}