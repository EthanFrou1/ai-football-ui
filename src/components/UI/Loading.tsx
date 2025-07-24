/**
 * Composants de chargement réutilisables
 * Différents types selon le contexte
 */

import React from 'react';
import { 
  Box, 
  CircularProgress, 
  Skeleton, 
  Card, 
  CardContent, 
  Typography,
  LinearProgress
} from '@mui/material';

// Loading simple avec spinner
interface LoadingSpinnerProps {
  size?: number;
  message?: string;
  fullScreen?: boolean;
}

export const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = 40,
  message = "Chargement...",
  fullScreen = false
}) => {
  const content = (
    <Box
      display="flex"
      flexDirection="column"
      alignItems="center"
      justifyContent="center"
      gap={2}
      p={3}
    >
      <CircularProgress size={size} />
      {message && (
        <Typography variant="body2" color="text.secondary">
          {message}
        </Typography>
      )}
    </Box>
  );

  if (fullScreen) {
    return (
      <Box
        position="fixed"
        top={0}
        left={0}
        right={0}
        bottom={0}
        display="flex"
        alignItems="center"
        justifyContent="center"
        bgcolor="rgba(255, 255, 255, 0.8)"
        zIndex={9999}
      >
        {content}
      </Box>
    );
  }

  return content;
};

// Skeleton pour les cartes d'équipes
export const TeamCardSkeleton: React.FC = () => (
  <Card>
    <CardContent sx={{ textAlign: 'center' }}>
      <Skeleton
        variant="circular"
        width={64}
        height={64}
        sx={{ margin: '0 auto', mb: 2 }}
      />
      <Skeleton variant="text" height={28} width="80%" sx={{ margin: '0 auto', mb: 1 }} />
      <Skeleton variant="text" height={20} width="60%" sx={{ margin: '0 auto' }} />
    </CardContent>
  </Card>
);

// Skeleton pour les cartes de matchs
export const MatchCardSkeleton: React.FC = () => (
  <Card sx={{ mb: 2 }}>
    <CardContent>
      <Box display="flex" alignItems="center" justifyContent="space-between">
        <Box display="flex" alignItems="center" gap={2}>
          <Skeleton variant="circular" width={40} height={40} />
          <Skeleton variant="text" width={120} height={24} />
        </Box>
        
        <Box textAlign="center">
          <Skeleton variant="text" width={60} height={32} sx={{ mb: 1 }} />
          <Skeleton variant="text" width={80} height={20} />
        </Box>
        
        <Box display="flex" alignItems="center" gap={2}>
          <Skeleton variant="text" width={120} height={24} />
          <Skeleton variant="circular" width={40} height={40} />
        </Box>
      </Box>
    </CardContent>
  </Card>
);

// Loading pour les détails d'équipe
export const TeamDetailsSkeleton: React.FC = () => (
  <Box sx={{ padding: "2rem" }}>
    <Card sx={{ mb: 3 }}>
      <CardContent sx={{ textAlign: "center" }}>
        <Skeleton
          variant="circular"
          width={120}
          height={120}
          sx={{ margin: "0 auto", mb: 2 }}
        />
        <Skeleton variant="text" height={40} width="60%" sx={{ margin: "0 auto", mb: 2 }} />
        <Skeleton variant="rectangular" width={80} height={32} sx={{ margin: "0 auto" }} />
      </CardContent>
    </Card>

    <Box display="flex" gap={3}>
      <Box flex={1}>
        <Card>
          <CardContent>
            <Skeleton variant="text" height={32} width="50%" sx={{ mb: 2 }} />
            <Skeleton variant="text" height={24} sx={{ mb: 1 }} />
            <Skeleton variant="text" height={24} sx={{ mb: 1 }} />
            <Skeleton variant="text" height={24} />
          </CardContent>
        </Card>
      </Box>
      
      <Box flex={1}>
        <Card>
          <CardContent>
            <Skeleton variant="text" height={32} width="50%" sx={{ mb: 2 }} />
            {[1, 2, 3].map((i) => (
              <Box key={i} sx={{ mb: 2, p: 1, border: "1px solid #e0e0e0", borderRadius: 1 }}>
                <Skeleton variant="text" height={24} sx={{ mb: 1 }} />
                <Skeleton variant="text" height={20} width="60%" />
              </Box>
            ))}
          </CardContent>
        </Card>
      </Box>
    </Box>
  </Box>
);

