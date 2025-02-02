import { requestInput } from '$src/lib/http';

type Puzzle = {
    target: number;
    values: number[];
};
type Operator = (n1: number, n2: number) => number;
const part1Operators: Operator[] = [(n1, n2) => n1 + n2, (n1, n2) => n1 * n2];
const part2Operators: Operator[] = [
    ...part1Operators,
    (n1, n2) => parseInt(String(n1).concat(String(n2))),
];

type MathsPuzzles = Puzzle[];

function parseInput(input: string): MathsPuzzles {
    return input
        .split('\n')
        .filter((row) => row.length > 0)
        .map((row) => {
            return {
                target: parseInt(row.split(':')[0]),
                values: row
                    .split(':')[1]
                    .split(' ')
                    .filter((n) => n.length > 0)
                    .map((n) => parseInt(n)),
            };
        });
}

function canBeSolved(
    { target, values }: Puzzle,
    allowedOperators: Operator[]
): Boolean {
    const possibleEvaluations = values.reduce((evaluations, n2) => {
        if (evaluations.length === 0) {
            return [n2];
        } else {
            return allowedOperators
                .map((op) => evaluations.map((n1) => op(n1, n2)))
                .flat(1);
        }
    }, []);
    return possibleEvaluations.includes(target);
}

function basicCountdownSolver(
    puzzles: MathsPuzzles,
    allowedOperators: Operator[]
): number {
    return puzzles.reduce((acc, puzzle) => {
        if (canBeSolved(puzzle, allowedOperators)) {
            acc += puzzle.target;
        }
        return acc;
    }, 0);
}

const part1 = (puzzles: MathsPuzzles) =>
    basicCountdownSolver(puzzles, part1Operators);
const part2 = (puzzles: MathsPuzzles) =>
    basicCountdownSolver(puzzles, part2Operators);

const input = await requestInput(7);
const puzzles = parseInput(input);
console.log(part1(puzzles));
console.log(part2(puzzles));
