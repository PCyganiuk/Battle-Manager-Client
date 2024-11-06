import { Graphics as PixiGraphics, Rectangle, Polygon } from 'pixi.js';
import { Stage, Container, Sprite, Graphics } from '@pixi/react';
import { useRef, useState, useEffect } from 'react';
import MapIcon from '@mui/icons-material/Map';
import CloudIcon from '@mui/icons-material/Cloud';
import PersonIcon from '@mui/icons-material/Person';
import PersonAddIcon from '@mui/icons-material/PersonAdd';
import LandscapeIcon from '@mui/icons-material/Landscape';
import useWebSocket from 'react-use-websocket'
import { Box, Typography, Button, Paper, Dialog, DialogContent, DialogActions, DialogTitle, TextField, ToggleButtonGroup, ToggleButton, ButtonGroup } from '@mui/material';
import { ObstacleProps, Pawn } from '../types.ts';
import { MuiColorInput } from 'mui-color-input';

const GameMap = () => {
  const API_URL = '127.0.0.1:8000'
  const thisGameId = localStorage.getItem('gameId')
  const [isDragging, setIsDragging] = useState(false);
  const [startDrag, setStartDrag] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [pawns, setPawns] = useState<Pawn[]>([]);
  const [layer, setLayer] = useState('token');
  const [zoom, setZoom] = useState(1);
  const fogGraphicsRef = useRef<PixiGraphics | null>(null);
  const [hoveredPawnIndex, setHoveredPawnIndex] = useState<number | null>(null);
  const [addPawnDialogOpen, setAddPawnDialogOpen] = useState(false);
  const [isOverPawn, setIsOverPawn] = useState(false);
  const [pivot, setPivot] = useState({ x: 0, y: 0 });
  const stageRef = useRef<any>(null);
  const [obstacles, setObstacles] = useState<ObstacleProps[]>([]);
  const [obstacleDialogOpen, setObstacleDialogOpen] = useState(false);
  const [obstacleConfig, setObstacleConfig] = useState({
      width: 100,
      height: 100,
      color: 0xff0000,
  });
  const [newPawn, setNewPawn] = useState<Omit<Pawn, 'isDragging' | 'startDrag' | 'pos_x' | 'pos_y'>>({
    id: '',
    pawn_name: '',
    dimension_x: 50,
    dimension_y: 50,
    hit_points: 10,
    initiative: 1,
    attack_bonus: 0,
    damage_bonus: 0,
    armor_class: 10,
    strength: 10,
    dexterity: 10,
    constitution: 10,
    intelligence: 10,
    wisdom: 10,
    charisma: 10,
    speed: 30,
    game_id: thisGameId,
    ai_enabled: false,
    player_character: '',
    picture: 'https://pixijs.io/pixi-react/img/bunny.png',
    moved: false,
  });
  const gridRows = 30;
  const gridCols = 30;
  const squareSize = 50;
  const socketUrl = `ws://${API_URL}/ws/pawns/${thisGameId}`
  
  const visionRadius = 200;

  const openAddPawnDialog = () => setAddPawnDialogOpen(true);
  const closeAddPawnDialog = () => setAddPawnDialogOpen(false);

  const openObstacleDialog = () => setObstacleDialogOpen(true);
  const closeObstacleDialog = () => setObstacleDialogOpen(false);

  const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl, {
    onOpen: () => console.log('Websocket connection opened'),
    onClose: () => console.log('WebSocket connection closed'),
    onError: (error) => console.error('WebSocket error:', error),
    shouldReconnect: () => true,
  });

  const addObstacle = () => {
    const newObstacle: ObstacleProps = {
        id: '',
        pos_x: 960, // center of the map
        pos_y: 540, // center of the map
        width: obstacleConfig.width,
        height: obstacleConfig.height,
        color: obstacleConfig.color,
        isDragging: false,
        startDrag: {x: 0, y: 0},
    };
    setObstacles((prev) => [...prev, newObstacle]);
    closeObstacleDialog();
  };

  const hexToNumber = (hex: string): number => {
    return parseInt(hex.replace(/^#/, ''), 16);
  };

  const handleObstacleConfigChange = (field: keyof typeof obstacleConfig, value: string | number) => {
    const newValue = field === 'color' && typeof value === 'string' ? hexToNumber(value) : value;
    setObstacleConfig({ ...obstacleConfig, [field]: value });
  };

  const fetchPawns = async () => {
    try {
        const response = await fetch(`http://${API_URL}/pawns/${thisGameId}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const pawnsData = await response.json();
        
        console.log(pawnsData);
        if (pawnsData){
          setPawns(pawnsData);
        }
    } catch (error) {
        console.error('Error fetching pawns:', error);
    }
};

  useEffect(() => {
    if (lastMessage !== null){
      try {
        const data = JSON.parse(lastMessage.data);
        console.log(data);
        if(data.event == 'pawn_added' && data.data) {
          setPawns((prevPawns) => [...prevPawns, data.data]);
        }
        else if ( data.event == 'pawn_position_updated' && data.data) {
          const { pawn_id, data: { pos_x, pos_y } } = data;
          console.log(`Updating position for pawn with id ${pawn_id}:`, { pos_x, pos_y });
          
          setPawns((prevPawns) =>
            prevPawns.map((pawn) => {
                if (pawn.id === pawn_id) {
                    return {
                        ...pawn, // Keep the existing properties
                        pos_x: pos_x !== undefined ? pos_x : pawn.pos_x, // Update pos_x only if new value is provided
                        pos_y: pos_y !== undefined ? pos_y : pawn.pos_y, // Update pos_y only if new value is provided
                    };
                }
                return pawn; // Return unchanged pawn
            })
        );
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    }
  }, [lastMessage]);

  useEffect(() => {
    fetchPawns();
  }, [thisGameId]);

  const handleInputChange = (field: keyof Pawn, value: any) => {
    setNewPawn({ ...newPawn, [field]: value });
  };

  const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
      event.preventDefault();
      const zoomFactor = 0.1;
      const newScale = Math.max(0.1, zoom + (event.deltaY > 0 ? -zoomFactor : zoomFactor));
      const rect = event.currentTarget.getBoundingClientRect();
      const mouseX = event.clientX - rect.left;
      const mouseY = event.clientY - rect.top;
      setPivot({ x: mouseX, y: mouseY });
      setZoom(newScale);
  };

  const addPawn = async () => {
    const pawn = {
        ...newPawn,
        pos_x: 1000,
        pos_y: 500,
        isDragging: false,
        startDrag: { x: 0, y: 0 },
    };

    const dbPawn = {
      pawn_name: pawn.pawn_name,
      pos_x: 500,
      pos_y: 500,
      dimension_x: pawn.dimension_x,
      dimension_y: pawn.dimension_y,
      hit_points: pawn.hit_points,
      initiative: pawn.initiative,
      attack_bonus: pawn.attack_bonus,
      damage_bonus: pawn.damage_bonus,
      armor_class: pawn.armor_class,
      strength: pawn.strength,
      dexterity: pawn.dexterity,
      constitution: pawn.constitution,
      intelligence: pawn.intelligence,
      wisdom: pawn.wisdom,
      charisma: pawn.charisma,
      speed: pawn.speed,
      game_id: thisGameId,
      ai_enabled: false,
      player_character: pawn.player_character,
      picture: 'https://pixijs.io/pixi-react/img/bunny.png',
    }
    setPawns([...pawns, pawn]);
    console.log(JSON.stringify(dbPawn));
    try {
      const response = await fetch(`http://${API_URL}/pawns/add/`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(dbPawn),
      });

      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }

      const savedPawn = await response.json();
      const updatedPawn = { ...pawn, id: savedPawn.id };

      setPawns((prevPawns) => [...prevPawns, updatedPawn]);
  } catch (error) {
      console.error('Error adding pawn:', error);
  }
    closeAddPawnDialog();
  };

  const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
      if (event.button === 1) {
        setIsDragging(true);
        setStartDrag({ x: event.clientX - position.x, y: event.clientY - position.y });
      }
    };
  
  const handleMouseMove = (event: React.MouseEvent<HTMLDivElement>) => {
    if (isDragging) {
      setPosition({
        x: event.clientX - startDrag.x,
        y: event.clientY - startDrag.y,
      });
    }
  };

  const handleLayer = (event: React.MouseEvent<HTMLElement>, nextLayer: string) => {
    if (nextLayer != null)
      setLayer(nextLayer);
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  const drawGrid = (g: PixiGraphics) => {
    g.clear();

    const lineThickness = 1 / zoom;

    g.lineStyle(lineThickness, 0xCCCCCC, 1);

    for (let i = 0; i <= gridCols; i++) {
        const x = i * squareSize;
        g.moveTo(x, 0);
        g.lineTo(x, gridRows * squareSize);
    }

    for (let j = 0; j <= gridRows; j++) {
        const y = j * squareSize;
        g.moveTo(0, y);
        g.lineTo(gridCols * squareSize, y);
    }
  };

  const snapToGrid = (x: number, y: number): { x: number; y: number } => {
    const snappedX = Math.round(x / squareSize) * squareSize;
    const snappedY = Math.round(y / squareSize) * squareSize;
    return { x: snappedX, y: snappedY };
  };

  const startDraggingPawn = (event: any, index: number) => {
    if (event.data.button === 0) {
      const { pos_x: x, pos_y: y } = pawns[index];

      const offsetX = event.data.global.x / zoom - x;
      const offsetY = event.data.global.y / zoom - y;

      setPawns((prevPawns) =>
          prevPawns.map((pawn, i) =>
              i === index
                  ? { ...pawn, isDragging: true, startDrag: { x: offsetX, y: offsetY } }
                  : pawn
          )
      );
    }
  };

  const startDraggingObstacle = (event: any, index: number) => {
    if (event.data.button === 0) {
        const { pos_x: x, pos_y: y } = obstacles[index];
        const offsetX = event.data.global.x / zoom - x;
        const offsetY = event.data.global.y / zoom - y;

        setObstacles((prevObstacles) =>
            prevObstacles.map((obstacle, i) =>
                i === index
                    ? { ...obstacle, isDragging: true, startDrag: { x: offsetX, y: offsetY } }
                    : obstacle
            )
        );
    }
};

  const dragPawn = (event: any, index: number) => {  
    setPawns((prevPawns) =>
      prevPawns.map((pawn, i) => {
          if (i === index && pawn.isDragging) {
              let newX = event.data.global.x / zoom - pawn.startDrag.x;
              let newY = event.data.global.y / zoom - pawn.startDrag.y;
              
              newX = Math.max(0, Math.min(newX, gridCols * squareSize - squareSize));
              newY = Math.max(0, Math.min(newY, gridRows * squareSize - squareSize));

              return { ...pawn, pos_x: newX, pos_y: newY };
          }
          return pawn;
      })
    );
    
  };

  const dragObstacle = (event: any, index: number) => {
    setObstacles((prevObstacles) =>
        prevObstacles.map((obstacle, i) => {
            if (i === index && obstacle.isDragging) {
                const newX = event.data.global.x / zoom - obstacle.startDrag!.x;
                const newY = event.data.global.y / zoom - obstacle.startDrag!.y;
                return { ...obstacle, pos_x: newX, pos_y: newY };
            }
            return obstacle;
        })
    );
};

  const stopDraggingPawn = async (index: number) => {
    setPawns((prevPawns) =>
      prevPawns.map((pawn, i) => {
          if (i === index) {
              const { x, y } = snapToGrid(pawn.pos_x, pawn.pos_y);
              pawn.pos_x = x;
              pawn.pos_y = y;
              const updatePawnPosition = async () => {
                try {
                  const response = await fetch(`http://${API_URL}/pawns/new-pos/${pawn.id}`, {
                    method: "PATCH",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    //body: JSON.stringify({ pos_x: x, pos_y: y }),
                  });
                  if (!response.ok) {
                    throw new Error("Failed to update pawn");
                  }
                } catch (error) {
                  console.error("Error updating pawn:", error);
                }
              };

              updatePawnPosition();
              drawFog();
              return { ...pawn, isDragging: false };
          }
          return pawn;
      })
    );
  };

  const stopDraggingObstacle = async (index: number) => {
    setObstacles((prevObstacles) =>
      prevObstacles.map((obstacle, i) => {
          if (i === index) {
              //const { x, y } = snapToGrid(obstacle.pos_x, obstacle.pos_y);
              
              const updateObstaclePosition = async () => {
                try {
                  const response = await fetch(`http://${API_URL}/pawns/new-pos/${obstacle.id}`, {
                    method: "PATCH",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    //body: JSON.stringify({ pos_x: x, pos_y: y }),
                  });
                  if (!response.ok) {
                    throw new Error("Failed to update pawn");
                  }
                } catch (error) {
                  console.error("Error updating pawn:", error);
                }
              };
              
              updateObstaclePosition();
              drawFog();
              return { ...obstacle, isDragging: false };
          }
          return obstacle;
      })
    );
  };

  // Helper function to check if a line segment intersects any obstacles
const isTileBlockedByObstacle = (startX: number, startY: number, endX: number, endY: number) => {
  return obstacles.some(obstacle => {
    // Define the obstacle rectangle as four line segments
    const obstacleLines = [
      { x1: obstacle.pos_x, y1: obstacle.pos_y, x2: obstacle.pos_x + obstacle.width, y2: obstacle.pos_y },
      { x1: obstacle.pos_x + obstacle.width, y1: obstacle.pos_y, x2: obstacle.pos_x + obstacle.width, y2: obstacle.pos_y + obstacle.height },
      { x1: obstacle.pos_x + obstacle.width, y1: obstacle.pos_y + obstacle.height, x2: obstacle.pos_x, y2: obstacle.pos_y + obstacle.height },
      { x1: obstacle.pos_x, y1: obstacle.pos_y + obstacle.height, x2: obstacle.pos_x, y2: obstacle.pos_y },
    ];

    // Check if any of these lines intersect the line between the pawn and the tile
    return obstacleLines.some(line => doLinesIntersect(startX, startY, endX, endY, line.x1, line.y1, line.x2, line.y2));
  });
};

// Function to check if two line segments intersect
const doLinesIntersect = (x1: number, y1: number, x2: number, y2: number, x3: number, y3: number, x4: number, y4: number) => {
  const det = (x2 - x1) * (y4 - y3) - (y2 - y1) * (x4 - x3);
  if (det === 0) return false; // Lines are parallel

  const lambda = ((y4 - y3) * (x4 - x1) + (x3 - x4) * (y4 - y1)) / det;
  const gamma = ((y1 - y2) * (x4 - x1) + (x2 - x1) * (y4 - y1)) / det;

  return (0 < lambda && lambda < 1) && (0 < gamma && gamma < 1);
};

const drawFog = () => {
  if (!fogGraphicsRef.current) return;

  fogGraphicsRef.current.clear();

  for (let x = 0; x < gridCols; x++) {
    for (let y = 0; y < gridRows; y++) {
      const tileCenterX = x * squareSize + squareSize / 2;
      const tileCenterY = y * squareSize + squareSize / 2;

      const isTileVisible = pawns.some(pawn => {
        const distance = Math.sqrt(
          Math.pow(tileCenterX - pawn.pos_x, 2) + Math.pow(tileCenterY - pawn.pos_y, 2)
        );

        // Check if the tile is within the vision radius and unobstructed by obstacles
        return distance <= visionRadius && !isTileBlockedByObstacle(pawn.pos_x, pawn.pos_y, tileCenterX, tileCenterY);
      });

      if (!isTileVisible) {
        fogGraphicsRef.current.beginFill(0x000000, 0.9);
        fogGraphicsRef.current.drawRect(x * squareSize, y * squareSize, squareSize, squareSize);
        fogGraphicsRef.current.endFill();
      }
    }
  }
};

  

  return (
      <Box
          onWheel={handleWheel}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          sx={{ 
              overflow: 'visible',
              position: 'relative', 
              width: '100vw', 
              height: '100vh', 
              cursor: isDragging ? 'grabbing' : isOverPawn ? 'grab' : 'default',
              display: 'flex',
              justifyContent: "flex-start",
              flexDirection: "row",
              alignItems: "center",
          }}
      >
      <Paper
      sx={{
          display: 'flex',
          flexDirection: 'column',
          position: 'absolute',
          height: '95vh',
          width: 70,
          zIndex: 10,
          borderRadius: "20px",
          backgroundColor: 'rgba(130, 255, 255, 0.3)',
          backdropFilter: 'blur(5px)',
          alignItems: 'center',
          justifyContent: 'space-between',
          paddingY: 2
      }}
      >
        {layer === 'token' && (
          <Button onClick={openAddPawnDialog} variant='outlined' sx={{
            height: 50,
            width: 50,
          }}>
            <PersonAddIcon/>
          </Button>
        )}

        {layer === 'obstacle' && (
          <ButtonGroup>
            <Button onClick={openObstacleDialog} variant='outlined'>
              
            </Button>
          </ButtonGroup>
        )}

        {layer === 'map' && (
          <ButtonGroup>

          </ButtonGroup>
        )}
      <Box
      sx={{
        width: 50,
        marginBottom: 2,
        display: 'flex',
        flexDirection: 'column',
        gap: 1
      }}>
        
        <ToggleButtonGroup
          orientation='vertical'
          color='primary'
          value={layer}
          exclusive
          onChange={handleLayer}
        >
          <ToggleButton value='token' aria-label='token layer'>
            <PersonIcon/>
          </ToggleButton>
          <ToggleButton value='obstacle' aria-label='obstacle layer'>
            <LandscapeIcon/>
          </ToggleButton>
          <ToggleButton value='map' aria-label='map layer'>
            <MapIcon/>
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>
        
      </Paper>

      <Dialog open={addPawnDialogOpen} onClose={closeAddPawnDialog}>
        <DialogTitle>Add New Pawn</DialogTitle>
        <DialogContent>
            <TextField label="Pawn Name" fullWidth onChange={(e) => handleInputChange('pawn_name', e.target.value)} />
            <TextField label="HP" type="number" fullWidth onChange={(e) => handleInputChange('hit_points', +e.target.value)} />
            <TextField label="Initiative" type="number" fullWidth onChange={(e) => handleInputChange('initiative', +e.target.value)} />
            {/* Add additional fields as needed */}
        </DialogContent>
        <DialogActions>
            <Button onClick={closeAddPawnDialog}>Cancel</Button>
            <Button onClick={addPawn} color="primary">Add Pawn</Button>
        </DialogActions>
      </Dialog>

      <Dialog open={obstacleDialogOpen} onClose={closeObstacleDialog}>
        <DialogTitle>Add Obstacle</DialogTitle>
        <DialogContent>
            <TextField
              label="Width"
              type="number"
              fullWidth
              value={obstacleConfig.width}
              onChange={(e) => handleObstacleConfigChange('width', +e.target.value)}
            />
            <TextField
              label="Height"
              type="number"
              fullWidth
              value={obstacleConfig.height}
              onChange={(e) => handleObstacleConfigChange('height', +e.target.value)}
            />
            <MuiColorInput 
              format='hex' 
              value={obstacleConfig.color} 
              onChange={(color) => handleObstacleConfigChange('color', color)}/>
        </DialogContent>
        <DialogActions>
            <Button onClick={closeObstacleDialog}>Cancel</Button>
            <Button onClick={addObstacle} color="primary">Add</Button>
        </DialogActions>
      </Dialog>
      <Box
      sx={{
        flex: 1,
        overflow: 'hidden',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        position: 'relative',
        zIndex: 1,
      }}>
        <Stage 
        width={1920} 
        height={1080} 
        ref={stageRef} 
        
        options={{ background: 0xffffff }}>
            <Container
            scale={zoom} 
            pivot={pivot}
            position={position}
            >

            < Graphics draw={drawGrid} />
            

            {obstacles.map((obstacle, index) => (
              <Graphics
                  key={index}
                  draw={(g) => {
                      g.clear();
                      g.beginFill(obstacle.color);
                      g.drawRect(obstacle.pos_x, obstacle.pos_y, obstacle.width, obstacle.height);
                      g.endFill();
                  }}
                  interactive
                  pointerdown={(event) => startDraggingObstacle(event, index)}
                  pointermove={(event) => dragObstacle(event, index)}
                  pointerup={() => stopDraggingObstacle(index)}
                  pointerupoutside={() => stopDraggingObstacle(index)}
              />
            ))}
            
            {pawns.map((pawn, index) => (
                        <Container
                        key={index}
                        x={pawn.pos_x}
                        y={pawn.pos_y}
                        hitArea= {
                          pawn.isDragging
                            ? new Rectangle(-250, -250, squareSize + 500, squareSize + 500)
                            : new Rectangle(0, 0, pawn.dimension_x, pawn.dimension_y) 
                        }
                        interactive
                        pointerdown={(event) => startDraggingPawn(event, index)}
                        pointermove={(event) => dragPawn(event, index)}
                        pointerup={() => stopDraggingPawn(index)}
                        pointerupoutside={() => stopDraggingPawn(index)}
                        pointerover={() => {
                          setIsOverPawn(true);
                          setHoveredPawnIndex(index);
                        }}
                        pointerout={() => {
                          setIsOverPawn(false);
                          setHoveredPawnIndex(null);
                        }}
                      >
                        <Sprite
                          image={'https://pixijs.io/pixi-react/img/bunny.png'}
                          width={pawn.dimension_x}
                          height={pawn.dimension_y}
                          
                        />
                      </Container>
                    ))}
                    <Graphics ref={fogGraphicsRef} />
            </Container>
        </Stage>
      </Box>
      <Paper sx={{ width: '15vw', height: '100vh', overflow: 'hidden', zIndex: 10, }}>
        {hoveredPawnIndex !== null && (
                <Paper sx={{ width: '100vw', height: '20vh', padding: 2, overflowY: 'auto', zIndex: 10, }}>
                    <Typography variant="h6">{pawns[hoveredPawnIndex].pawn_name} Statistics</Typography>
                    <Typography variant="body1">HP: {pawns[hoveredPawnIndex].hit_points}</Typography>
                    <Typography variant="body1">Initiative: {pawns[hoveredPawnIndex].initiative}</Typography>
                    <Typography variant="body1">AC: {pawns[hoveredPawnIndex].armor_class}</Typography>
                    <Typography variant="body1">Attack Bonus: {pawns[hoveredPawnIndex].attack_bonus}</Typography>
                    <Typography variant="body1">Damage Bonus: {pawns[hoveredPawnIndex].damage_bonus}</Typography>
                </Paper>
        )}
      </Paper>

    </Box>
  );
};

export default GameMap;