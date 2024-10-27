import { Graphics as PixiGraphics, Rectangle } from 'pixi.js';
import { Stage, Container, Sprite, Graphics } from '@pixi/react';
import { useRef, useState } from 'react';
import { Box, Button, Paper } from '@mui/material';

interface Pawn {
    x: number;
    y: number;
    image: string;
    isDragging: boolean;
    startDrag: { x: number; y: number };
    
}

const GameMap = () => {
    const bunnyUrl = 'https://pixijs.io/pixi-react/img/bunny.png';
    const [isDragging, setIsDragging] = useState(false);
    const [startDrag, setStartDrag] = useState({ x: 0, y: 0 });
    const [position, setPosition] = useState({ x: 0, y: 0 });
    const [pawns, setPawns] = useState<Pawn[]>([]);
    const [zoom, setZoom] = useState(1);
    const [isOverPawn, setIsOverPawn] = useState(false);
    const [pivot, setPivot] = useState({ x: 0, y: 0 });
    const stageRef = useRef<any>(null);
    const gridRows = 30;
    const gridCols = 30;
    const squareSize = 50;

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

    const addPawn = () => {
        const newPawn = {
            id: pawns.length + 1,
            x: Math.random() * 1000,
            y: Math.random() * 500,
            image: bunnyUrl,
            isDragging: false,
            startDrag: {x: 0, y: 0},
        };
        setPawns([...pawns, newPawn]);
    }

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
        console.log(zoom);

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
          const { x, y } = pawns[index];

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

                return { ...pawn, x: newX, y: newY };
            }
            return pawn;
        })
    );
      
    };

    const stopDraggingPawn = (index: number) => {
      setPawns((prevPawns) =>
        prevPawns.map((pawn, i) => {
            if (i === index) {
                const { x, y } = snapToGrid(pawn.x, pawn.y);
                return { ...pawn, isDragging: false, x, y };
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
            width: '10vw'
        }}
        >
            <Button onClick={addPawn}>sefsf</Button>
        </Paper>

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
                        <Sprite 
                        hitArea={pawn.isDragging 
                          ? new Rectangle(-250, -250, squareSize + 500, squareSize + 500)
                          : new Rectangle(0, 0, squareSize, squareSize)
                        }
                        key={index} 
                        image={pawn.image} 
                        x={pawn.x} 
                        y={pawn.y}
                        interactive
                        pointerdown={(event) => startDraggingPawn(event, index)}
                        pointermove={(event) => dragPawn(event, index)}
                        pointerup={() => stopDraggingPawn(index)}
                        pointerupoutside={() => stopDraggingPawn(index)}
                        pointerover={() => {setIsOverPawn(true); console.log("Pointer is over pawn");} }
                        pointerout={() => {setIsOverPawn(false); console.log("Pointer left pawn");}} />
                    ))}
            </Container>
        </Stage>
      </Box>
    );
};

export default GameMap;