import { requestInput } from '$src/lib/http';

class CorruptedMemoryInterpreter {
    private input: string;
    private sumPattern = /mul\((\d{1,3}),(\d{1,3})\)/g;
    private doPattern = /do\(\)/g;
    private dontPattern = /don't\(\)/g;
    private allOpsPattern = /mul\((\d{1,3}),(\d{1,3})\)|do\(\)|don't\(\)/g;

    constructor() {
        this.init();
    }

    async init() {
        this.input = await requestInput(3);
    }

    part1(): number {
        const instructions = [...this.input.matchAll(this.sumPattern)];
        if (!instructions) throw 'No instructions found in input';
        return instructions?.reduce((acc, match) => {
            const operand1 = match[1];
            const operand2 = match[2];
            if (isNaN(parseInt(operand1)) || isNaN(parseInt(operand2)))
                throw `cannot parse numbers ${operand1} ${operand2}`;
            return acc + parseInt(operand1) * parseInt(operand2);
        }, 0);
    }

    part2(): number {
        const instructions = [...this.input.matchAll(this.allOpsPattern)];
        if (!instructions) throw 'No instructions found in input';
        let allOps = true;
        return instructions?.reduce((acc, match) => {
            if (match[0].match(this.sumPattern) && allOps) {
                const operand1 = match[1];
                const operand2 = match[2];
                if (isNaN(parseInt(operand1)) || isNaN(parseInt(operand2)))
                    throw `cannot parse numbers ${operand1} ${operand2}`;
                return acc + parseInt(operand1) * parseInt(operand2);
            } else if (match[0].match(this.doPattern)) {
                allOps = true;
                return acc;
            } else if (match[0].match(this.dontPattern)) {
                allOps = false;
                return acc;
            } else {
                return acc;
            }
        }, 0);
    }
}

const solution = new CorruptedMemoryInterpreter();
console.log(`Solution 1: ${solution.part1()}`);
console.log(`Solution 2: ${solution.part2()}`);
