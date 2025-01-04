import { requestInput } from '$src/utils/http';

const ROBOT = '@';
const SPACE = '.';
const BOX = 'O';
const WALL = '#';

// PART 2
const LEFT_BOX = '[';
const RIGHT_BOX = ']';

const UP = '^';
const RIGHT = '>';
const DOWN = 'v';
const LEFT = '<';
// robot exits, grid exists, commands exist, lets simulate!
const commandToDir = {
    [UP]: [0, -1],
    [RIGHT]: [1, 0],
    [DOWN]: [0, 1],
    [LEFT]: [-1, 0],
};

// extensions, how to cover the common cases faster
// does it work for extremely large datasets
// for each line, sub-sample down the points on the line
// for each line
// find the points unique to that line
// order them by distance from centre of bounding box of all verticies
// put label in either top left, top right, bottom left, bottom right
// label should not cover another line, label is 50px tall and 100px wide -> process the screen into buckets of 25x25, check all buckets for a given label for fast filtering

function simulateRobotMovement(grid, currPos, dir, command): number[] {
    // check if the square robot is trying to move to is free, it it is, return true
    const [currX, currY] = currPos;
    const targetX = currX + dir[0];
    const targetY = currY + dir[1];
    if (grid[targetY][targetX] === SPACE) {
        //can move into space
        grid[currY][currX] = SPACE;
        grid[targetY][targetX] = ROBOT;
        return [targetX, targetY];
    } else if (grid[targetY][targetX] === WALL) {
        // cant move through wall
        return currPos;
    } else {
        // try push boxes!
        let x = targetX;
        let y = targetY;
        while (grid[y][x] != SPACE && grid[y][x] != WALL) {
            x += dir[0];
            y += dir[1];
        }
        if (grid[y][x] === WALL) {
            return currPos;
        } else {
            // push all the boxes forward by one, and robot
            // only the tails need to be updated, not intermediate nodes
            grid[y][x] = BOX; // box pushed forward
            grid[currY][currX] = SPACE; // space left behind by robot
            grid[targetY][targetX] = ROBOT; // new space occupied by robot
            return [targetX, targetY];
        }
    }
}

function simulateRobotMovementPart2(grid, currPos, dir, command): number[] {
    // check if the square robot is trying to move to is free, it it is, return true
    const [currX, currY] = currPos;
    const targetX = currX + dir[0];
    const targetY = currY + dir[1];
    if (grid[targetY][targetX] === SPACE) {
        //can move into space
        grid[currY][currX] = SPACE;
        grid[targetY][targetX] = ROBOT;
        return [targetX, targetY];
    } else if (grid[targetY][targetX] === WALL) {
        // cant move through wall
        return currPos;
    } else {
        if (command === LEFT || command === RIGHT) {
            // try push boxes!
            let x = targetX;
            let y = targetY;
            while (grid[y][x] != SPACE && grid[y][x] != WALL) {
                x += dir[0];
                y += dir[1];
            }

            if (grid[y][x] === WALL) {
                return currPos;
            } else {
                // we need to update all intermediate nodes
                while (x != currX) {
                    const dx = command === RIGHT ? 1 : -1;
                    grid[y][x] = grid[y][x - dx];
                    x = x - dx;
                }
                grid[currY][currX] = SPACE;
                return [targetX, targetY];
            }
        } else {
            // this bit is tricky
            // returns true if a robot starting at pos can move in direction dir
            function canMoveDFS(pos): boolean {
                const [x, y] = pos;
                const cell = grid[y][x];
                if (cell === SPACE) {
                    return true;
                } else if (cell === WALL) {
                    return false;
                } else if (cell === ROBOT) {
                    return canMoveDFS([x + dir[0], y + dir[1]]);
                } else if (cell === LEFT_BOX || cell === RIGHT_BOX) {
                    const dx = cell === LEFT_BOX ? 1 : -1;
                    return (
                        canMoveDFS([x + dir[0], y + dir[1]]) &&
                        canMoveDFS([x + dx + dir[0], y + dir[1]])
                    );
                }
            }
            const canMove = canMoveDFS([currX, currY]);

            // moves a robot, and any objects it needs to, in direction dir
            // quite tricky since boxes can form a tree that all need moving
            function moveDFS(pos, horizontalCarry = false) {
                const [x, y] = pos;
                const cell = grid[y][x];
                const fromCell = grid[y - dir[1]][x];
                if (cell === SPACE) {
                    // base case, when we reach space we fill it and clear where we came from
                    grid[y][x] = fromCell;
                    grid[y - dir[1]][x] = SPACE;
                } else if (cell === WALL) {
                    throw new Error(
                        'failed to move, even after checking if we can...'
                    );
                } else if (cell === ROBOT) {
                    // since the base case is to "drag" the data from space into space, we can just call the recursive case
                    moveDFS([x + dir[0], y + dir[1]]);
                } else if (cell === LEFT_BOX || cell === RIGHT_BOX) {
                    // a box needs to know if its being moved because its attached horizontally to another part of a box, or being pushed from below
                    // difference is neccesary since if carried from the side, we dont need to drag data up into where the box is
                    if (horizontalCarry) {
                        moveDFS([x + dir[0], y + dir[1]]);
                    } else {
                        const dx = cell === LEFT_BOX ? 1 : -1;
                        moveDFS([x + dir[0], y + dir[1]]);
                        moveDFS([x + dx, y], true);
                        grid[y][x] = fromCell;
                        grid[y - dir[1]][x] = SPACE;
                    }
                }
            }
            if (canMove) {
                moveDFS([currX, currY]);
                grid[currY][currX] = SPACE;
                return [targetX, targetY];
            } else {
                return [currX, currY];
            }
        }
    }
}

