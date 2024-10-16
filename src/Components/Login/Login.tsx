import { Box, Button, TextField, Typography } from '@mui/material';

const Login = () => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100vh' }}>
      <Typography variant="h4" sx={{ mb: 3 }}>
        Login
      </Typography>
      <TextField
        label="Email"
        variant="outlined"
        type="email"
        sx={{ mb: 2, width: "300px" }}
      />
      <TextField
        label="Password"
        variant="outlined"
        type="password"
        sx={{ mb: 2, width: "300px" }}
      />
      <Button variant="contained" color="primary">
        Login
      </Button>
    </Box>
    );
};

export default Login;