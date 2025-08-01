// src/components/Teams/TeamStatsCharts.tsx
import React from 'react';
import {
  Box,
  Card,
  CardContent,
  Typography,
  Grid,
  CircularProgress
} from '@mui/material';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line
} from 'recharts';
import { TrendingUp, Stadium, Speed } from '@mui/icons-material';

// Couleurs pour les graphiques
const COLORS = {
  wins: '#4CAF50',
  draws: '#FF9800', 
  losses: '#F44336',
  primary: '#1976d2',
  secondary: '#dc004e',
  success: '#4CAF50',
  warning: '#FF9800',
  error: '#F44336',
  info: '#2196F3'
};

// Composant pour les statistiques circulaires
interface CircularStatProps {
  value: number;
  max: number;
  label: string;
  color?: string;
  suffix?: string;
  size?: number;
}

export function CircularStat({ 
  value, 
  max, 
  label, 
  color = COLORS.primary,
  suffix = "",
  size = 120
}: CircularStatProps) {
  const percentage = Math.round((value / max) * 100);
  
  return (
    <Box sx={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center',
      p: 3
    }}>
      <Box sx={{ position: 'relative', display: 'inline-flex' }}>
        <CircularProgress
          variant="determinate"
          value={percentage}
          size={size}
          thickness={8}
          sx={{
            color: color,
            '& .MuiCircularProgress-circle': {
              strokeLinecap: 'round',
            },
          }}
        />
        <Box
          sx={{
            top: 0,
            left: 0,
            bottom: 0,
            right: 0,
            position: 'absolute',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          <Typography
            variant="h4"
            component="div"
            color="text.primary"
            sx={{ fontWeight: 'bold' }}
          >
            {value}{suffix}
          </Typography>
          <Typography variant="caption" color="text.secondary">
            sur {max}
          </Typography>
        </Box>
      </Box>
      <Typography variant="h6" color="text.secondary" sx={{ mt: 2, textAlign: 'center', fontWeight: 600 }}>
        {label}
      </Typography>
    </Box>
  );
}

// Graphique en camembert pour les résultats
interface ResultsPieChartProps {
  matchData: Array<{
    name: string;
    value: number;
    color: string;
  }>;
}

export function ResultsPieChart({ matchData }: ResultsPieChartProps) {
  return (
    <Card sx={{ height: 450 }}>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <TrendingUp color="primary" /> Résultats de la saison
        </Typography>
        <Box sx={{ height: 350 }}>
          <ResponsiveContainer width="100%" height="100%">
            <PieChart>
              <Pie
                data={matchData}
                cx="50%"
                cy="50%"
                outerRadius={120}
                fill="#8884d8"
                dataKey="value"
                label={({ name, value, percent }) => `${name}: ${value} (${(percent * 100).toFixed(0)}%)`}
              >
                {matchData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} />
                ))}
              </Pie>
              <Tooltip />
            </PieChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
}

// Graphique en barres pour performance domicile/extérieur
interface PerformanceBarChartProps {
  performanceData: Array<{
    name: string;
    wins: number;
    draws: number;
    losses: number;
  }>;
}

export function PerformanceBarChart({ performanceData }: PerformanceBarChartProps) {
  return (
    <Card sx={{ height: 450 }}>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <Stadium color="primary" /> Performance Domicile/Extérieur
        </Typography>
        <Box sx={{ height: 350 }}>
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={performanceData} barGap={10}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip />
              <Bar dataKey="wins" fill={COLORS.wins} name="Victoires" radius={4} />
              <Bar dataKey="draws" fill={COLORS.draws} name="Nuls" radius={4} />
              <Bar dataKey="losses" fill={COLORS.losses} name="Défaites" radius={4} />
            </BarChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
}

// Graphique détaillé avec les statistiques circulaires
interface DetailedStatsProps {
  stats: {
    goals: number;
    goalsAgainst: number;
    possession: number;
    goalDiff: number;
  };
}

export function DetailedStatsChart({ stats }: DetailedStatsProps) {
  return (
    <Card>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 4 }}>
          <Speed color="primary" /> Statistiques détaillées
        </Typography>
        <Grid container spacing={4}>
          <Grid item xs={12} sm={6} md={3}>
            <CircularStat 
              value={stats.goals} 
              max={60} 
              label="Buts marqués" 
              color={COLORS.success} 
              size={140} 
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <CircularStat 
              value={stats.goalsAgainst} 
              max={40} 
              label="Buts encaissés" 
              color={COLORS.error} 
              size={140} 
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <CircularStat 
              value={stats.possession} 
              max={100} 
              label="Possession %" 
              color={COLORS.info} 
              suffix="%" 
              size={140} 
            />
          </Grid>
          <Grid item xs={12} sm={6} md={3}>
            <CircularStat 
              value={stats.goalDiff} 
              max={30} 
              label="Différentiel" 
              color={COLORS.warning} 
              suffix="+" 
              size={140} 
            />
          </Grid>
        </Grid>
      </CardContent>
    </Card>
  );
}

// Graphique d'évolution mensuelle
interface MonthlyFormChartProps {
  monthlyData: Array<{
    month: string;
    points: number;
  }>;
}

export function MonthlyFormChart({ monthlyData }: MonthlyFormChartProps) {
  return (
    <Card sx={{ height: 400 }}>
      <CardContent sx={{ p: 4 }}>
        <Typography variant="h5" gutterBottom sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 3 }}>
          <TrendingUp color="primary" /> Évolution mensuelle
        </Typography>
        <Box sx={{ height: 300 }}>
          <ResponsiveContainer width="100%" height="100%">
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="month" />
              <YAxis />
              <Tooltip />
              <Line 
                type="monotone" 
                dataKey="points" 
                stroke={COLORS.primary} 
                strokeWidth={3}
                dot={{ r: 6 }}
              />
            </LineChart>
          </ResponsiveContainer>
        </Box>
      </CardContent>
    </Card>
  );
}