/**
 * Composant pour afficher et gérer les erreurs API
 * Interface utilisateur cohérente pour toutes les erreurs
 */

import React from 'react';
import { Alert, AlertTitle, Button, Box } from '@mui/material';
import { Refresh, Wifi, ErrorOutline, AccessTime } from '@mui/icons-material';
import type { ApiError } from '../../types/api';
import { API_ERRORS } from '../../services/api/config';

interface ErrorHandlerProps {
  error: ApiError;
  onRetry?: () => void;
  showRetryButton?: boolean;
  compact?: boolean;
}

const ErrorHandler: React.FC<ErrorHandlerProps> = ({
  error,
  onRetry,
  showRetryButton = true,
  compact = false
}) => {
  // Déterminer l'icône et la couleur selon le type d'erreur
  const getErrorConfig = (errorType: string) => {
    switch (errorType) {
      case API_ERRORS.NETWORK_ERROR:
        return {
          icon: <Wifi />,
          severity: 'error' as const,
          title: 'Problème de connexion',
          suggestion: 'Vérifiez votre connexion internet et que le serveur backend est démarré.'
        };
      
      case API_ERRORS.TIMEOUT_ERROR:
        return {
          icon: <AccessTime />,
          severity: 'warning' as const,
          title: 'Délai dépassé',
          suggestion: 'La requête a pris trop de temps. Veuillez réessayer.'
        };
      
      case API_ERRORS.NOT_FOUND:
        return {
          icon: <ErrorOutline />,
          severity: 'info' as const,
          title: 'Ressource non trouvée',
          suggestion: 'Les données demandées n\'existent pas ou ont été supprimées.'
        };
      
      case API_ERRORS.VALIDATION_ERROR:
        return {
          icon: <ErrorOutline />,
          severity: 'warning' as const,
          title: 'Données invalides',
          suggestion: 'Vérifiez les paramètres de votre requête.'
        };
      
      default:
        return {
          icon: <ErrorOutline />,
          severity: 'error' as const,
          title: 'Erreur serveur',
          suggestion: 'Une erreur inattendue s\'est produite. Veuillez réessayer.'
        };
    }
  };

  const config = getErrorConfig(error.type);

  if (compact) {
    return (
      <Alert 
        severity={config.severity}
        icon={config.icon}
        action={
          showRetryButton && onRetry && (
            <Button
              color="inherit"
              size="small"
              onClick={onRetry}
              startIcon={<Refresh />}
            >
              Réessayer
            </Button>
          )
        }
      >
        {error.message}
      </Alert>
    );
  }

  return (
    <Box sx={{ my: 2 }}>
      <Alert severity={config.severity} icon={config.icon}>
        <AlertTitle>{config.title}</AlertTitle>
        
        <Box sx={{ mb: 1 }}>
          <strong>Message:</strong> {error.message}
        </Box>
        
        <Box sx={{ mb: showRetryButton ? 2 : 0, color: 'text.secondary' }}>
          {config.suggestion}
        </Box>

        {/* Afficher les détails en mode développement */}
        {process.env.NODE_ENV === 'development' && error.details && (
          <Box sx={{ mt: 1, p: 1, bgcolor: 'grey.100', borderRadius: 1, fontSize: '0.875rem' }}>
            <strong>Détails (dev):</strong>
            <pre>{JSON.stringify(error.details, null, 2)}</pre>
          </Box>
        )}

        {showRetryButton && onRetry && (
          <Box sx={{ mt: 2 }}>
            <Button
              variant="outlined"
              color={config.severity}
              onClick={onRetry}
              startIcon={<Refresh />}
              size="small"
            >
              Réessayer
            </Button>
          </Box>
        )}
      </Alert>
    </Box>
  );
};

export default ErrorHandler;