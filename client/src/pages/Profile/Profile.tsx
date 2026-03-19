import React from 'react';
import { Box, Typography } from '@mui/material';
import Navbar from '../../components/Navbar/Navbar';

const Profile = () => {
  // Get user data so the Navbar will not collapse. We will use this data to populate the profile page in the next branch.
  const savedUser = localStorage.getItem("user");
  const user = savedUser && savedUser !== "undefined" ? JSON.parse(savedUser) : null;

  return (
    <Box sx={{ minHeight: '100vh', bgcolor: '#f8f9fa' }}>
      <Navbar user={user} onNewPostClick={() => console.log("Open modal")} />
      <Box sx={{ pt: '100px', textAlign: 'center' }}>
        <Typography variant="h4" color="primary" fontWeight="bold">
          עמוד פרופיל בבנייה 🚧
        </Typography>
        <Typography>כאן נעצב את הפרופיל בבראנץ' הבא!</Typography>
      </Box>
    </Box>
  );
};

export default Profile;