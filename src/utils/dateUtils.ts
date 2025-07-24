/**
 * Utilitaires pour le formatage des dates
 */

/**
 * Formate une date pour l'affichage français
 */
export const formatDateFR = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('fr-FR', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric'
  });
};

/**
 * Formate une heure pour l'affichage
 */
export const formatTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleTimeString('fr-FR', {
    hour: '2-digit',
    minute: '2-digit'
  });
};

/**
 * Formate une date courte (DD/MM/YYYY)
 */
export const formatDateShort = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  return dateObj.toLocaleDateString('fr-FR');
};

/**
 * Calcule le temps relatif (il y a X jours, dans X jours)
 */
export const getRelativeTime = (date: string | Date): string => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const now = new Date();
  const diffMs = dateObj.getTime() - now.getTime();
  const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24));

  if (diffDays === 0) return "Aujourd'hui";
  if (diffDays === 1) return "Demain";
  if (diffDays === -1) return "Hier";
  if (diffDays > 0) return `Dans ${diffDays} jour${diffDays > 1 ? 's' : ''}`;
  return `Il y a ${Math.abs(diffDays)} jour${Math.abs(diffDays) > 1 ? 's' : ''}`;
};

/**
 * Vérifie si une date est aujourd'hui
 */
export const isToday = (date: string | Date): boolean => {
  const dateObj = typeof date === 'string' ? new Date(date) : date;
  const today = new Date();
  return dateObj.toDateString() === today.toDateString();
};

/**
 * Formate pour l'API (YYYY-MM-DD)
 */
export const formatForAPI = (date: Date): string => {
  return date.toISOString().split('T')[0];
};