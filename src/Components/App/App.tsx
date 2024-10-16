import { Button, Container, Paper, Typography, Box } from "@mui/material"
import './App.css';
import Login from '../Login/Login';
import { BrowserRouter as Router, Routes, Route, useNavigate } from 'react-router-dom';
import { useEffect, useState } from "react";
import particleImage from "/assets/smolbartek.png";

const Particle: React.FC<{ x: number; y: number }> = ({ x, y }) => {
  return (
    <img
      alt="Particle"
      src={particleImage}
      className="particle"
      style={{
        left: `${x}px`,
        top: `${y}px`
      }}
    />
  );
};

const Home = () => {
  const navigate = useNavigate();
  const [mousePosition, setMousePosition] = useState({x: 0, y: 0});

  const goToLogin = () => {
    navigate('/login');
  }

  useEffect(() => {
    const handleMouseMove = (event: MouseEvent) => {
      setMousePosition({x: event.clientX, y: event.clientY});
    };

    window.addEventListener('mousemove', handleMouseMove);

    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
    }

  })


  return <Box sx={{
    backgroundImage: 'url(/assets/bg-home.png)', 
    backgroundPosition: "center",
    backgroundSize: "cover"
  }}>
    <Particle x={mousePosition.x} y={mousePosition.y}/>
  <Container sx={{
    height: "100vh",
    display: "flex",
    justifyContent: "center",
    flexDirection: "column",
    alignItems: "center",
    gap: 3
  }}>
    <Typography variant="h1" sx={{color: "grey", textAlign: "center"}}>Battle Ready?!</Typography>
    <Paper elevation={7} sx={{
      color: "grey",
      padding: 3,
      maxWidth: 600,
      fontSize: 30,
      fontFamily: "Roboto", 
      textAlign: "center", 
      borderRadius: "20px",
      backgroundColor: 'rgba(130, 255, 255, 0.3)',
      backdropFilter: 'blur(5px)'
      }}>
      
      Are you DM who wants to take his combat encounters to the next level?
       Create new exctiting battlefields an invite your friends.
       
    </Paper>
    <Box
        sx={{
          display: "flex",
          gap: 20,
          marginTop: 1,
        }}
      >
        <Button variant="contained" color="primary" sx={{width: "200px", borderRadius: "20px", backdropFilter: 'blur(10px)',textEmphasisColor: "grey",'&:hover': {color: "black",} }}>
          Register
        </Button>
        <Button variant="outlined" color="primary" sx={{width: "200px", borderRadius: "20px"}} onClick={goToLogin}>
          Login
        </Button>
    </Box>
  </Container>
  </Box>;
}

const App = () => {
  return (
    <Router>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/login" element={<Login />} />
      </Routes>
    </Router>
  );
};

export default App;
