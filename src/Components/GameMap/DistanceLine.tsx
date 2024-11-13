import React, { useState } from 'react';
import { Container, Graphics, Text } from '@pixi/react';
import { FederatedPointerEvent, TextStyle } from 'pixi.js';

type Point = { x: number; y: number };

interface DistanceLineProps {
  gridSize: number;
}

const textStyle = new TextStyle({
  fontSize: 12,
  fill: '#000000',
  align: 'left',
  fontFamily: 'Arial'
});

const DistanceLine: React.FC<DistanceLineProps> = ({ gridSize }) => {
  const [startPoint, setStartPoint] = useState<Point | null>(null);
  const [endPoint, setEndPoint] = useState<Point | null>(null);
  const [distance, setDistance] = useState<number | null>(null);
  const [isDrawing, setIsDrawing] = useState(false);

  const handlePointerDown = (event: FederatedPointerEvent) => {
    const { x, y } = event.global;
    setStartPoint({ x, y });
    setEndPoint({ x, y });
    setIsDrawing(true);
  };

  const handlePointerMove = (event: FederatedPointerEvent) => {
    if (!isDrawing || !startPoint) return;
    
    const { x, y } = event.global;
    setEndPoint({ x, y });
    
    const deltaX = Math.abs(x - startPoint.x);
    const deltaY = Math.abs(y - startPoint.y);
    const distanceInSquares = Math.round(
      Math.sqrt(deltaX ** 2 + deltaY ** 2) / gridSize
    );
    setDistance(distanceInSquares);
  };

  const handlePointerUp = () => {
    setIsDrawing(false);
    if (!startPoint || !endPoint) {
      setStartPoint(null);
      setEndPoint(null);
      setDistance(null);
    }
  };

  return (
    <Container
      interactive
      pointerdown={handlePointerDown}
      pointermove={handlePointerMove}
      pointerup={handlePointerUp}
      pointerupoutside={handlePointerUp}
    >
      {startPoint && endPoint && (
        <>
          <Graphics
            draw={graphics => {
              graphics.clear();
              graphics.lineStyle(2, 0xffd700);
              graphics.moveTo(startPoint.x, startPoint.y);
              graphics.lineTo(endPoint.x, endPoint.y);
              
              if (distance !== null) {
                // Draw background for text
                graphics.lineStyle(0);
                graphics.beginFill(0xffffff, 0.8);
                graphics.drawRect(endPoint.x + 5, endPoint.y - 20, 60, 20);
                graphics.endFill();
              }
            }}
          />
          {distance !== null && (
            <Text
              text={`${distance} sq`}
              x={endPoint.x + 10}
              y={endPoint.y - 15}
              style={textStyle}
            />
          )}
        </>
      )}
    </Container>
  );
};

export default DistanceLine;

