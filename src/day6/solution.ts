import { requestInput } from '$src/utils/http';

type Cell = '.' | '#' | '^' | '>' | '<' | 'v' | 'O';
type Direction = 'UP' | 'RIGHT' | 'DOWN' | 'LEFT';
type GuardMap = {
    grid: Cell[][];
    startingPosition: [number, number];
    direction: Direction;
};

class LoopFoundError extends Error {
    constructor() {
        super('Loop Found');
        this.name = 'LoopFoundError'; // Optional, identifies the error type
    }
}

const processInput = (input: string) => {
    const inputArr = input.split('\n').map((arr) => arr.split(''));
    let startingPosition;

    // find starting position
    for (const [y, row] of inputArr.entries()) {
        for (const [x, c] of row.entries()) {
            if (c === '^') startingPosition = [y, x];
        }
    }

    // sanitize input
    if (!startingPosition) throw new Error('Did not find starting position');
    if (
        !inputArr.every((row) =>
            row.every((cell) => cell === '.' || cell === '#' || cell === '^')
        )
    ) {
        throw new Error(
            'Invalid grid, contains characters other than . # and ^'
        );
    }

    // construct GuardMap
    const guardMap: GuardMap = {
        grid: inputArr as Cell[][],
        startingPosition: startingPosition,
        direction: 'UP',
    };
    return guardMap;
};

function simulateGuardMovement({
    grid,
    direction,
    startingPosition,
}: GuardMap): Set<string> {
    // A guard has a position and a direction
    // he rotates 90 degrees clockwise when directly infront of him is an obstacle
    // otherwise he steps forward
    // onces hes left the grid, we return the set of coords he visited
    const mapHeight = grid.length;
    const mapWidth = grid[0].length;
    let visitedStates = new Set([
        JSON.stringify([startingPosition, direction]),
    ]);
    let visitedCells = new Set([JSON.stringify(startingPosition)]);
    let [currY, currX] = startingPosition;
    let currDirection: Direction = direction;

    const isInBounds = ([y, x]) =>
        y >= 0 && y < mapHeight && x >= 0 && x < mapWidth;
    const isOutOfBounds = ([y, x]) => !isInBounds([y, x]);
    const isObstacle = ([y, x]) => grid[y][x] === '#';
    const getNextDirection = (dir: Direction): Direction => {
        switch (dir) {
            case 'UP':
                return 'RIGHT';
            case 'RIGHT':
                return 'DOWN';
            case 'DOWN':
                return 'LEFT';
            case 'LEFT':
                return 'UP';
        }
    };

    const simulateLookStepLog = ([nextY, nextX]): Boolean => {
        if (isOutOfBounds([nextY, nextX])) {
            return true;
        } else if (isObstacle([nextY, nextX])) {
            currDirection = getNextDirection(currDirection);
        } else {
            currY = nextY;
            currX = nextX;
            let currState = JSON.stringify([[currY, currX], currDirection]);
            if (visitedStates.has(currState)) {
                throw new LoopFoundError();
            } else {
                visitedStates.add(currState);
                visitedCells.add(JSON.stringify([currY, currX]));
            }
        }
        return false;
    };

    let isFinished;
    while (isInBounds([currY, currX])) {
        switch (currDirection) {
            case 'UP':
                isFinished = simulateLookStepLog([currY - 1, currX]);
                if (isFinished) return visitedCells;
                break;
            case 'RIGHT':
                isFinished = simulateLookStepLog([currY, currX + 1]);
                if (isFinished) return visitedCells;
                break;
            case 'DOWN':
                isFinished = simulateLookStepLog([currY + 1, currX]);
                if (isFinished) return visitedCells;
                break;
            case 'LEFT':
                isFinished = simulateLookStepLog([currY, currX - 1]);
                if (isFinished) return visitedCells;
                break;
        }
    }

    throw new Error('Exited while loop without finding solution');
}

function countPotentialLoopPoints(
    { grid, direction, startingPosition }: GuardMap,
    guardPath: Set<string>
) {
    // for each of the squares the guard will visit,
    // simulates the guards path if an obstacle was there
    // and count how many times this causes a loop
    let loopPositionsCounter = 0;
    guardPath.forEach((encodedCoords) => {
        const [y, x] = JSON.parse(encodedCoords);
        if (y === startingPosition[0] && x === startingPosition[1]) {
            return; // return in .forEach does nothing, its a no-op, using it as continue is invalid
        }
        const tempMap = [...grid.map((row) => [...row])];
        tempMap[y][x] = '#'; // place an obstacle
        try {
            simulateGuardMovement({
                grid: tempMap,
                direction,
                startingPosition,
            });
        } catch (error) {
            if (error instanceof LoopFoundError) {
                loopPositionsCounter += 1;
            } else {
                throw error;
            }
        }
    });
    return loopPositionsCounter;
}

const input = await requestInput(6);
const answer1 = simulateGuardMovement(processInput(input));
const answer2 = countPotentialLoopPoints(processInput(input), answer1);
console.log(answer1.size);
console.log(answer2);
