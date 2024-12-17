import { requestInput } from '$src/utils/http';

const blinkOnStone = (val: string): string[] => {
    if (val[0] === '0' && val.length > 1) {
        throw new Error('stone has leading/ trailing 0s');
    }

    if (val === '0') {
        return ['1'];
    } else if (val.length % 2 === 0) {
        // split into 2 stones, left half of digits go to left stone, right half to right stone, no trailing 0s
        const middleIndex = val.length / 2;
        const left = val.slice(0, middleIndex);
        let right = String(parseInt(val.slice(middleIndex, val.length)));
        return [left, right];
    } else {
        return [String(2024 * parseInt(val))];
    }
};

const dfsCache = {};
const makeCacheKey = (stone, blinksToGo) =>
    JSON.stringify({ stone, blinksToGo });
const dfsCountResultingValues = (stone: string, blinksToGo: number) => {
    const key = makeCacheKey(stone, blinksToGo);
    if (dfsCache[key]) {
        return dfsCache[key];
    } else if (blinksToGo === 0) {
        return 1;
    } else {
        const resultingStones = blinkOnStone(stone);
        const result = resultingStones.reduce(
            (acc, v) => acc + dfsCountResultingValues(v, blinksToGo - 1),
            0
        );
        dfsCache[key] = result;
        return result;
    }
};

const solver = (input: string, blinksToGo: number): number => {
    let stones: string[] = input
        .split('\n')
        .filter((arr) => arr.length > 0)
        .map((s) => s.split(' '))
        .flat();

    let counter = 0;
    for (const stone of stones) {
        counter += dfsCountResultingValues(stone, blinksToGo);
    }
    return counter;
};

const rawInput = await requestInput(11);
const part1 = solver(rawInput, 25);
const part2 = solver(rawInput, 75);
console.log(part1);
console.log(part2);
