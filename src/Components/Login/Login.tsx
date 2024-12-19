import { Box, Button, TextField, Typography } from '@mui/material';
import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

const Login = () => {
  const [username, setUsername] = useState('');
  const [password,setPassword] = useState('');
  const [errorMessage, setErrorMessage] = useState({username: false, password:false, usernameMessage: '', passwordMessage: ''});
  const navigate = useNavigate();

  const handleLogin = async () => {
    setErrorMessage({ username: false, password: false, usernameMessage: '', passwordMessage: ''});
    try {
      const response = await fetch('https://battle-ready-fdfec7b7e9hndgfp.polandcentral-01.azurewebsites.net/users/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json()
        const errorDetail = errorData.detail;
        if (errorDetail.includes("User not found")){
          setErrorMessage({ username: true, password: false, usernameMessage: errorDetail, passwordMessage: ''});
        }
        else if (errorDetail.includes("Wrong password")){
          setErrorMessage({ username: false, password: true, usernameMessage: '', passwordMessage: errorDetail});
        }
        return;
      }

      const data = await response.json();
      
      const token = data.access_token;
      const userId = data.user_id;

      localStorage.setItem('token', token);
      localStorage.setItem('userId',userId);

      console.log('Login successful:', data); //TODO delete this in prod
      navigate('/game-hub');

    } catch (error) {
      console.error('Error logging in:', error);
    }
  };
  const handleKeyPress = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      handleLogin();
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
        Login
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
      <Button variant="outlined" color="primary" sx={{width: "200px", borderRadius: "20px"}} onClick={handleLogin}>
        Login
      </Button>
    </Box>
    );
};

export default Login;