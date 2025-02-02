import {
    directions,
    END,
    getNewPosFromDirection,
    positionIsWall,
    START,
} from '$src/lib/ClassicalAlgorithms/GraphAlgortihms/Constants';
import { requestInput } from '$src/utils/http';

const posToKey = (pos: number[]) => JSON.stringify(pos);
const keyToPos = (key: string) => JSON.parse(key);

function boundedBFS(grid: string[][], startPos: number[], stepsToTake: number) {
    const queue: {
        position: number[];
        pathChars: string[];
    }[] = [
        {
            position: startPos,
            pathChars: [grid[startPos[1]][startPos[0]]],
        },
    ];
    const possibleCheats = [];
    for (let i = 0; i < stepsToTake; i++) {
        // do a full pass through the queue, depth times
        const qLen = queue.length;
        for (let j = 0; j < qLen; j++) {
            const { position, pathChars } = queue.shift();
            for (const newDirection of Object.values(directions)) {
                const newPosition = getNewPosFromDirection(
                    position,
                    newDirection
                );
                if (!isValidGridPos(grid, newPosition)) {
                    continue;
                }
                queue.push({
                    position: newPosition,
                    pathChars: [
                        ...pathChars,
                        grid[newPosition[1]][newPosition[0]],
                    ],
                });
                if (i > 0) {
                    possibleCheats.push({
                        position: newPosition,
                        pathChars: [
                            ...pathChars,
                            grid[newPosition[1]][newPosition[0]],
                        ],
                    });
                }
            }
        }
    }
    return possibleCheats;
}

function bfs(grid, startPos): Record<string, number> {
    const visitedToDistance: Record<string, number> = {};
    const visited = new Set<string>();
    const queue = [[0, startPos]];
    while (queue.length > 0) {
        const [distance, currPos] = queue.shift();
        const key = posToKey(currPos);
        if (visited.has(key) || positionIsWall(currPos, grid)) {
            continue;
        }
        visited.add(key);
        visitedToDistance[key] = distance;
        for (const newDirection of Object.values(directions)) {
            const newPosition = getNewPosFromDirection(currPos, newDirection);
            if (
                !isValidGridPos(grid, newPosition) ||
                positionIsWall(newPosition, grid)
            ) {
                continue;
            }
            queue.push([distance + 1, newPosition]);
        }
    }
    return visitedToDistance;
}

const isValidGridPos = (grid, pos) =>
    pos[0] >= 0 &&
    pos[1] >= 0 &&
    pos[0] < grid[0].length &&
    pos[1] < grid.length;


function part1(input: string): number {
    // input =
    // '###############\n#...#...#.....#\n#.#.#.#.#.###.#\n#S#...#.#.#...#\n#######.#.#.###\n#######.#.#...#\n#######.#.###.#\n###..E#...#...#\n###.#######.###\n#...###...#...#\n#.#####.#.###.#\n#.#...#.#.#...#\n#.#.#.#.#.#.###\n#...#...#...###\n###############';
    const grid = input
        .split('\n')
        .filter((s) => s.length > 0)
        .map((row) => row.split(''));

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
    // strategy:
    // find the shortest path from the start to every legal square (S -> P)
    // find the shortest path from every single legal square to the end point. (P -> E)
    // for every legal square, consider all squares you could cheat to reach. Then, the time saved for that cheat is S -> P + (1 or 2) + P2 -> E
    const startToAnywhere = grid.map((r) => r.map((c) => 0));
    const bfsFromStart = bfs(grid, startPos);
    for (const [posKey, distance] of Object.entries(bfsFromStart)) {
        const [x, y] = keyToPos(posKey);
        startToAnywhere[y][x] = distance;
    }

    // anywhere to end
    const anywhereToEnd = grid.map((r) => r.map((c) => 0));
    const bfsFromEnd = bfs(grid, endPos);
    for (const [posKey, distance] of Object.entries(bfsFromEnd)) {
        const [x, y] = keyToPos(posKey);
        anywhereToEnd[y][x] = distance;
    }

    // now count all the cheats and work out the time saved
    const distanceWithoutCheating = anywhereToEnd[startPos[1]][startPos[0]];
    let count = 0;
    const differenceToCount = {};
    const cheatStartEnds = new Set<string>();
    for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid[0].length; x++) {
            if (grid[y][x] === '.' || grid[y][x] === 'S') {
                // we can do bfs of depth 3
                const cheatStartPos = [x, y];

                let cheatEnds = boundedBFS(grid, cheatStartPos, 2);
                cheatEnds = cheatEnds.filter(
                    ({ position, pathChars }) =>
                        pathChars[0] !== '#' &&
                        pathChars
                            .slice(1, pathChars.length - 1)
                            .some((c) => c === '#') &&
                        pathChars[2] !== '#'
                );
                // calculate length of total new path
                for (const { position, pathChars } of cheatEnds) {
                    const newTime =
                        startToAnywhere[cheatStartPos[1]][cheatStartPos[0]] +
                        2 +
                        anywhereToEnd[position[1]][position[0]];
                    if (newTime <= distanceWithoutCheating - 100) {
                        const difference = distanceWithoutCheating - newTime;
                        cheatStartEnds.add(
                            JSON.stringify([
                                cheatStartPos,
                                position,
                                difference,
                            ])
                        );
                    }
                }
            }
        }
    }
    return cheatStartEnds.size;
}

