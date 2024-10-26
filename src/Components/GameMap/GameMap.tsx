import { TextStyle, Graphics as PixiGraphics } from 'pixi.js';
import { Stage, Container, Sprite, Text, Graphics } from '@pixi/react';
import { useRef, useState, useEffect } from 'react';
import { Box, Button, Paper } from '@mui/material';

interface Pawn {
    x: number;
    y: number;
    image: string; // or use the appropriate type based on your image handling
}

const GameMap = () => {
    const bunnyUrl = 'https://pixijs.io/pixi-react/img/bunny.png';
    const containerRef = useRef<HTMLDivElement | null>(null);
    const [isDragging, setIsDragging] = useState(false);
    const [startDrag, setStartDrag] = useState({ x: 0, y: 0 });
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [pawns, setPawns] = useState<Pawn[]>([]);
    const [zoom, setZoom] = useState(1);
    const [pivot, setPivot] = useState({ x: 0, y: 0 });
    const stageRef = useRef<any>(null);
    const gridRows = 30;
    const gridCols = 30;
    const squareSize = 50;

    const handleWheel = (event: React.WheelEvent<HTMLDivElement>) => {
        event.preventDefault();
        const zoomFactor = 0.1; // Define how much to zoom
        const newScale = Math.max(0.1, zoom + (event.deltaY > 0 ? -zoomFactor : zoomFactor));
        const rect = event.currentTarget.getBoundingClientRect();
        const mouseX = event.clientX - rect.left;
        const mouseY = event.clientY - rect.top;
        setPivot({ x: mouseX, y: mouseY });
        setZoom(newScale);
    };

    const addPawn = () => {
        const newPawn = {
            id: pawns.length + 1,
            x: Math.random() * 1000,
            y: Math.random() * 500,
            image: bunnyUrl,
        };
        setPawns([...pawns, newPawn]);
    }

    const handleMouseDown = (event: React.MouseEvent<HTMLDivElement>) => {
        setIsDragging(true);
        setStartDrag({ x: event.clientX - position.x, y: event.clientY - position.y });
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
                cursor: isDragging ? 'grabbing' : 'grab',
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
            width: '10vw'
        }}
        >
            <Button>sefsf</Button>
        </Paper>

        <Stage width={1920} height={1080} ref={stageRef} options={{ background: 0xffffff }}>
            <Container
            scale={zoom} 
            pivot={pivot}
            position={position}
            >

            < Graphics draw={drawGrid} />

            {pawns.map((pawn, index) => (
                        <Sprite key={index} image={pawn.image} x={pawn.x} y={pawn.y} />
                    ))}
            </Container>
        </Stage>
        <Button onClick={addPawn}> Add Pawn</Button>
      </Box>
    );
};

export default GameMap;