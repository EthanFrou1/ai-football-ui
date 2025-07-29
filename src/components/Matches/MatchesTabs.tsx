// src/components/Matches/MatchesTabs.tsx
import React from 'react';
import {
  Box,
  Tabs,
  Tab,
  Badge,
  Paper
} from '@mui/material';
import {
  FiberManualRecord as FiberManualRecordIcon,
  AccessTime as AccessTimeIcon,
  CheckCircle as CheckCircleIcon
} from '@mui/icons-material';
import type { MatchData } from '../../services/api/matchesService';

type TabValue = 'live' | 'upcoming' | 'recent';

interface MatchesTabsProps {
  activeTab: TabValue;
  onTabChange: (tab: TabValue) => void;
  matchCounts: {
    live: number;
    upcoming: number;
    recent: number;
  };
}

export const MatchesTabs: React.FC<MatchesTabsProps> = ({
  activeTab,
  onTabChange,
  matchCounts
}) => {
  const getTabColor = (tab: TabValue) => {
    switch (tab) {
      case 'live': return '#ef4444';
      case 'upcoming': return '#3b82f6';
      case 'recent': return '#22c55e';
      default: return '#6b7280';
    }
  };

  const handleTabChange = (_: React.SyntheticEvent, newValue: TabValue) => {
    onTabChange(newValue);
  };

  return (
    <Paper elevation={2} sx={{ mb: 3 }}>
      <Tabs 
        value={activeTab} 
        onChange={handleTabChange}
        variant="fullWidth"
        sx={{
          '& .MuiTab-root': {
            textTransform: 'none',
            fontWeight: 600,
            fontSize: '1rem',
            py: 2
          },
          '& .Mui-selected': {
            color: getTabColor(activeTab) + ' !important'
          },
          '& .MuiTabs-indicator': {
            backgroundColor: getTabColor(activeTab),
            height: 3
          }
        }}
      >
        <Tab 
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <FiberManualRecordIcon 
                sx={{ 
                  fontSize: 16, 
                  color: '#ef4444', 
                  animation: activeTab === 'live' ? 'pulse 2s infinite' : 'none' 
                }} 
              />
              En cours
              {matchCounts.live > 0 && (
                <Badge badgeContent={matchCounts.live} color="error" />
              )}
            </Box>
          }
          value="live"
        />
        <Tab 
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <AccessTimeIcon sx={{ fontSize: 16 }} />
              À venir
              {matchCounts.upcoming > 0 && (
                <Badge badgeContent={matchCounts.upcoming} color="primary" />
              )}
            </Box>
          }
          value="upcoming"
        />
        <Tab 
          label={
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
              <CheckCircleIcon sx={{ fontSize: 16 }} />
              Terminés
              {matchCounts.recent > 0 && (
                <Badge badgeContent={matchCounts.recent} color="success" />
              )}
            </Box>
          }
          value="recent"
        />
      </Tabs>
    </Paper>
  );
};