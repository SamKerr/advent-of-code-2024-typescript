import { requestInput } from '$src/lib/http';

type Level = number[];
type Report = Level[];

function parseReport(input: string): Report {
    return input
        .split('\n')
        .filter((line) => line.length > 0)
        .map((line) => line.split(' ').map(Number));
}

function isBetween(
    value: number,
    lowerBound: number,
    upperBound: number
): boolean {
    return lowerBound <= value && value <= upperBound;
}

function isSteadilyIncreasing(level: Level): boolean {
    return level.every(
        (num, index, arr) =>
            index === 0 || isBetween(num - arr[index - 1], 1, 3)
    );
}

function isSteadilyDecreasing(level: Level): boolean {
    return level.every(
        (num, index, arr) =>
            index === 0 || isBetween(arr[index - 1] - num, 1, 3)
    );
}

function solution1(input: string): number {
    const report = parseReport(input);
    return report.reduce(
        (acc, level) =>
            acc +
            (isSteadilyIncreasing(level) || isSteadilyDecreasing(level)
                ? 1
                : 0),
        0
    );
}

function removeIndex<T>(arr: T[], i: number): T[] {
    if (i < 0 || i >= arr.length) {
        throw new Error('Index out of bounds');
    }
    return [...arr.slice(0, i), ...arr.slice(i + 1)];
}

function isSteadilyIncreasingWithRemoval(level: Level): boolean {
    if (isSteadilyIncreasing(level)) return true;
    return Array.from(level).some((_, i) =>
        isSteadilyIncreasing(removeIndex(level, i))
    );
}

function isSteadilyDecreasingWithRemoval(level: Level): boolean {
    if (isSteadilyDecreasing(level)) return true;
    return Array.from(level).some((_, i) =>
        isSteadilyDecreasing(removeIndex(level, i))
    );
}

function solution2(input: string): number {
    const report = parseReport(input);
    return report.reduce(
        (acc, level) =>
            acc +
            (isSteadilyIncreasingWithRemoval(level) ||
            isSteadilyDecreasingWithRemoval(level)
                ? 1
                : 0),
        0
    );
}

const rawInput = await requestInput(8);
console.log(solution1(rawInput));
console.log(solution2(rawInput));
