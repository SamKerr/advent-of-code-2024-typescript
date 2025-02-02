import { xor } from '$src/lib/ClassicalAlgorithms/Bitwise/bitwise';
import { requestInput } from '$src/utils/http';

const mix = (a: bigint, b: bigint) => a ^ b;
const prune = (a: bigint): bigint => (a > 0n ? a : -a) % 16777216n;

function part1(input: string): any {
    // input = '1\n10\n100\n2024';
    let secretNumbers = input
        .split('\n')
        .filter((r) => r.length > 0)
        .map((n) => parseInt(n));
    let total = 0n;
    for (let secretNumber of secretNumbers) {
        for (let i = 1; i <= 2000; i++) {
            // a * 64 same as  a <<6
            // a/32 rounded down is same as a>>5
            // a*2024 same as a<<11
            let safeSecret = BigInt(secretNumber);
            safeSecret = prune(mix(safeSecret << 6n, safeSecret));
            safeSecret = prune(mix(safeSecret >> 5n, safeSecret));
            safeSecret = prune(mix(safeSecret << 11n, safeSecret));
            secretNumber = Number(safeSecret);
        }
        total += BigInt(secretNumber);
    }
    return total;
}

function part2(input: string): any {
    // find a sequence of 4 numbers, you use across all monekys, that gives the highest number, given the monkey sells once it sees that change.
    // input = '1\n2\n3\n2024';
    // input = '123\n';
    const NEW_SECRET_NUMBERS_COUNT = 2000;
    // const NEW_SECRET_NUMBERS_COUNT = 10;
    let secretNumbers = input
        .split('\n')
        .filter((r) => r.length > 0)
        .map((n) => parseInt(n));
    const differencesToTotal: Record<string, number> = {};
    const arrayToKey = (arr: number[]) => JSON.stringify(arr);
    for (let secretNumber of secretNumbers) {
        let prevDigit = secretNumber % 10;
        let nextDigit = null;
        let difference = null;
        const differenceArr = [];
        const perSellerArrayToTotal: Record<string, number> = {};
        for (let i = 1; i <= NEW_SECRET_NUMBERS_COUNT; i++) {
            // generate new secret number
            let safeSecret = BigInt(secretNumber);
            safeSecret = prune(mix(safeSecret << 6n, safeSecret));
            safeSecret = prune(mix(safeSecret >> 5n, safeSecret));
            safeSecret = prune(mix(safeSecret << 11n, safeSecret));
            secretNumber = Number(safeSecret);

            // calculate last digit and difference
            nextDigit = secretNumber % 10;
            difference = nextDigit - prevDigit;

            // add new difference to difference array, update array to total mapping
            if (differenceArr.length == 4) {
                differenceArr.shift();
                differenceArr.push(difference);
                if (!perSellerArrayToTotal[arrayToKey(differenceArr)]) {
                    perSellerArrayToTotal[arrayToKey(differenceArr)] =
                        nextDigit;
                }
            } else {
                differenceArr.push(difference);
            }

            // update prevDigit, nextDigit and difference
            prevDigit = nextDigit;
            nextDigit = null;
            difference = null;
        }

        // update global mapping when done with each seller
        for (const [key, val] of Object.entries(perSellerArrayToTotal)) {
            if (differencesToTotal[key]) {
                differencesToTotal[key] += val;
            } else {
                differencesToTotal[key] = val;
            }
        }
    }

    // analyse gloal mapping
    return Math.max(...Object.values(differencesToTotal));
}

const DAY_NUMBER = 22;
const rawInput = await requestInput(DAY_NUMBER);
// console.log(part1(rawInput));
console.log(part2(rawInput));
