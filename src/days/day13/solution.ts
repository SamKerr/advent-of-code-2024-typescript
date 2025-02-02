import { requestInput } from '$src/lib/http';
import { extractNumbers } from '$src/lib/parsing';

type Vec2D = number[];
type Matrix2D = number[][];
type Problem = {
    vecA: Vec2D;
    vecB: Vec2D;
    target: Vec2D;
};

function dot(v1: Vec2D, v2: Vec2D): number {
    return v1.map((v, i) => v * v2[i]).reduce((acc, x) => acc + x, 0);
}

function matrixMultply(X: Matrix2D, T: Vec2D): Vec2D {
    return X.map((row) => dot(row as Vec2D, T));
}

function isRoughlyInteger(num, tolerance = 1e-3) {
    return Math.abs(num - Math.round(num)) < tolerance;
}

function parseInput(input: string, isPart1): Problem[] {
    const problems: Problem[] = [];
    let curr = {};
    const rows = input.split('\n');
    for (const row of rows) {
        console.log(row);
        if (row.length === 0) {
            continue;
        } else {
            const vector = row.split(':')[1].split(',').map(extractNumbers);
            if (row.startsWith('Prize')) {
                curr = {
                    ...curr,
                    target: isPart1
                        ? vector
                        : vector.map((v) => v + 10000000000000),
                };
                problems.push(curr as Problem);
            } else if (row.startsWith('Button A:')) {
                curr = {
                    ...curr,
                    vecA: vector,
                };
            } else {
                curr = {
                    ...curr,
                    vecB: vector,
                };
            }
        }
    }
    return problems;
}

function solver(input: string, isPart1: boolean): number {
    const problems = parseInput(input, isPart1);
    let tokenCount = 0;
    for (const { vecA, vecB, target } of problems) {
        // use linear algebra to solve for [vecA, vecB]^(transposed) x N = T, find N
        const [a, c] = vecA;
        const [b, d] = vecB;

        // find det
        const det = a * d - b * c;
        if (det === 0) {
            // no solution is possible for system of equations
            continue;
        }

        // find inverse matrix
        const X_inv = [
            [d, -b],
            [-c, a],
        ].map((arr) => arr.map((v) => v * (1 / det)));

        // use matrix multiplication to find N
        const N = matrixMultply(X_inv, target);
        if (!N.every((v) => isRoughlyInteger(v))) {
            // we only count whole number of vectors
            continue;
        }
        tokenCount += 3 * N[0] + N[1];
    }
    return tokenCount;
}

const rawInput = await requestInput(13);
console.log(solver(rawInput, true));
console.log(solver(rawInput, false));
