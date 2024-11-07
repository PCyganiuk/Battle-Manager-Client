export interface Pawn {
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
    moved: boolean,
}

export interface ObstacleProps {
    id: string;
    pos_x: number;
    pos_y: number;
    width: number;
    game_id: string;
    height: number;
    color?: number;
    isDragging: boolean;
    startDrag: { x: number; y: number };
}

export interface GameData {
    game_name: string;
    id: string;
    grid_id: number;
    owner_id: string;
    dimension_x: number;
    dimension_y: number;
    current_turn: string;
    initiative_list: { pawn_id: string; initiative: number }[];
    picture: string;
    player_list: string[];
    picture_dimension_x: number | null;
    picture_dimension_y: number | null;
    is_fog: boolean;
}