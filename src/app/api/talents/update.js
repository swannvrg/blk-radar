export default async function handler(req, res) {
  // On n'autorise que les requêtes POST ou PUT pour la modification
  if (req.method !== 'POST' && req.method !== 'PUT') {
    return res.status(405).json({ error: "Méthode non autorisée" });
  }

  // 1. Extraire les infos du body et des headers
  const { talentId, token } = req.body;
  const adminKey = req.headers['x-blk-auth'];

  // 2. VERROU DE SÉCURITÉ DOUBLE
  
  // CAS A : C'est toi (L'Admin Global)
  const isGlobalAdmin = adminKey && adminKey === process.env.ADMIN_SECRET_KEY;

  // CAS B : C'est le Talent (Vérification du Token spécifique)
  // On compare le token envoyé avec celui attendu (format: token_ID)
  const isAuthorizedTalent = token && token === `token_${talentId}`;

  if (!isGlobalAdmin && !isAuthorizedTalent) {
    return res.status(401).json({ 
      error: "Accès refusé. Token invalide ou clé admin manquante." 
    });
  }

  try {
    // 3. LOGIQUE DE MISE À JOUR (Exemple avec une BDD imaginaire)
    // Ici, tu insères ton code Supabase, Prisma ou MongoDB
    // const result = await updateTalentInDB(talentId, req.body.data);

    console.log(`Modification autorisée pour le talent ${talentId} par ${isGlobalAdmin ? 'Admin' : 'Talent'}`);

    return res.status(200).json({ 
      success: true, 
      message: "Profil mis à jour avec succès" 
    });

  } catch (error) {
    return res.status(500).json({ error: "Erreur lors de la mise à jour BDD" });
  }
}