import React from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { Avatar } from '@mui/material';
import { MapPinned, Home as HomeIcon, PlusSquare, LogOut, MapIcon } from 'lucide-react';
import { NavContainer, LogoWrapper, NavLinks, NavItem, UserPill } from './Navbar.styles';

interface NavbarProps {
  user: {
    username?: string;
    name?: string;
    photo?: string;
  } | null;
  onNewPostClick: () => void;
}

const Navbar: React.FC<NavbarProps> = ({ user, onNewPostClick }) => {
  const navigate = useNavigate();
  const location = useLocation(); // Hook to get the current location for active link styling

  const handleLogout = () => {
    localStorage.removeItem("user");
    localStorage.removeItem("token");
    localStorage.removeItem("accessToken");
    localStorage.removeItem("refreshToken");
    navigate("/login");
  };

  const displayName = user?.username || user?.name || "Guest";
  const imageUrl = user?.photo 
    ? (user.photo.startsWith('http') ? user.photo : `http://localhost:3000/public/${user.photo.split('/').pop()}`) 
    : "";

  return (
    <NavContainer>
      <LogoWrapper onClick={() => navigate('/')}>
        <MapPinned size={24} />
        NextStop
      </LogoWrapper>

      <NavLinks>
        {/* Check if the current path is '/' and change color accordingly */}
        <NavItem 
          isActive={location.pathname === '/'} 
          onClick={() => navigate('/')}
        >
          <HomeIcon size={20} /> 
          <span className="nav-text">Feed</span>
        </NavItem>
        
        {/* Check if the current path is '/new-post' and change color accordingly */}
        <NavItem 
          isActive={location.pathname === '/new-post'} 
          onClick={onNewPostClick}
        >
          <PlusSquare size={20} /> 
          <span className="nav-text">New Post</span>
        </NavItem>

        {/* Check if the current path is '/profile' and change color accordingly */}
        <NavItem 
          isActive={location.pathname === '/profile'} 
          onClick={() => navigate('/profile')}
        >
          <UserPill>
            <span className="nav-text">{displayName}</span>
            <Avatar 
              src={imageUrl} 
              sx={{ width: 25, height: 25, fontSize: '12px', bgcolor: 'primary.main' }}
            >
              {!imageUrl && displayName[0].toUpperCase()}
            </Avatar>
          </UserPill>
        </NavItem>

        <NavItem onClick={handleLogout}>
          <LogOut size={20} />
        </NavItem>
      </NavLinks>
    </NavContainer>
  );
};

export default Navbar;