import { Graphics } from 'pixi.js'
import { ObstacleProps, Pawn } from '../types';


    // Helper function to check if a line segment intersects any obstacles
const isTileBlockedByObstacle = (obstacles: ObstacleProps[], startX: number, startY: number, endX: number, endY: number) => {
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

export const drawFog = (
  fogGraphicsRef: Graphics | null,
  gridCols: number,
  gridRows: number,
  squareSize: number,
  pawns: Pawn[],
  obstacles: ObstacleProps[],
  visionRadius: number,
  isFog: boolean
) => {
  if (!fogGraphicsRef) return;

  fogGraphicsRef.clear();
  if (isFog) {
    for (let x = 0; x < gridCols; x++) {
      for (let y = 0; y < gridRows; y++) {
        const tileCenterX = x * squareSize + squareSize / 2;
        const tileCenterY = y * squareSize + squareSize / 2;

        const isTileVisible = pawns.some(pawn => {
          const distance = Math.sqrt(
            Math.pow(tileCenterX - pawn.pos_x, 2) + Math.pow(tileCenterY - pawn.pos_y, 2)
          );

          // Check if the tile is within the vision radius and unobstructed by obstacles
          return distance <= visionRadius && !isTileBlockedByObstacle(obstacles, pawn.pos_x, pawn.pos_y, tileCenterX, tileCenterY);
        });

        if (!isTileVisible) {
          fogGraphicsRef.beginFill(0x000000, 0.9);
          fogGraphicsRef.drawRect(x * squareSize, y * squareSize, squareSize, squareSize);
          fogGraphicsRef.endFill();
        }
      }
    }
 } 
};
