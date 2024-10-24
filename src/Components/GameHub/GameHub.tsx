import { AppBar,ButtonGroup, Box, Container, Paper, Tab, Tabs, Toolbar, Grid2, CircularProgress, Typography, Button, Tooltip } from "@mui/material"
import React, { useState, useEffect} from "react";
import DeleteIcon from '@mui/icons-material/Delete';
import TuneIcon from '@mui/icons-material/Tune';
import AddIcon from '@mui/icons-material/Add';
import JoinInnerIcon from '@mui/icons-material/JoinInner';
import RocketLaunchIcon from '@mui/icons-material/RocketLaunch';
import { useNavigate } from "react-router-dom";

interface GameData {
  id: number;
  gameId: string;
  gameName: string;
  picture: string;
}

const GameHub = () => {
  const [value, setValue] = useState(0);
  const [games, setGames] = useState<GameData[]>([]);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

    const runGame = async () => {
        navigate('/game-map');
    }

  const handleChange = (event: React.SyntheticEvent, newValue: number) => {
    setValue(newValue);
  };

  useEffect(() => {
    const fetchGames = async () => {
      setLoading(true);
      try {
        const userId = localStorage.getItem('userId');
        if (!userId) {
          //go back to login page
        }
        
        const jwtToken = localStorage.getItem('token');
        const response = await fetch(`http://127.0.0.1:8000/games/${userId}`, {
        method: 'GET',
        headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${jwtToken}`,
        },
});

        if (!response.ok) {
          throw new Error('network response not ok');
        }

        const data = await response.json();

        const fetchedGames = data.map((game: any, index: number) => ({
          id: index + 1,
          gameId: game._id,
          gameName: game.game_name,
        }));

        setGames(fetchedGames);
      }
      catch (error) {
        console.error('Error fetching games:', error);
      }
      setLoading(false);
    };
    fetchGames();
  }, []);

    return <Box sx={{
        backgroundImage: 'url(/assets/bg-home.png)', 
        backgroundPosition: "center",
        backgroundSize: "cover"
      }}>
        <Container
        sx={{
            height: "100vh",
            display: "flex",
            justifyContent: "flex-start",
            flexDirection: "column",
            alignItems: "center",
            gap: 1
          }}>
            <AppBar position="static" sx={{
              borderRadius: "20px", 
              padding: 1,
              display: "flex",
              width: "70vw",
              justifyContent: 'center',
              boxSizing: 'border-box'
            }}>
              <Toolbar>
                <img src="/assets/logo-white.png" style={{maxWidth: '30%',height: 'auto', objectFit: 'contain'}}/>
              </Toolbar>
            </AppBar>
            <Box sx={{
              height: "100vh",
              width: "70vw",
              display: "flex",
              padding: 2,
              gap: 2
            }}>
            <Paper
            elevation={7} sx={{
              color: "grey",
              padding: 3,
              width: "70vw",
              display: "flex",
              flexDirection: "column",
              flexGrow: 1,
              fontSize: 30,
              fontFamily: "Roboto", 
              textAlign: "center", 
              borderRadius: "20px",
              backgroundColor: 'rgba(130, 255, 255, 0.3)',
              backdropFilter: 'blur(5px)',
              boxSizing: 'border-box'
              }}>
            <Tabs value={value} onChange={handleChange} aria-label="game tabs">
              <Tab label="DM Games" />
              <Tab label="Player Games" />
            </Tabs>

              <Box sx={{ padding: 2 }}>
                {value === 0 && (
                  <Box>
                    {loading ? (
                      <CircularProgress />
                    ) : (
                      <Grid2 container spacing={2} sx={{ marginTop: 2 }}>
                        {games.map((game) => (
                          <Grid2 key={game.id} >
                            <Paper sx={{ 
                              padding: 2, 
                              textAlign: 'center' ,
                              alignItems: 'center',
                              width: 200,
                              height: 200,
                              display: 'flex',
                              flexDirection: 'column',
                              flexGrow: 1,
                              justifyContent: 'space-between',
                              borderRadius: "20px",
                              overflow: 'hidden',
                              outline: '1px solid indigo',     
                              }}>
                                <Typography sx={{color: 'indigo'}}>{game.gameName}</Typography>
                                {game.picture ? (
                                <img
                                  src={`data:image/png;base64,${game.picture}`}
                                  style={{
                                    width: '50%', // Make image responsive
                                    height: 'auto', // Maintain aspect ratio
                                    borderRadius: '10px', // Optional: add some border radius
                                    marginBottom: '10px' // Optional: add space below the image
                                  }}
                                />) : (
                                  <img
                                    src="/assets/smolbartek.png"
                                    style={{
                                      width: '50%',
                                      height: 'auto',
                                      objectFit: 'contain',
                                    }}
                                  />
                                )}

                                <ButtonGroup aria-label="Basic button group">
                                  <Button color="success" onClick={runGame}><RocketLaunchIcon/></Button>
                                  <Button><TuneIcon/></Button>
                                  <Button color="error"><DeleteIcon /></Button>
                                </ButtonGroup>
                            </Paper>
                          </Grid2>
                        ))}
                      </Grid2>
                    )}
                  </Box>
                )}
                {value === 1 && <div>Player Games</div>}
              </Box>
            </Paper>
            <Box sx={{
              display:'flex',
              flexDirection: 'column',
              gap: 1
            }}>
              <Tooltip title='Create New Game' placement="right" arrow>
                <Button> <AddIcon/> </Button>
              </Tooltip>
              <Tooltip title='Join Existing Game' placement="right" arrow>
                <Button> <JoinInnerIcon/> </Button>
              </Tooltip>
              <Paper sx={{
                display: 'flex',
                flexDirection: 'column',
                borderRadius: "20px",
                width: "7vw",
                height: "100vh",
                backgroundColor: 'rgba(255, 255, 255, 0.3)',
                backdropFilter: 'blur(5px)',
                outline: " 1px solid indigo"
              }}>
              </Paper>
            </Box>
            </Box>
        </Container>
    </Box>
}

export default GameHub