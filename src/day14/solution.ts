import { requestInput } from '$src/utils/http';
import {
    extractNumbers,
    parseAsIntArray,
    parseAsIntGrid,
    parseAsOneStrArray,
    parseAsStrGrid,
} from '$src/utils/parsing';
import * as fs from 'fs';

type RobotDetails = {
    position: number[];
    direction: number[];
};
function part1(input: string): number {
    // input =
    // 'p=0,4 v=3,-3\np=6,3 v=-1,-3\np=10,3 v=-1,2\np=2,0 v=2,-1\np=0,0 v=1,3\np=3,0 v=-2,-2\np=7,6 v=-1,-3\np=3,0 v=-1,-2\np=9,3 v=2,3\np=7,3 v=-1,2\np=2,4 v=2,-3\np=9,5 v=-3,-3p=2,4 v=2,-3\n';
    const GRID_HEIGHT = 103;
    const GRID_WIDTH = 101;
    const grid: ('.' | Set<number>)[][] = Array.from({
        length: GRID_HEIGHT,
    }).map((_) => Array.from({ length: GRID_WIDTH }).map((_) => '.'));
    // make a mapping from robot id to its vel vector
    // have a grid of either '.' or a list of ids
    const idToVector = new Map();
    for (const [i, row] of input
        .split('\n')
        .filter((r) => r.length > 0)
        .entries()) {
        const [pSection, vSection] = row.split('v=');
        const px = extractNumbers(pSection.split(',')[0]);
        const py = extractNumbers(pSection.split(',')[1]);
        const vx = extractNumbers(vSection.split(',')[0]);
        const vy = extractNumbers(vSection.split(',')[1]);
        idToVector.set(i, [vx, vy]);
        if (grid[py][px] instanceof Set) {
            grid[py][px].add(i);
        } else {
            grid[py][px] = new Set([i]);
        }
    }

    const SECONDS = 10000;
    let output = '';
    for (let i = 1; i <= SECONDS; i++) {
        const seen = new Set();
        for (const [curry, row] of grid.entries()) {
            for (const [currx, cell] of row.entries()) {
                if (cell instanceof Set) {
                    for (const id of cell) {
                        if (seen.has(id)) {
                            continue;
                        }
                        seen.add(id);
                        const [dx, dy] = idToVector.get(id);
                        const newX =
                            currx + dx < 0
                                ? (GRID_WIDTH + currx + dx) % GRID_WIDTH
                                : (currx + dx) % GRID_WIDTH;
                        const newY =
                            curry + dy < 0
                                ? (GRID_HEIGHT + curry + dy) % GRID_HEIGHT
                                : (curry + dy) % GRID_HEIGHT;
                        cell.delete(id);
                        if (cell.size === 0) {
                            grid[curry][currx] = '.';
                        }
                        if (grid[newY][newX] instanceof Set) {
                            grid[newY][newX].add(id);
                        } else {
                            grid[newY][newX] = new Set([id]);
                        }
                    }
                }
            }
        } // end of iterating all cells

        const threshold = grid.some(
            (row) =>
                row.reduce((acc, x) => (x instanceof Set ? acc + 1 : acc), 0) >
                30
        );
        if (threshold) {
            output +=
                '==================================================================================\n';
            output += `blink number: ${i}\n`;
            output +=
                '==================================================================================\n';
            for (const row of grid) {
                output +=
                    row.map((x) => (x instanceof Set ? '#' : '.')).join('') +
                    '\n';
            }
        }
    }
    fs.writeFileSync('./src/day14/patterns.txt', output, 'utf8');

    const quadrantSums = [0, 0, 0, 0];
    const middleX = (GRID_WIDTH - 1) / 2;
    const middleY = (GRID_HEIGHT - 1) / 2;
    for (const [currY, row] of grid.entries()) {
        for (const [currX, cell] of row.entries()) {
            if (cell instanceof Set) {
                const index =
                    currX < middleX && currY < middleY
                        ? 0
                        : currX < middleX && currY > middleY
                          ? 1
                          : currX > middleX && currY < middleY
                            ? 2
                            : currX > middleX && currY > middleY
                              ? 3
                              : null;
                if (index != null) {
                    quadrantSums[index] += cell.size;
                }
            }
        }
    }
    if (quadrantSums.reduce((acc, x) => acc + x, 0) >= idToVector.size) {
        throw new Error('quadrant sums are invalid, overcounted!');
    }
    const out = quadrantSums.reduce((acc, x) => acc * x, 1);
    return out;
}

function part2(input: string): number {
    return 0;
}

const DAY_NUMBER = 14;
const rawInput = await requestInput(DAY_NUMBER);
console.log(part1(rawInput));
console.log(part2(rawInput));
