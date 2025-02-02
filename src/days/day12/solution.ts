import { requestInput } from '$src/lib/http';

const customDFS = (
    grid: string[][],
    coords: [number, number],
    visited: boolean[][],
    targetValue: string
): [number, number, number] | null => {
    const [y, x] = coords;
    const value = grid?.[y]?.[x];
    if (visited?.[y]?.[x] || value !== targetValue) {
        return null;
    } else {
        visited[y][x] = true;
        const neighbourDFS = [
            customDFS(grid, [y - 1, x], visited, targetValue),
            customDFS(grid, [y + 1, x], visited, targetValue),
            customDFS(grid, [y, x - 1], visited, targetValue),
            customDFS(grid, [y, x + 1], visited, targetValue),
        ].filter((arr) => arr !== null);
        const areaOfCell = 1;
        const neighbourVals = [
            grid?.[y - 1]?.[x], // index 0: up
            grid?.[y + 1]?.[x], // index 1: down
            grid?.[y]?.[x - 1], // index 2: left
            grid?.[y]?.[x + 1], // index 3: right
        ];

        const peremeterOfCell = neighbourVals.reduce(
            (acc, v) => (v !== value ? acc + 1 : acc),
            0
        );
        const totalPerimeter =
            peremeterOfCell +
            neighbourDFS.reduce((acc, [a, p, s]) => acc + p, 0);
        const totalArea =
            areaOfCell + neighbourDFS.reduce((acc, [a, p, s]) => acc + a, 0);

        /*

             X   X
              +-+   
              |C| X X
              + +-+
              |C C| Use corners to count sides
              +-+ +
             X X|C|
                +-+
               X   X

               RRRRX
               RRRRX
               XXRRRX
               XXRXX

        */

        const diagVals = [
            [grid?.[y - 1]?.[x - 1], grid?.[y - 1]?.[x], grid?.[y]?.[x - 1]],
            [grid?.[y - 1]?.[x + 1], grid?.[y - 1]?.[x], grid?.[y]?.[x + 1]],
            [grid?.[y + 1]?.[x - 1], grid?.[y + 1]?.[x], grid?.[y]?.[x - 1]],
            [grid?.[y + 1]?.[x + 1], grid?.[y + 1]?.[x], grid?.[y]?.[x + 1]],
        ];

        // This bit was fairly tricky
        const sidesOfCell = diagVals.reduce(
            (acc, [diagV, d1, d2]) =>
                (diagV !== value &&
                    ((d1 !== value && d2 !== value) ||
                        (d1 === value && d2 === value))) ||
                (diagV === value && d1 !== value && d2 !== value)
                    ? acc + 1
                    : acc,
            0
        );
        const sides =
            sidesOfCell + neighbourDFS.reduce((acc, [a, p, s]) => acc + s, 0);

        return [totalArea, totalPerimeter, sides];
    }
};

const solver = (input: string, part1: boolean): number => {
    const grid = input
        .split('\n')
        .filter((arr) => arr.length > 0)
        .map((arr) => arr.split(''));

    let total = 0;
    const visited = grid.map((arr) => arr.map((_) => false));
    for (let y = 0; y < grid.length; y++) {
        for (let x = 0; x < grid[0].length; x++) {
            const res = customDFS(grid, [y, x], visited, grid[y][x]);
            if (res != null) {
                const [a, p, s] = res;
                total += part1 ? a * p : a * s;
            }
        }
    }
    return total;
};

const rawInput = await requestInput(12);
const example =
    'RRRRIICCFF\nRRRRIICCCF\nVVRRRCCFFF\nVVRCCCJFFF\nVVVVCJJCFE\nVVIVCCJJEE\nVVIIICJJEE\nMIIIIIJJEE\nMIIISIJEEE\nMMMISSJEEE';
// console.log(solver(rawInput, true));
console.log(solver(rawInput, false));
