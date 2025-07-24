/**
 * Utilitaires pour le formatage des données
 */

/**
 * Formate un score de match
 */
export const formatScore = (homeScore?: number, awayScore?: number): string => {
  if (homeScore === undefined || awayScore === undefined) {
    return "- : -";
  }
  return `${homeScore} : ${awayScore}`;
};

/**
 * Formate un pourcentage de possession
 */
export const formatPossession = (possession?: string): number => {
  if (!possession) return 0;
  return parseInt(possession.replace('%', ''));
};

/**
 * Formate un nombre avec séparateur de milliers
 */
export const formatNumber = (num?: number): string => {
  if (!num) return '0';
  return num.toLocaleString('fr-FR');
};

/**
 * Détermine la couleur selon le statut du match
 */
export const getMatchStatusColor = (status: string): 'success' | 'error' | 'warning' | 'info' => {
  const statusLower = status.toLowerCase();
  
  if (statusLower.includes('terminé') || statusLower.includes('finished')) {
    return 'success';
  }
  if (statusLower.includes('annulé') || statusLower.includes('cancelled')) {
    return 'error';
  }
  if (statusLower.includes('en cours') || statusLower.includes('live')) {
    return 'warning';
  }
  return 'info';
};

/**
 * Traduit le statut du match en français
 */
export const translateMatchStatus = (status: string): string => {
  const translations: Record<string, string> = {
    'Not Started': 'À venir',
    'Match Finished': 'Terminé',
    'Match Postponed': 'Reporté',
    'Match Cancelled': 'Annulé',
    'First Half': '1ère mi-temps',
    'Second Half': '2ème mi-temps',
    'Half Time': 'Mi-temps',
    'Extra Time': 'Prolongations',
    'Penalty In Progress': 'Tirs au but',
    'Break Time': 'Pause',
    'Match Suspended': 'Suspendu',
    'Interrupted': 'Interrompu',
  };
  
  return translations[status] || status;
};

/**
 * Formate la taille d'un joueur
 */
export const formatHeight = (height?: string): string => {
  if (!height) return '';
  return height.replace('cm', ' cm');
};

/**
 * Formate le poids d'un joueur
 */
export const formatWeight = (weight?: string): string => {
  if (!weight) return '';
  return weight.replace('kg', ' kg');
};

/**
 * Génère une couleur basée sur le nom d'équipe (pour les avatars sans logo)
 */
export const getTeamColor = (teamName: string): string => {
  const colors = [
    '#1976d2', '#388e3c', '#f57c00', '#d32f2f',
    '#7b1fa2', '#303f9f', '#455a64', '#00796b'
  ];
  
  let hash = 0;
  for (let i = 0; i < teamName.length; i++) {
    hash = teamName.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  return colors[Math.abs(hash) % colors.length];
};

/**
 * Tronque un texte avec des points de suspension
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return `${text.substring(0, maxLength)}...`;
};