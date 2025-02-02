import {
    Direction,
    directionNameToVec,
    directions,
    END,
    START,
    WALL,
} from '$src/lib/ClassicalAlgorithms/GraphAlgortihms/Constants';
import { requestInput } from '$src/utils/http';
import { PriorityQueue } from '../../lib/DataStructures/PriorityQueue';

const directionToCost = {
    UP: { LEFT: 1000, RIGHT: 1000, DOWN: 2000, UP: 0 },
    LEFT: { UP: 1000, RIGHT: 2000, DOWN: 1000, LEFT: 0 },
    DOWN: { LEFT: 1000, RIGHT: 1000, UP: 2000, DOWN: 0 },
    RIGHT: { LEFT: 2000, UP: 1000, DOWN: 1000, RIGHT: 0 },
};

const directionToIndex = {
    UP: 0,
    RIGHT: 1,
    DOWN: 2,
    LEFT: 3,
};

function solver(input: string, isPart1: boolean): number {
    // const input1 =
    // '###############\n#.......#....E#\n#.#.###.#.###.#\n#.....#.#...#.#\n#.###.#####.#.#\n#.#.#.......#.#\n#.#.#####.###.#\n#...........#.#\n###.#.#####.#.#\n#...#.....#.#.#\n#.#.#.###.#.#.#\n#.....#...#.#.#\n#.###.#.#.#.#.#\n#S..#.....#...#\n###############';
    // const input2 =
    // '#################\n#...#...#...#..E#\n#.#.#.#.#.#.#.#.#\n#.#.#.#...#...#.#\n#.#.#.#.###.#.#.#\n#...#.#.#.....#.#\n#.#.#.#.#.#####.#\n#.#...#.#.#.....#\n#.#.#####.#.###.#\n#.#.#.......#...#\n#.#.###.#####.###\n#.#.#...#.....#.#\n#.#.#.#####.###.#\n#.#.#.........#.#\n#.#.#.#########.#\n#S#.............#\n#################';
    // input = input2;
    const grid = input
        .split('\n')
        .filter((s) => s.length > 0)
        .map((row) => row.split(''));
    const GRID_HEIGHT = grid.length;
    const GRID_WIDTH = grid[0].length;
    const isValidGridPos = (pos) =>
        pos[0] >= 0 &&
        pos[1] >= 0 &&
        pos[0] < GRID_WIDTH &&
        pos[1] < GRID_HEIGHT;

    // find start pos and end pos
    let startPos;
    let endPos;
    for (const [y, row] of grid.entries()) {
        for (const [x, cell] of row.entries()) {
            if (cell === START) {
                startPos = [x, y];
            } else if (cell === END) {
                endPos = [x, y];
            }
        }
    }

    // we can lookup the lowest cost so far to be in a given (position, direction)
    const visitedCost = grid.map((r) =>
        r.map((x) => [Infinity, Infinity, Infinity, Infinity])
    );

    type State = {
        pos: number[];
        dir: Direction;
        path: number[][];
    };
    const initialState: State = {
        pos: startPos,
        dir: 'RIGHT',
        path: [startPos],
    };
    const initialPoints = 0;

    // USED ONLY FOR PART 2
    // key = `${x},${y}`
    let sharedSetOfPositions = new Set<string>();
    let result: number = -1;

    const pq = new PriorityQueue<State>();
    pq.push([initialPoints, initialState]);
    while (pq.size() > 0) {
        // pop state with lowest cost so far
        const curr = pq.pop();
        const [points, { pos, dir, path }] = curr;

        // if we have already visited this state with a lower cost, or if its a wall, skip
        if (
            visitedCost[pos[1]][pos[0]][directionToIndex[dir]] < points ||
            grid[pos[1]][pos[0]] === WALL ||
            !isValidGridPos(pos)
        ) {
            continue;
        }

        // mark as visited, update cost seen so far
        visitedCost[pos[1]][pos[0]][directionToIndex[dir]] = Math.min(
            points,
            visitedCost[pos[1]][pos[0]][directionToIndex[dir]]
        );

        // check if we have are at the exit, handle part1 and part2
        if (pos[0] === endPos[0] && pos[1] === endPos[1]) {
            if (isPart1 && result === -1) {
                return points;
            } else if (!isPart1 && result === -1) {
                result = points;
            } else if (!isPart1 && points === result) {
                sharedSetOfPositions = new Set([
                    ...sharedSetOfPositions,
                    ...new Set(path.map(([x, y]) => `${x},${y}`)),
                ]);
            } else if (!isPart1 && result !== -1 && points > result) {
                // we have found all optimal paths, so finish searching
                break;
            } else if (!isPart1 && points < result) {
                throw new Error(
                    'Found a better path afrer first valid path via dijsktra, shouldnt ever happen!'
                );
            }
        }

        // try all states reachable from current state
        for (const newDirection of Object.values(directions)) {
            const pointsForTurning = directionToCost[dir][newDirection];
            const pointsForStepping = 1;
            const newPoints = points + pointsForTurning + pointsForStepping;
            const [dx, dy] = directionNameToVec[newDirection];
            const newX = pos[0] + dx;
            const newY = pos[1] + dy;
            // if new state has a lower cost than in visistedCost, add to pq
            if (
                newPoints <
                visitedCost[newY][newX][directionToIndex[newDirection]]
            ) {
                pq.push([
                    newPoints,
                    {
                        pos: [newX, newY],
                        dir: newDirection,
                        path: [...path, [newX, newY]],
                    },
                ]);
            }
        }
    }
    return isPart1 ? -1 : sharedSetOfPositions.size;
}

const DAY_NUMBER = 16;
const rawInput = await requestInput(DAY_NUMBER);
console.log(solver(rawInput, true));
console.log(solver(rawInput, false));
