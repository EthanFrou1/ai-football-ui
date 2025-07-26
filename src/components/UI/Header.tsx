import { AppBar, Toolbar, Typography, Button, Box, IconButton } from "@mui/material";
import { Link, useLocation } from "react-router-dom";
import { Home as HomeIcon, Sports } from "@mui/icons-material";

export default function Header() {
  const location = useLocation();

  const isActive = (path: string) => location.pathname === path;

  return (
    <AppBar position="static">
      <Toolbar>
        {/* Logo/Titre cliquable qui redirige vers Home */}
        <Box 
          component={Link} 
          to="/" 
          sx={{ 
            display: 'flex', 
            alignItems: 'center', 
            textDecoration: 'none', 
            color: 'inherit',
            flexGrow: 1,
            '&:hover': { opacity: 0.8 }
          }}
        >
          <Sports sx={{ mr: 1, fontSize: 30 }} />
          <Typography variant="h6" component="div">
            AI Football
          </Typography>
        </Box>

        {/* Navigation */}
        <Box display="flex" alignItems="center">
          {/* Bouton Home avec icône */}
          <IconButton
            color="inherit"
            component={Link}
            to="/"
            sx={{ 
              mr: 1,
              backgroundColor: isActive("/") ? 'rgba(255,255,255,0.1)' : 'transparent'
            }}
            title="Accueil"
          >
            <HomeIcon />
          </IconButton>

          {/* Bouton sélecteur de ligues */}
          <Button
            color="inherit"
            component={Link}
            to="/leagues"
            sx={{ 
              fontWeight: isActive("/leagues") ? "bold" : "normal",
              backgroundColor: isActive("/leagues") ? 'rgba(255,255,255,0.1)' : 'transparent'
            }}
          >
            Championnats
          </Button>
        </Box>
      </Toolbar>
    </AppBar>
  );
}