import { requestInput } from '$src/utils/http';

function zip<T, U>(arr1: T[], arr2: U[]): [T, U][] {
    const length = Math.min(arr1.length, arr2.length);
    const result: [T, U][] = [];
    for (let i = 0; i < length; i++) {
        result.push([arr1[i], arr2[i]]);
    }
    return result;
}

function part1(input: string): number {
    // input =
    // '#####\n.####\n.####\n.####\n.#.#.\n.#...\n.....\n\n#####\n##.##\n.#.##\n...##\n...#.\n...#.\n.....\n\n.....\n#....\n#....\n#...#\n#.#.#\n#.###\n#####\n\n.....\n.....\n#.#..\n###..\n###.#\n###.#\n#####\n\n.....\n.....\n.....\n#....\n#.#..\n#.#.#\n#####';
    const lines = input.split('\n').map((r) => r.split(''));
    let i = 0;
    const locks = [];
    const keys = [];
    while (i < lines.length) {
        const row = lines[i];
        if (row.length === 0) {
            i++;
            continue;
        } else if (row.every((s) => s === '#')) {
            // process Lock
            const schematic = {
                type: 'Lock',
                values: [0, 0, 0, 0, 0],
            };
            const lockRows = Array.from({ length: 7 }).map(
                (_, j) => lines[i + j]
            );
            for (let columnIndex = 0; columnIndex < 5; columnIndex++) {
                let rowIndex = 0;
                while (lockRows[rowIndex][columnIndex] === '#') {
                    rowIndex += 1;
                }
                schematic.values[columnIndex] = rowIndex - 1;
            }
            locks.push(schematic);
        } else if (row.every((s) => s === '.')) {
            // process Key
            const schematic = {
                type: 'Key',
                values: [0, 0, 0, 0, 0],
            };
            const keyRows = Array.from({ length: 7 })
                .map((_, j) => lines[i + j])
                .reverse();
            for (let columnIndex = 0; columnIndex < 5; columnIndex++) {
                let rowIndex = 0;
                while (keyRows[rowIndex][columnIndex] === '#') {
                    rowIndex += 1;
                }
                schematic.values[columnIndex] = rowIndex - 1;
            }
            keys.push(schematic);
        }
        i += 7;
    }

    let count = 0;
    for (const lock of locks) {
        for (const key of keys) {
            if (
                zip<number, number>(lock.values, key.values).every(
                    ([lockPins, keyPins]) => lockPins + keyPins < 6
                )
            ) {
                count += 1;
            }
        }
    }

    return count;
}

function part2(input: string): number {
    // Day 25 part 2 comes for free!
    return 0;
}

const DAY_NUMBER = 25;
const rawInput = await requestInput(DAY_NUMBER);
console.log(part1(rawInput));
console.log(part2(rawInput));
