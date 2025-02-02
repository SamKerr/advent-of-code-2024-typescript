export const START = 'S';
export const END = 'E';
export const WALL = '#';
export const SPACE = '.';

export const directions = {
    UP: 'UP',
    DOWN: 'DOWN',
    LEFT: 'LEFT',
    RIGHT: 'RIGHT',
} as const;
export type Direction = keyof typeof directions;

export const directionNameToVec: Record<Direction, number[]> = {
    UP: [0, -1],
    RIGHT: [1, 0],
    DOWN: [0, 1],
    LEFT: [-1, 0],
};

export const getNewPosFromDirection = (
    position: number[],
    direction: Direction
) => {
    const [dx, dy] = directionNameToVec[direction];
    const newX = position[0] + dx;
    const newY = position[1] + dy;
    return [newX, newY];
};

export const positionIsWall = (position: number[], grid: string[][]) => {
    return grid?.[position?.[1]]?.[position?.[0]] === WALL;
};

export const isValidGridPosition = (pos, grid) =>
    pos[0] >= 0 &&
    pos[1] >= 0 &&
    pos[0] < grid[0].length &&
    pos[1] < grid.length;
