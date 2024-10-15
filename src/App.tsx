import { Button, Container, Paper, Typography, Box } from "@mui/material"
import './App.css';
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

function App() {

  const [mousePosition, setMousePosition] = useState({x: 0, y: 0});

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
    backgroundPosition: "center"
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
          display: "flex", // Places buttons side by side
          gap: 20, // Adds space between buttons
          marginTop: 1, // Adds space between Paper and Buttons
        }}
      >
        <Button variant="contained" color="secondary" sx={{width: "200px", borderRadius: "20px", backdropFilter: 'blur(10px)',textEmphasisColor: "grey"}}>
          Register
        </Button>
        <Button variant="outlined" color="primary" sx={{width: "200px", borderRadius: "20px"}}>
          Login
        </Button>
    </Box>
  </Container>
  </Box>;
}

export default App
