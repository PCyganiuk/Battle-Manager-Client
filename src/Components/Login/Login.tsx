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
      const response = await fetch('http://127.0.0.1:8000/users/login', {
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
        <Box sx={{ display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        height: '100vh'}}>
      <Typography variant="h4" sx={{ mb: 3 }}>
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
        sx={{ mb: 2, width: "300px" }}
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
        sx={{ mb: 2, width: "300px" }}
      />
      <Button variant="outlined" color="primary" sx={{width: "200px", borderRadius: "20px"}} onClick={handleLogin}>
        Login
      </Button>
    </Box>
    );
};

export default Login;