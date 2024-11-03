import { Graphics as PixiGraphics, Rectangle } from 'pixi.js';
import { Stage, Container, Sprite, Graphics } from '@pixi/react';
import { useRef, useState, useEffect } from 'react';
import useWebSocket from 'react-use-websocket'
import { Box, Typography, Button, Paper, Dialog, DialogContent, DialogActions, DialogTitle, TextField } from '@mui/material';

interface Pawn {
    id: string;
    pawn_name: string;
    pos_x: number;
    pos_y: number;
    dimension_x: number;
    dimension_y: number;
    hit_points: number;
    initiative: number;
    attack_bonus: number;
    damage_bonus: number;
    armor_class: number;
    strength: number;
    dexterity: number;
    constitution: number;
    intelligence: number;
    wisdom: number;
    charisma: number;
    speed: number;
    game_id: string | null;
    ai_enabled: boolean;
    player_character: string;
    picture: string;
    isDragging: boolean;
    startDrag: { x: number; y: number };
}

const GameMap = () => {
    const API_URL = '127.0.0.1:8000'

    const thisGameId = localStorage.getItem('gameId')
    const [isDragging, setIsDragging] = useState(false);
    const [startDrag, setStartDrag] = useState({ x: 0, y: 0 });
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [pawns, setPawns] = useState<Pawn[]>([]);
    const [zoom, setZoom] = useState(1);
    const [hoveredPawnIndex, setHoveredPawnIndex] = useState<number | null>(null);
    const [dialogOpen, setDialogOpen] = useState(false);
    const [isOverPawn, setIsOverPawn] = useState(false);
    const [pivot, setPivot] = useState({ x: 0, y: 0 });
    const stageRef = useRef<any>(null);
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
    });
    const gridRows = 30;
    const gridCols = 30;
    const squareSize = 50;
    const socketUrl = `ws://${API_URL}/ws/pawns/${thisGameId}`

    const openDialog = () => setDialogOpen(true);
    const closeDialog = () => setDialogOpen(false);

    const { sendMessage, lastMessage, readyState } = useWebSocket(socketUrl, {
      onOpen: () => console.log('Websocket connection opened'),
      onClose: () => console.log('WebSocket connection closed'),
      onError: (error) => console.error('WebSocket error:', error),
      shouldReconnect: () => true,
    });

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
                      // Update pos_x and pos_y for the pawn with matching id
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
      closeDialog();
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

    const stopDraggingPawn = async (index: number) => {
      setPawns((prevPawns) =>
        prevPawns.map((pawn, i) => {
            if (i === index) {
                const { x, y } = snapToGrid(pawn.pos_x, pawn.pos_y);
                
                const updatePawnPosition = async () => {
                  try {
                    const response = await fetch(`http://${API_URL}/pawns/new-pos/${pawn.id}`, {
                      method: "PATCH",
                      headers: {
                        "Content-Type": "application/json",
                      },
                      body: JSON.stringify({ pos_x: x, pos_y: y }),
                    });
                    if (!response.ok) {
                      throw new Error("Failed to update pawn");
                    }
                  } catch (error) {
                    console.error("Error updating pawn:", error);
                  }
                };
        
                updatePawnPosition();

                return { ...pawn, isDragging: false, pos_x: x, pos_y: y };
            }
            return pawn;
        })
    );
    };

    return (
       <Box
            onWheel={handleWheel}
            onMouseDown={handleMouseDown}
            onMouseMove={handleMouseMove}
            onMouseUp={handleMouseUp}
            sx={{ 
                overflow: 'hidden', 
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
            height: '100vh',
            width: '4vw',
            zIndex: 10,
        }}
        >
            <Button onClick={openDialog} sx={{
              height: "10vh",
            }}> Add Pawn</Button>

          
        </Paper>

        <Dialog open={dialogOpen} onClose={closeDialog}>
                <DialogTitle>Add New Pawn</DialogTitle>
                <DialogContent>
                    <TextField label="Pawn Name" fullWidth onChange={(e) => handleInputChange('pawn_name', e.target.value)} />
                    <TextField label="HP" type="number" fullWidth onChange={(e) => handleInputChange('hit_points', +e.target.value)} />
                    <TextField label="Initiative" type="number" fullWidth onChange={(e) => handleInputChange('initiative', +e.target.value)} />
                    {/* Add additional fields as needed */}
                </DialogContent>
                <DialogActions>
                    <Button onClick={closeDialog}>Cancel</Button>
                    <Button onClick={addPawn} color="primary">Add Pawn</Button>
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