function part2(input: string): number {
    // input =
    // '###############\n#...#...#.....#\n#.#.#.#.#.###.#\n#S#...#.#.#...#\n#######.#.#.###\n#######.#.#...#\n#######.#.###.#\n###..E#...#...#\n###.#######.###\n#...###...#...#\n#.#####.#.###.#\n#.#...#.#.#...#\n#.#.#.#.#.#.###\n#...#...#...###\n###############';
    const grid = input
        .split('\n')
        .filter((s) => s.length > 0)
        .map((row) => row.split(''));

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
    // strategy:
    // find the shortest path from the start to every legal square (S -> P)
    // find the shortest path from every single legal square to the end point. (P -> E)
    // for every legal square, consider all squares you could cheat to reach. Then, the time saved for that cheat is S -> P + (1 or 2) + P2 -> E
    const startToAnywhere = grid.map((r) => r.map((c) => 0));
    const bfsFromStart = bfs(grid, startPos);
    for (const [posKey, distance] of Object.entries(bfsFromStart)) {
        const [x, y] = keyToPos(posKey);
        startToAnywhere[y][x] = distance;
    }

    // anywhere to end
    const anywhereToEnd = grid.map((r) => r.map((c) => 0));
    const bfsFromEnd = bfs(grid, endPos);
    for (const [posKey, distance] of Object.entries(bfsFromEnd)) {
        const [x, y] = keyToPos(posKey);
        anywhereToEnd[y][x] = distance;
    }

    // now count all the cheats and work out the time saved
    const distanceWithoutCheating = anywhereToEnd[startPos[1]][startPos[0]];
    const cheatStartEnds = new Set<string>();
    for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid[0].length; x++) {
            if (grid[y][x] === '.' || grid[y][x] === 'S') {
                // BFS too slow for part 2, since its equivilant of 20/20 grid you can reach.
                // Instead can basically pick any point reachable within 20 hops (hamiltonian distance of 20)
                // if its not a valid cheap it wont even save us time so its fine.
                const cheatStartPos = [x, y];
                const MAX_STEPS = 20;
                for (let xDelta = 0; xDelta < MAX_STEPS + 1; xDelta++) {
                    for (let yDelta = 0; yDelta < MAX_STEPS + 1; yDelta++) {
                        const positions = [
                            [x + xDelta, y + yDelta],
                            [x - xDelta, y + yDelta],
                            [x + xDelta, y - yDelta],
                            [x - xDelta, y - yDelta],
                        ];
                        for (const position of positions) {
                            if (
                                xDelta + yDelta <= MAX_STEPS &&
                                isValidGridPos(grid, position) &&
                                (grid[position[1]][position[0]] === '.' ||
                                    grid[position[1]][position[0]] === 'E')
                            ) {
                                const newTime =
                                    startToAnywhere[cheatStartPos[1]][
                                        cheatStartPos[0]
                                    ] +
                                    xDelta +
                                    yDelta +
                                    anywhereToEnd[position[1]][position[0]];
                                if (newTime <= distanceWithoutCheating - 100) {
                                    const difference =
                                        distanceWithoutCheating - newTime;
                                    cheatStartEnds.add(
                                        JSON.stringify([
                                            cheatStartPos,
                                            position,
                                            difference,
                                        ])
                                    );
                                }
                            }
                        }
                    }
                }
            }
        }
    }
    return cheatStartEnds.size;
}

const DAY_NUMBER = 20;
const rawInput = await requestInput(DAY_NUMBER);
console.log(part1(rawInput));
console.log(part2(rawInput));
