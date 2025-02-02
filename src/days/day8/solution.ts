import { requestInput } from '$src/utils/http';

type Grid = string[][];
type Position = [number, number];

const parseInput = (input: string): Grid => {
    return input
        .split('\n')
        .filter((arr) => arr.length > 0)
        .map((arr) => arr.split(''));
};

const antennas = new Set(
    'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789'.split('')
);
const isAnetenna = (s: string): boolean => {
    return s.length === 1 && antennas.has(s);
};

function gcd(a, b) {
    while (b !== 0) {
        let temp = b;
        b = a % b;
        a = temp;
    }
    return a;
}

function solver(grid: Grid, isPart1: boolean): number {
    // make a map from antenna to list of positions
    const antennaToPositions = new Map<string, Position[]>();
    for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid[0].length; x++) {
            const s = grid[y][x];
            if (isAnetenna(s)) {
                const positions = antennaToPositions.get(s) || [];
                positions.push([y, x]);
                antennaToPositions.set(s, positions);
            }
        }
    }
    // initialize copy of grid, as all false
    const antinodesGrid = grid.map((arr) => arr.map((_) => false));
    // for each antenna, for pair of positions
    for (const [s, positions] of antennaToPositions.entries()) {
        for (const [i, position1] of positions.entries()) {
            for (const [j, position2] of positions.entries()) {
                // find the antinodes
                if (i === j) continue;
                const [y1, x1] = position1;
                const [y2, x2] = position2;
                let deltaY = y2 - y1;
                let deltaX = x2 - x1;
                let antinodes = [];
                if (isPart1) {
                    // part1 wanst only 1 antinode in each direction
                    antinodes.push([y1 - deltaY, x1 - deltaX]);
                    antinodes.push([y2 + deltaY, x2 + deltaX]);
                } else {
                    // part2 wants all antinodes in both directions, that are exactly aligned with 2 or more positions
                    // to achieve this, ill minimimize the size of the delta vector using gcd, then use while loops until out of bounds
                    const gcdOfDeltas = gcd(deltaY, deltaX);
                    deltaY = deltaY / gcdOfDeltas;
                    deltaX = deltaX / gcdOfDeltas;
                    // find all antinodes in position2 -> position1 direction
                    let isInBounds = true;
                    let counter = 1;
                    while (isInBounds) {
                        const candidateAntinode = [
                            y1 - counter * deltaY,
                            x1 - counter * deltaX,
                        ];
                        antinodes.push(candidateAntinode);
                        isInBounds =
                            antinodesGrid?.[candidateAntinode[0]]?.[
                                candidateAntinode[1]
                            ] != undefined;
                        counter += 1;
                    }

                    // find all antinodes in position1-> position2 direction
                    isInBounds = true;
                    counter = 1;
                    while (isInBounds) {
                        const candidateAntinode = [
                            y2 + counter * deltaY,
                            x2 + counter * deltaX,
                        ];
                        antinodes.push(candidateAntinode);
                        isInBounds =
                            antinodesGrid?.[candidateAntinode[0]]?.[
                                candidateAntinode[1]
                            ] != undefined;
                        counter += 1;
                    }
                }

                // if antinode is within bounds of map, set antinodeGrid to true
                for (const antinode of antinodes) {
                    if (
                        antinodesGrid?.[antinode[0]]?.[antinode[1]] != undefined
                    ) {
                        antinodesGrid[antinode[0]][antinode[1]] = true;
                    }
                }
            }
        }
    }
    return antinodesGrid.reduce(
        (acc, arr) => acc + arr.reduce((acc, v) => (v ? acc + 1 : acc), 0),
        0
    );
}

const rawInput = await requestInput(8);
const input = parseInput(rawInput);
console.log(solver(input, true));
console.log(solver(input, false));
