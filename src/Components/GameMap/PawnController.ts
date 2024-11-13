import { Pawn, ObstacleProps } from '../types';

type SetPawnsFunction = React.Dispatch<React.SetStateAction<Pawn[]>>;
type SetObstaclesFunction = React.Dispatch<React.SetStateAction<ObstacleProps[]>>;

class PawnController {
  pawns: Pawn[];
  obstacles: ObstacleProps[];
  gridSize: number;
  setPawns: SetPawnsFunction;
  setObstacles: SetObstaclesFunction;

  constructor(
    pawns: Pawn[],
    obstacles: ObstacleProps[],
    gridSize: number,
    setPawns: SetPawnsFunction,
    setObstacles: SetObstaclesFunction
  ) {
    this.pawns = pawns;
    this.obstacles = obstacles;
    this.gridSize = gridSize;
    this.setPawns = setPawns;
    this.setObstacles = setObstacles;
  }

  findNearestTarget(pawn: Pawn): Pawn | null {
    const playerPawns = this.pawns.filter(p => p.player_character && p.id !== pawn.id);

    let nearestTarget: Pawn | null = null;
    let shortestDistance = Infinity;

    for (const playerPawn of playerPawns) {
      const distance = Math.abs(pawn.pos_x - playerPawn.pos_x) + Math.abs(pawn.pos_y - playerPawn.pos_y);
      if (distance < shortestDistance) {
        shortestDistance = distance;
        nearestTarget = playerPawn;
      }
    }

    return nearestTarget;
  }

  isPositionOccupied(x: number, y: number): boolean {
    return (
      this.pawns.some(p => p.pos_x === x && p.pos_y === y) ||
      this.obstacles.some(ob => ob.pos_x <= x && ob.pos_x + ob.width >= x && ob.pos_y <= y && ob.pos_y + ob.height >= y)
    );
  }

  movePawnTowardTarget(pawn: Pawn, target: Pawn): void {
    const deltaX = target.pos_x - pawn.pos_x;
    const deltaY = target.pos_y - pawn.pos_y;
    const stepX = Math.sign(deltaX) * this.gridSize;
    const stepY = Math.sign(deltaY) * this.gridSize;
    let squaresMoved = 0;

    const newPawns = [...this.pawns];

    while (squaresMoved < 6) {
      const newX = pawn.pos_x + (Math.abs(deltaX) > Math.abs(deltaY) ? stepX : 0);
      const newY = pawn.pos_y + (Math.abs(deltaY) > Math.abs(deltaX) ? stepY : 0);

      if (!this.isPositionOccupied(newX, newY)) {
        pawn.pos_x = newX;
        pawn.pos_y = newY;
        squaresMoved++;
      } else {
        break;
      }
    }

    // Update the specific pawn's position in the state
    const updatedPawns = newPawns.map(p => (p.id === pawn.id ? { ...p, pos_x: pawn.pos_x, pos_y: pawn.pos_y } : p));
    this.setPawns(updatedPawns);
  }

  attackIfAdjacent(pawn: Pawn, target: Pawn): void {
    const isAdjacent =
      Math.abs(pawn.pos_x - target.pos_x) <= this.gridSize &&
      Math.abs(pawn.pos_y - target.pos_y) <= this.gridSize;

    if (isAdjacent) {
        const attackRoll = Math.floor(Math.random() * 20) + 1; // Simulate a D20 roll

        console.log(`${pawn.pawn_name} attacks ${target.pawn_name} with a roll of ${attackRoll}`);

        if (attackRoll > target.armor_class) {
            console.log("Hit! Reducing hit points.");
            const updatedPawns = this.pawns.map(p => 
                p.id === target.id ? { ...p, hitPoints: p.hit_points - (pawn.attack_bonus + (Math.floor(Math.random() * 12) + 1)) } : p
            );
            this.setPawns(updatedPawns);
        } else {
            console.log("Missed the attack.");
        }
    }
}

  handleAutoMode(pawn: Pawn): void {
    const target = this.findNearestTarget(pawn);
    if (!target) return;

    this.movePawnTowardTarget(pawn, target);
    this.attackIfAdjacent(pawn, target);
  }
}

export default PawnController;
