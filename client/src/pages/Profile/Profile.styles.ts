import { styled } from '@mui/material/styles';
import { Box, Avatar, Typography, Button } from '@mui/material';

export const ProfileRoot = styled(Box)({
  minHeight: '100vh',
  backgroundColor: '#fafafa', 
  paddingBottom: '50px',
  paddingTop: '80px',
});

export const ProfileContainer = styled(Box)({
  width: '80%',
  maxWidth: '1600px',
  margin: '20px auto 40px', 
  padding: '0 40px',
  position: 'relative',
});

export const PurpleBanner = styled(Box)({
  backgroundImage: `url('data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSI0MCIgaGVpZ2h0PSI0MCIgdmlld0JveD0iMCAwIDQwIDQwIj48ZyBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wNSI+PHBhdGggZD0iTTAgMGg0MHY0MEgwVjB6bTIwIDIwaDIwdjIwSDIWMjB6TTAgMjBoMjB2MjBIMFYyMHoyMCAwaDIwdjIwSDIwVjB6Ii8+PC9nPjwvZz48L3N2Zz4='), linear-gradient(135deg, #673ab7 0%, #8e24aa 100%)`,
  borderRadius: '24px',
  height: '230px', 
  position: 'relative',
  display: 'flex',
  alignItems: 'flex-end',
  padding: '30px 40px',
  color: 'white',
  boxShadow: '0 15px 35px rgba(103, 58, 183, 0.12)',
});

export const EditProfileButton = styled(Button)({
  position: 'absolute',
  top: '30px',
  right: '30px',
  backgroundColor: 'rgba(255, 255, 255, 0.15)',
  backdropFilter: 'blur(5px)',
  color: 'white',
  border: '1px solid rgba(255, 255, 255, 0.3)',
  padding: '8px 24px',
  borderRadius: '30px',
  fontSize: '14px',
  fontWeight: 700,
  textTransform: 'none',
  gap: '8px',
  transition: 'all 0.2s ease',
  '&:hover': {
    backgroundColor: 'rgba(255, 255, 255, 0.25)',
    transform: 'translateY(-2px)',
    border: '1px solid rgba(255, 255, 255, 0.4)',
  }
});

export const AvatarWrapper = styled(Box)({
  position: 'absolute',
  bottom: '-50px',
  left: '50px',
  width: '160px', 
  height: '160px', 
  borderRadius: '50%',
  border: '6px solid #fafafa',
  backgroundColor: '#e0e0e0',
  boxShadow: '0 10px 25px rgba(103, 58, 183, 0.25)',
  overflow: 'hidden',
});

export const StyledAvatar = styled(Avatar)({
  width: '100%',
  height: '100%',
  fontSize: '4.5rem', 
  fontWeight: 'bold',
  backgroundColor: '#ce93d8',
});

export const BannerContent = styled(Box)({
  display: 'flex',
  width: '100%',
  justifyContent: 'space-between',
  alignItems: 'center',
  marginLeft: '200px', 
});

export const UserDetails = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'flex-start',
});

export const UserNameTitle = styled(Typography)({
  fontSize: '36px', 
  fontWeight: 900,
  marginBottom: '4px',
  letterSpacing: '-0.5px',
  lineHeight: 1.2,
});

export const UserEmailText = styled(Typography)({
  fontSize: '18px',
  color: 'rgba(255, 255, 255, 0.85)',
  fontWeight: 600,
});

export const StatsGlassBox = styled(Box)({
  display: 'flex',
  backgroundColor: 'rgba(255, 255, 255, 0.1)',
  backdropFilter: 'blur(8px)',
  border: '1px solid rgba(255, 255, 255, 0.15)',
  borderRadius: '16px',
  padding: '15px 50px',
  gap: '50px', 
  boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
});

export const StatItem = styled(Box)({
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  position: 'relative',
  '&:first-of-type::after': {
    content: '""',
    position: 'absolute',
    right: '-25px',
    top: '15%',
    height: '70%',
    width: '1px',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
  }
});

export const StatValue = styled(Typography)({
  fontSize: '24px', 
  fontWeight: 900,
  display: 'flex',
  alignItems: 'center',
  gap: '10px',
  lineHeight: 1,
  marginBottom: '4px',
});

export const StatLabel = styled(Typography)({
  fontSize: '12px',
  textTransform: 'uppercase',
  color: 'rgba(255, 255, 255, 0.85)',
  letterSpacing: '1px',
  fontWeight: 700,
});

export const FeedSection = styled(Box)({
  maxWidth: '700px', 
  margin: '80px auto 0', 
  width: '100%',
});

export const FeedTitle = styled(Typography)({
  fontSize: '22px', 
  fontWeight: 800,
  marginBottom: '25px',
  display: 'inline-block',
  color: '#2d3436',
  position: 'relative',
  '&::after': {
    content: '""',
    display: 'block',
    width: '100%',
    height: '3px',
    backgroundColor: '#ce93d8',
    marginTop: '8px',
    borderRadius: '2px',
  }
});