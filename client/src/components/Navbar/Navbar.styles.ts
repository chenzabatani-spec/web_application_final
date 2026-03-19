import { styled } from '@mui/material/styles';
import { Box, Typography } from '@mui/material';

export const NavContainer = styled('nav')({
  background: '#ffffff',
  height: '70px',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'space-between',
  padding: '0 5%',
  position: 'fixed',
  top: 0,
  left: 0,
  width: '100%',
  zIndex: 1000,
  boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
});

export const LogoWrapper = styled(Typography)(({ theme }) => ({
  fontFamily: "'Heebo', sans-serif",
  fontWeight: 800,
  fontSize: '24px',
  color: theme.palette.primary.main,
  textDecoration: 'none',
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  cursor: 'pointer',
}));

export const NavLinks = styled(Box)({
  display: 'flex',
  gap: '25px',
  alignItems: 'center',
});

// Define the props for NavItem to determine if it's active or not
interface NavItemProps {
  isActive?: boolean;
}

// NavItem will change its style based on whether it's active or not
export const NavItem = styled(Box, {
  shouldForwardProp: (prop) => prop !== 'isActive',
})<NavItemProps>(({ theme, isActive }) => ({
  cursor: 'pointer',
  // If the page is active, use the primary color, otherwise use the default text color
  color: isActive ? theme.palette.primary.main : theme.palette.text.primary,
  textDecoration: 'none',
  fontWeight: isActive ? 800 : 600,
  transition: 'all 0.3s ease',
  display: 'flex',
  alignItems: 'center',
  gap: '8px',
  '&:hover': {
    color: theme.palette.primary.main,
  },
  '@media (max-width: 768px)': {
    '& .nav-text': {
      display: 'none',
    },
  },
}));

export const UserPill = styled(Box)({
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  background: '#f3e5f5',
  padding: '5px 15px',
  borderRadius: '50px',
  border: '1px solid #ce93d8',
});