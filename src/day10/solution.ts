import { requestInput } from '$src/utils/http';

function countTrailheads(
    grid,
    y,
    x,
    target,
    seen: Set<string>,
    isPart1: boolean
) {
    const value = grid?.[y]?.[x];
    const key = `${y},${x}`;
    if (target > 9 || value !== target || value === undefined) {
        return 0;
    } else if (value === target && target === 9 && isPart1 && !seen.has(key)) {
        // part 1 wants to count all unique 9s reachable
        seen.add(key);
        return 1;
    } else if (value === target && target === 9 && !isPart1) {
        // part 2 wants to count all paths, so dont care if the 9 was seen before
        return 1;
    } else {
        // If its part 2, we count all the paths, so we can remove the check for if we have seen that 9 before
        return (
            countTrailheads(grid, y + 1, x, target + 1, seen, isPart1) +
            countTrailheads(grid, y - 1, x, target + 1, seen, isPart1) +
            countTrailheads(grid, y, x + 1, target + 1, seen, isPart1) +
            countTrailheads(grid, y, x - 1, target + 1, seen, isPart1)
        );
    }
}

function solver(input: string, isPart1: boolean): number {
    const grid = input
        .split('\n')
        .filter((arr) => arr.length > 0)
        .map((arr) => arr.split('').map((x) => parseInt(x)));

    let counter = 0;
    for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid[0].length; x++) {
            counter += countTrailheads(grid, y, x, 0, new Set(), isPart1);
        }
    }

    return counter;
}

const rawInput = await requestInput(10);
const part1 = solver(rawInput, true);
const part2 = solver(rawInput, false);
console.log(part1);
console.log(part2);
