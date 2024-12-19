import { Graphics as PixiGraphics, Rectangle,Container as PixiContainer, FederatedPointerEvent } from 'pixi.js';
import { Stage, Container, Sprite, Graphics, Text } from '@pixi/react';
import React, { useRef, useState, useEffect } from 'react';
import useWebSocket from 'react-use-websocket'
import { Box, Button, Dialog, DialogContent, DialogActions, DialogTitle, TextField } from '@mui/material';
import { InitiativeListItem, ObstacleProps, Pawn, Point, textStyle } from '../types.ts';
import { MuiColorInput } from 'mui-color-input';
import { useLocation } from 'react-router-dom';
import { drawFog } from './Fog.ts';
import PawnController from './PawnController.ts';
import RightPanel from './RightPanel.tsx';
import LeftPanel from './LeftPanel.tsx';
//import CloudIcon from '@mui/icons-material/Cloud';

const GameMap = () => {
  const API_URL = 'https://battle-ready-fdfec7b7e9hndgfp.polandcentral-01.azurewebsites.net';
  const location = useLocation();
  const containerRef = useRef<PixiContainer>(null);
  const { game } = location.state || {};
  const [isFog, setIsFog] = useState(game.is_fog);
  const [isDragging, setIsDragging] = useState(false);
  const [startDrag, setStartDrag] = useState({ x: 0, y: 0 });
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [pawns, setPawns] = useState<Pawn[]>([]);
  const [initiativeList, setInitiativeList] = useState<InitiativeListItem[]>(game.initiative_list); // @TODO issue with initiative after web reload
  const [isInitiative, setIsInitiative] = useState(false);
  const [currentTurn, setCurrentTurn] = useState<string>(game.current_turn);
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
  const [selectedPawnIndex, setSelectedPawn] = useState<number | null>(null);
  const [tool, setTool] = useState("token"); 
  const squareSize = 50;
  const pawnController = new PawnController(pawns, obstacles, squareSize, setPawns, setObstacles);
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [endPoint, setEndPoint] = useState<Point | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [obstacleConfig, setObstacleConfig] = useState({
      width: 100,
      height: 100,
      color: 0xff0000,
  });
  const [newPawn, setNewPawn] = useState<Omit<Pawn, 'isDragging' | 'startDrag' | 'pos_x' | 'pos_y'>>({
    id: '',
    pawn_name: '',
    dimension_x: squareSize,
    dimension_y: squareSize,
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
    game_id: game.id,
    ai_enabled: false,
    player_character: '',
    picture: '/assets/smolbartek.png',
    moved: false,
  });
  const gridRows = game.dimension_y;
  const gridCols = game.dimension_x ;
  const socketUrl = `ws://battle-ready-fdfec7b7e9hndgfp.polandcentral-01.azurewebsites.net/ws/pawns/${game.id}`
  
  const visionRadius = 200;

  const closeAddPawnDialog = () => setAddPawnDialogOpen(false);

  const closeObstacleDialog = () => setObstacleDialogOpen(false);

  const { lastMessage } = useWebSocket(socketUrl, {
    onOpen: () => console.log('Websocket connection opened'),
    onClose: () => console.log('WebSocket connection closed'),
    onError: (error) => console.error('WebSocket error:', error),
    shouldReconnect: () => true,
  });

  useEffect(() => {
    const handleContextMenu = (e: MouseEvent) => e.preventDefault()
    document.addEventListener("contextmenu", handleContextMenu)
    return () => document.removeEventListener("contextmenu", handleContextMenu)  
  }, [])

  const handleObstacleConfigChange = (field: keyof typeof obstacleConfig, value: string | number) => {
    setObstacleConfig({ ...obstacleConfig, [field]: value });
  };

  const fetchPawns = async () => {
    try {
        const response = await fetch(`${API_URL}/pawns/${game.id}`);
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

  const fetchObstacles = async () => {
    try {
        const response = await fetch(`${API_URL}/obstacles/${game.id}`);
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        const obstaclesData = await response.json();
        
        console.log(obstaclesData);
        if (obstaclesData){
          setObstacles(obstaclesData);
        }
    } catch (error) {
        console.error('Error fetching obstacles:', error);
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
        renderFog();
        }
        else if(data.event == 'pawn_stat_updated' || data.event == 'pawn_size_changed' && data.data) {
          console.log(data.data);
          const { pawn_id, data: statValueArray } = data;
          const stat = statValueArray[0].stat;
          const value = statValueArray[0].value;
          console.log(stat);
          console.log(value);
          const index = pawns.findIndex(pawn => pawn.id === pawn_id);
          setPawns((prevPawns) => {
            const updatedPawns = [...prevPawns];
            updatedPawns[index] = {
              ...updatedPawns[index],
              [stat]: value,
            };
            return updatedPawns;
          });
        }
        else if (data.event == 'pawn_added_to_initiative' && data.data) {
          console.log(data);
          const parsedData = JSON.parse(data.data);
          const pawn: InitiativeListItem = { name: parsedData.name, initiative: parsedData.initiative, ai_enabled: parsedData.ai_enabled};
          addToInitiative(pawn);
        }
      } catch (error) {
        console.error('Error parsing message:', error);
      }
    }
  }, [lastMessage]);

  useEffect(() => {
    fetchPawns();
    fetchObstacles();
  }, [game.id]);

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

  const addObstacle = async () => {
    const newObstacle: ObstacleProps = {
        id: '',
        pos_x: gridCols * squareSize / 2, // center of the map
        pos_y: gridRows * squareSize / 2, // center of the map
        game_id: game.id,
        width: obstacleConfig.width,
        height: obstacleConfig.height,
        color: obstacleConfig.color,
        isDragging: false,
        startDrag: {x: 0, y: 0},
    };

    const dbObstacle = {
      pos_x: newObstacle.pos_x,
      pos_y: newObstacle.pos_y,
      game_id: game.id,
      width: obstacleConfig.width,
      height: obstacleConfig.height,
      color: obstacleConfig.color
    }
    try {
      const response = await fetch(`${API_URL}/obstacles/add/`, {
          method: 'POST',
          headers: {
              'Content-Type': 'application/json',
          },
          body: JSON.stringify(dbObstacle),
      });

      if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
      }

      const savedObstacle = await response.json();
      const updatedObstacle = { ...newObstacle, id: savedObstacle.id };

      setObstacles((prevObstacles) => [...prevObstacles, updatedObstacle]);
    } catch (error) {
        console.error('Error adding obstacle:', error);
    }
    closeObstacleDialog();
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
      game_id: game.id,
      ai_enabled: false,
      player_character: pawn.player_character,
      picture: pawn.picture,
    }
    //setPawns([...pawns, pawn]);
    console.log(JSON.stringify(dbPawn));
    try {
      const response = await fetch(`${API_URL}/pawns/add/`, {
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
      if (event.button === 1 && tool === 'token') {
        setIsDragging(true);
        setStartDrag({ x: event.clientX - position.x, y: event.clientY - position.y });
      }
      else if (event.button === 1 && tool === 'measure') {

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

  const startPawnAction = (event: any, index: number) => {
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
    else if (event.data.button === 2)
      setSelectedPawn(index);
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
              console.log(pawn)
              const updatePawnPosition = async () => {
                try {
                  const response = await fetch(`${API_URL}/pawns/new-pos/${pawn.id}`, {
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
              renderFog();
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
                  const response = await fetch(`${API_URL}/obstacles/new-pos/${obstacle.id}`, {
                    method: "PATCH",
                    headers: {
                      "Content-Type": "application/json",
                    },
                    body: JSON.stringify({ pos_x: obstacle.pos_x, pos_y: obstacle.pos_y }),
                  });
                  if (!response.ok) {
                    throw new Error("Failed to update pawn");
                  }
                } catch (error) {
                  console.error("Error updating pawn:", error);
                }
              };
              
              updateObstaclePosition();
              renderFog();
              return { ...obstacle, isDragging: false };
          }
          return obstacle;
      })
    );
  };
  const renderFog = () => drawFog(
    fogGraphicsRef.current,
    gridCols,
    gridRows,
    squareSize,
    pawns,
    obstacles,
    visionRadius,
    isFog
  )

  const addToInitiative = (pawn: InitiativeListItem) => {
    if (initiativeList.some((item) => item.name === pawn.name)) {
      console.log("Pawn is already in the initiative list.");
      return;
    }
    setInitiativeList((prevList) => {
      const updatedList = [...prevList, pawn].sort(
        (a, b) => b.initiative - a.initiative
      );
      return updatedList;
    });
  }

  const handlePointerDown = (event: FederatedPointerEvent) => {
    if (containerRef.current) {
      const { x, y } = containerRef.current.toLocal(event.global);
      setStartPoint({ x, y });
      setEndPoint({ x, y });
      setIsDrawing(true);
    }
  };

  const handlePointerMove = (event: FederatedPointerEvent) => {
    if (!isDrawing || !startPoint || !containerRef.current) return;
    
    // Convert global coordinates to container's local coordinates
    const { x, y } = containerRef.current.toLocal(event.global);
    setEndPoint({ x, y });
  
    // Calculate distance in squares
    const deltaX = Math.abs(x - startPoint.x);
    const deltaY = Math.abs(y - startPoint.y);
    const distanceInSquares = Math.round(
      Math.sqrt(deltaX ** 2 + deltaY ** 2) / squareSize
    );
    setDistance(distanceInSquares);
  };
  
  const handlePointerUp = () => {
    setIsDrawing(false);
    // Reset points and distance if drawing was interrupted or completed
    if (!startPoint || !endPoint) {
      setStartPoint(null);
      setEndPoint(null);
      setDistance(null);
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
      <LeftPanel
      layer={layer}
      setLayer={setLayer}
      setAddPawnDialogOpen={setAddPawnDialogOpen}
      setObstacleDialogOpen={setObstacleDialogOpen}
      tool={tool}
      setTool={setTool}
      isInitiative={isInitiative}
      setIsInitiative={setIsInitiative}
      isFog={isFog}
      setIsFog={setIsFog}
      />

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
            ref={containerRef}
            interactive
            pointerdown={(event) => {
              if (tool === 'measure' && layer === 'token')
                handlePointerDown(event)}}
            pointermove={handlePointerMove}
            pointerup={handlePointerUp}
            pointerupoutside={handlePointerUp}
            scale={zoom} 
            pivot={pivot}
            position={position}
            hitArea={new Rectangle(0, 0, squareSize * gridCols, squareSize * gridRows)}
          >
          <Sprite
            image={game.picture}
            width={squareSize * gridCols}
            height={squareSize * gridRows}
          />

            < Graphics draw={drawGrid} />
            

            {obstacles.map((obstacle, index) => (
              <Graphics
                  key={index}
                  hitArea={new Rectangle(obstacle.pos_x, obstacle.pos_y, obstacle.width, obstacle.height)}
                  draw={(g) => {
                      g.clear();
                      g.beginFill(obstacle.color);
                      g.drawRect(obstacle.pos_x, obstacle.pos_y, obstacle.width, obstacle.height);
                      g.endFill();
                  }}
                  interactive
                  pointerdown={(event) => {
                    if (layer === 'obstacle') {
                      event.stopPropagation(); 
                      startDraggingObstacle(event, index)}}}
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
                  : new Rectangle(0, 0, pawn.dimension_x, pawn.dimension_x) 
              }
              interactive
              pointerdown={(event) => {
                if (layer === 'token') {
                  startPawnAction(event, index)}}}
              pointermove={(event) => dragPawn(event, index)}
              pointerup={() => stopDraggingPawn(index)}
              pointerupoutside={() => stopDraggingPawn(index)}
              pointerover={() => {
                if (layer === 'token') {
                setIsOverPawn(true);
                setHoveredPawnIndex(index)};
              }}
              pointerout={() => {
                setIsOverPawn(false);
                setHoveredPawnIndex(null);
              }}
              >
              <Sprite
                image={pawn.picture}
                width={pawn.dimension_x}
                height={pawn.dimension_x}
                
              />
              </Container>
            ))}
            <Graphics interactive hitArea={new Rectangle(0,0,0,0)} draw={renderFog} ref={fogGraphicsRef} />
            {startPoint && endPoint && (
              <>
                <Graphics interactive
                  draw={graphics => {
                    graphics.clear();
                    graphics.lineStyle(4, 0xffd700);
                    graphics.moveTo(startPoint.x, startPoint.y);
                    graphics.lineTo(endPoint.x, endPoint.y);
                    
                    if (distance !== null) {
                      // Draw background for text
                      graphics.lineStyle(0);
                      graphics.beginFill(0xffffff, 0.8);
                      graphics.drawRect(endPoint.x + 5, endPoint.y - 20, 100, 50);
                      graphics.endFill();
                    }
                  }}
                />
                {distance !== null && (
                  <Text
                    text={`${distance * 5} ft`}
                    x={endPoint.x + 10}
                    y={endPoint.y - 15}
                    style={textStyle}
                  />
                )}
              </>
            )}
          </Container>
        </Stage>
      </Box>
      <RightPanel 
        pawns={pawns}
        setPawns={setPawns}
        API_URL={API_URL}
        game={game}
        selectedPawnIndex={selectedPawnIndex}
        initiativeList={initiativeList}
        setInitiativeList={setInitiativeList}
        currentTurn={currentTurn}
        setCurrentTurn={setCurrentTurn}
        isInitiative={isInitiative}
        pawnController={pawnController}
        hoveredPawnIndex={hoveredPawnIndex}
      />
    </Box>
  );
};

export default GameMap;