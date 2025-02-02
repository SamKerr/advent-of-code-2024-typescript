import { requestInput } from '$src/lib/http';

class WordSearchSolver {
    private input: string[][];

    constructor(input: string) {
        this.input = input.split('\n').map((row) => row.split(''));
    }

    searchForTarget(
        grid: string[][],
        patterns: Record<string, number[][]>,
        targets: string[]
    ): number {
        let count = 0;
        for (const [y, row] of grid.entries()) {
            for (const [x, _] of row.entries()) {
                for (const [_, deltaArr] of Object.values(patterns).entries()) {
                    let section = '';
                    let outOfBounds = false;
                    for (const [_, [dy, dx]] of deltaArr.entries()) {
                        const nextChar = this.input?.[y + dy]?.[x + dx];
                        if (!nextChar) outOfBounds = true;
                        section += nextChar;
                    }
                    if (!outOfBounds && targets.includes(section)) {
                        count += 1;
                    }
                }
            }
        }
        return count;
    }

    part1(): number {
        const targets = ['XMAS'];
        const deltas = {
            up: [
                [0, 0],
                [1, 0],
                [2, 0],
                [3, 0],
            ],
            down: [
                [0, 0],
                [-1, 0],
                [-2, 0],
                [-3, 0],
            ],
            right: [
                [0, 0],
                [0, 1],
                [0, 2],
                [0, 3],
            ],
            left: [
                [0, 0],
                [0, -1],
                [0, -2],
                [0, -3],
            ],
            diagTopLeft: [
                [0, 0],
                [-1, -1],
                [-2, -2],
                [-3, -3],
            ],
            diagTopRight: [
                [0, 0],
                [-1, 1],
                [-2, 2],
                [-3, 3],
            ],
            diagBottomLeft: [
                [0, 0],
                [1, -1],
                [2, -2],
                [3, -3],
            ],
            diagBottomRight: [
                [0, 0],
                [1, 1],
                [2, 2],
                [3, 3],
            ],
        };

        return this.searchForTarget(this.input, deltas, targets);
    }

    part2(): number {
        const targets = ['MASMAS', 'SAMSAM', 'MASSAM', 'SAMMAS'];
        const deltas = {
            'x-mas': [
                [-1, -1],
                [0, 0],
                [1, 1],
                [1, -1],
                [0, 0],
                [-1, 1],
            ],
        };
        return this.searchForTarget(this.input, deltas, targets);
    }
}

const input = await requestInput(4);
const solver = new WordSearchSolver(input);
console.log(solver.part1());
console.log(solver.part2());
