import { Box, Button, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Register = () => {
  const [username, setUsername] = useState('');
  const [email, setEmail] = useState('');
  const [password,setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState({username : false, password : false, email : false, usernameMessage : '', passwordMessage : '', emailMessage : ''});
  const navigate = useNavigate();

  const handleRegister = async () => {
    setErrorMessage({ username : false, password : false, email : false, usernameMessage : '', passwordMessage : '', emailMessage : ''});
    try {
      const response = await fetch(`${import.meta.env.VITE_REST_API_URL}/users/register`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          email,
          password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json()
        const errorDetail = errorData.detail;
        if (errorDetail.includes("Username already exists")){
          setErrorMessage({ username : true, password : false, email : false, usernameMessage : errorDetail, passwordMessage : '', emailMessage : ''});
        }
        else if (errorDetail.includes("Account with that email already exists")){
          setErrorMessage({ username: false, password: false, email : true, usernameMessage: '', passwordMessage: '', emailMessage : errorDetail});
        }
        return;
      }

      const data = await response.json();

      console.log('Register successful:', data); //TODO delete this in prod
      navigate('/login');

    } catch (error) {
      console.error('Error registering:', error);
    }
  };
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleRegister();
    }
  }; 

    return (
        <Box sx={{
        backgroundImage: `url(/assets/blob-scene-haikei.svg), url(/assets/bg-home.png)`,
        backgroundPosition: "center, center",
        backgroundSize: "cover, cover",
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh'}}>
      <Typography variant="h4" sx={{ mb: 3, color: 'grey'}}>
        Register
      </Typography>
      <TextField
        label="Username"
        variant="outlined"
        type="username"
        value={username}
        onChange={(e) => setUsername(e.target.value)}
        error={errorMessage.username}
        helperText={errorMessage.usernameMessage}
        sx={{ 
          mb: 2, 
          width: "300px",
          backgroundColor: 'rgba(255, 255, 255, 0.5)', // White with transparency
          backdropFilter: 'blur(5px)', // Apply blur effect
          borderRadius: '8px', // Optional: for rounded corners
          '& .MuiOutlinedInput-root': {
          backgroundColor: 'transparent', // Make input background transparent
          borderRadius: '8px', // Match input's border radius with the text field
          }, 
        }}
      />
      <TextField
        label="email address"
        variant="outlined"
        type="email"
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        error={errorMessage.email}
        helperText={errorMessage.emailMessage}
        sx={{ 
          mb: 2, 
          width: "300px",
          backgroundColor: 'rgba(255, 255, 255, 0.5)', // White with transparency
          backdropFilter: 'blur(5px)', // Apply blur effect
          borderRadius: '8px', // Optional: for rounded corners
          '& .MuiOutlinedInput-root': {
          backgroundColor: 'transparent', // Make input background transparent
          borderRadius: '8px', // Match input's border radius with the text field
          }, 
        }}
      />
      <TextField
        label="Password"
        variant="outlined"
        type="password"
        value={password}
        error={errorMessage.password}
        helperText={errorMessage.passwordMessage}
        onKeyDown={handleKeyPress}
        onChange={(e) => setPassword(e.target.value)}
        sx={{ 
          mb: 2, 
          width: "300px",
          backgroundColor: 'rgba(255, 255, 255, 0.5)', // White with transparency
          backdropFilter: 'blur(5px)', // Apply blur effect
          borderRadius: '8px', // Optional: for rounded corners
          '& .MuiOutlinedInput-root': {
          backgroundColor: 'transparent', // Make input background transparent
          borderRadius: '8px', // Match input's border radius with the text field
          },
          
        }}
      />
      <Button variant="outlined" color="primary" sx={{width: "200px", borderRadius: "20px"}} onClick={handleRegister}>
        Register
      </Button>
    </Box>
    );
};

export default Register;