// Loading pour les détails de match
export const MatchDetailsSkeleton: React.FC = () => (
  <Box sx={{ padding: "2rem" }}>
    <Card sx={{ mb: 3 }}>
      <CardContent>
        <Box sx={{ textAlign: "center", mb: 2 }}>
          <Skeleton variant="rectangular" width={80} height={32} sx={{ margin: "0 auto", mb: 2 }} />
          <Skeleton variant="text" height={24} width="50%" sx={{ margin: "0 auto" }} />
        </Box>
        
        <Box display="flex" alignItems="center" justifyContent="space-between">
          <Box textAlign="center">
            <Skeleton variant="circular" width={80} height={80} sx={{ margin: "0 auto", mb: 1 }} />
            <Skeleton variant="text" height={24} width={120} />
          </Box>
          
          <Skeleton variant="text" height={64} width={100} />
          
          <Box textAlign="center">
            <Skeleton variant="circular" width={80} height={80} sx={{ margin: "0 auto", mb: 1 }} />
            <Skeleton variant="text" height={24} width={120} />
          </Box>
        </Box>
      </CardContent>
    </Card>

    <Box display="flex" gap={3}>
      <Card sx={{ flex: 1 }}>
        <CardContent>
          <Skeleton variant="text" height={32} width="40%" sx={{ mb: 2 }} />
          {[1, 2, 3].map((i) => (
            <Box key={i} sx={{ mb: 2, p: 1, border: "1px solid #e0e0e0", borderRadius: 1 }}>
              <Skeleton variant="text" height={24} sx={{ mb: 1 }} />
              <Skeleton variant="text" height={20} width="50%" />
            </Box>
          ))}
        </CardContent>
      </Card>
      
      <Card sx={{ flex: 1 }}>
        <CardContent>
          <Skeleton variant="text" height={32} width="40%" sx={{ mb: 2 }} />
          <Skeleton variant="text" height={20} sx={{ mb: 2 }} />
          <Skeleton variant="rectangular" height={8} sx={{ mb: 2 }} />
          <Skeleton variant="text" height={20} sx={{ mb: 1 }} />
          <Skeleton variant="text" height={20} />
        </CardContent>
      </Card>
    </Box>
  </Box>
);

// Loading avec barre de progression
interface LoadingProgressProps {
  message?: string;
  progress?: number;
}

export const LoadingProgress: React.FC<LoadingProgressProps> = ({
  message = "Chargement en cours...",
  progress
}) => (
  <Box sx={{ width: '100%', p: 3 }}>
    <Typography variant="body2" color="text.secondary" sx={{ mb: 2 }}>
      {message}
    </Typography>
    <LinearProgress 
      variant={progress !== undefined ? "determinate" : "indeterminate"}
      value={progress}
    />
    {progress !== undefined && (
      <Typography variant="caption" color="text.secondary" sx={{ mt: 1 }}>
        {Math.round(progress)}%
      </Typography>
    )}
  </Box>
);

// Loading overlay pour les actions
interface LoadingOverlayProps {
  loading: boolean;
  children: React.ReactNode;
  message?: string;
}

export const LoadingOverlay: React.FC<LoadingOverlayProps> = ({
  loading,
  children,
  message = "Chargement..."
}) => (
  <Box position="relative">
    {children}
    {loading && (
      <Box
        position="absolute"
        top={0}
        left={0}
        right={0}
        bottom={0}
        display="flex"
        alignItems="center"
        justifyContent="center"
        bgcolor="rgba(255, 255, 255, 0.8)"
        zIndex={1}
      >
        <LoadingSpinner message={message} />
      </Box>
    )}
  </Box>
);