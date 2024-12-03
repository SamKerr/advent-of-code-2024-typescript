import * as fs from "node:fs";
import * as assert from 'assert';

const WINDOWS_NEW_LINE = '\r\n';

function parseInput(input: string): [number[], number[]] {
    const [left, right] = input.split(WINDOWS_NEW_LINE).filter(line => line.length > 0).reduce<number[][]>((acc, line) => {
        const numbersPattern = /^(\d+)\s+(\d+)$/;
        const match = numbersPattern.exec(line);
        if (match) {
            acc[0].push(parseInt(match[1]));
            acc[1].push(parseInt(match[2]));
        }
        return acc;
    }, [[], []])

    assert.ok(left.length === right.length, 'left and right have different length')
    return [left, right];
}


function solution1(input: string) {
    const [left, right] = parseInput(input);
    left.sort((a, b) => a - b);
    right.sort((a, b) => a - b);
    return Array.from({ length: right.length }, (_, i) => Math.abs(left[i] - right[i]))
        .reduce((acc, v) => acc + v, 0);
}

function createCounter(arr: number[]): Map<number, number> {
    const counter = new Map<number, number>();
    arr.forEach(num => counter.set(num, (counter.get(num) || 0) + 1));
    return counter;
}

function solution2(input: string) {
    const [left, right] = parseInput(input);
    const rightCounter = createCounter(right)
    return left.reduce((acc, v) => acc + (v * (rightCounter.get(v) || 0)), 0);
}

const input = fs.readFileSync('./src/day1/input.txt', 'utf8')
console.log(solution1(input));
console.log(solution2(input));