function part1(input: string): number {
    // input =
    // '########\n#..O.O.#\n##@.O..#\n#...O..#\n#.#.O..#\n#...O..#\n#......#\n########\n\n<^^>>>vv<v>>v<<';
    let tempGrid = input.split('\n');
    const cutoff = tempGrid.findIndex((s) => s.length == 0);
    tempGrid = tempGrid.filter((_, i) => i < cutoff);
    const grid = tempGrid.map((s) => s.split(''));

    const commands = input
        .split('\n')
        .filter((_, i) => i > cutoff)
        .join('')
        .split('')
        .filter((x) => x.length > 0);
    let currX;
    let currY;
    for (const [y, row] of grid.entries()) {
        for (const [x, cell] of row.entries()) {
            if (cell === ROBOT) {
                currX = x;
                currY = y;
            }
        }
    }
    if (currX === undefined || currY === undefined) {
        throw new Error('couldnt find robot!');
    }

    for (const [n, command] of commands.entries()) {
        // display out state
        console.log('###########################');
        console.log(`n:${n}, command:${command}`);
        console.log('###########################');
        for (const row of grid) {
            console.log(row.join(''));
        }
        let dir = commandToDir[command];
        let [newX, newY] = simulateRobotMovement(
            grid,
            [currX, currY],
            dir,
            command
        );
        currX = newX;
        currY = newY;
    }

    let GPS = 0;
    for (const [y, row] of grid.entries()) {
        for (const [x, cell] of row.entries()) {
            if (cell === 'O') {
                GPS += 100 * y + x;
            }
        }
    }
    return GPS;
}

function part2(input: string): number {
    // input =
    // '########\n#..O.O.#\n##@.O..#\n#...O..#\n#.#.O..#\n#...O..#\n#......#\n########\n\n<^^>>>vv<v>>v<<';
    let tempGrid = input.split('\n');
    const cutoff = tempGrid.findIndex((s) => s.length == 0);
    tempGrid = tempGrid.filter((_, i) => i < cutoff);
    let g2 = tempGrid.map((s) => s.split(''));
    const grid = g2.map((row) =>
        row
            .map((s) => {
                if (s === ROBOT) {
                    return [ROBOT, SPACE];
                } else if (s === SPACE) {
                    return [SPACE, SPACE];
                } else if (s === BOX) {
                    return [LEFT_BOX, RIGHT_BOX];
                } else if (s === WALL) {
                    return [WALL, WALL];
                }
            })
            .flat()
    );

    const commands = input
        .split('\n')
        .filter((_, i) => i > cutoff)
        .join('')
        .split('')
        .filter((x) => x.length > 0);
    let currX;
    let currY;
    for (const [y, row] of grid.entries()) {
        for (const [x, cell] of row.entries()) {
            if (cell === ROBOT) {
                currX = x;
                currY = y;
            }
        }
    }
    if (currX === undefined || currY === undefined) {
        throw new Error('couldnt find robot!');
    }

    for (const [n, command] of commands.entries()) {
        // display out state
        // console.log('###########################');
        // console.log(`n:${n}, command:${command}`);
        // console.log('###########################');
        // for (const row of grid) {
        //     console.log(row.join(''));
        // }
        let dir = commandToDir[command];
        let [newX, newY] = simulateRobotMovementPart2(
            grid,
            [currX, currY],
            dir,
            command
        );
        currX = newX;
        currY = newY;
    }

    let GPS = 0;
    for (const [y, row] of grid.entries()) {
        for (const [x, cell] of row.entries()) {
            if (cell === LEFT_BOX) {
                GPS += 100 * y + x;
            }
        }
    }
    return GPS;
}

const DAY_NUMBER = 15;
const rawInput = await requestInput(DAY_NUMBER);
console.log(part1(rawInput));
console.log(part2(rawInput));
