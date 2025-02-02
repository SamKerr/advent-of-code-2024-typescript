import { requestInput } from '$src/lib/http';
import {
    extractNumbers,
    parseAsIntArray,
    parseAsIntGrid,
    parseAsOneStrArray,
    parseAsStrGrid,
} from '$src/lib/parsing';

type LogicGate = (a: boolean, b: boolean) => boolean;
type CircuitComponent = {
    leftWire: string;
    rightWire: string;
    gate: LogicGate;
    outputWire: string;
};

function boolsToNumber(wireValues: boolean[]) {
    return parseInt(wireValues.map((value) => Number(value)).join(''), 2);
}

function numberToBoolsArray(number) {
    return [...number.toString(2)].map((s) => (s === '1' ? true : false));
}

function formatTwoDigits(number) {
    return number.toString().padStart(2, '0');
}

function xorBigInt(a, b) {
    // Convert BigInt to binary strings
    const binA = a.toString(2);
    const binB = b.toString(2);

    // Pad the binary strings to the same length
    const maxLength = Math.max(binA.length, binB.length);
    const paddedA = binA.padStart(maxLength, '0');
    const paddedB = binB.padStart(maxLength, '0');

    // Perform XOR on each bit
    let resultBin = '';
    for (let i = 0; i < maxLength; i++) {
        resultBin += paddedA[i] === paddedB[i] ? '0' : '1';
    }

    // Convert the result binary string back to BigInt
    return BigInt('0b' + resultBin);
}

function wireValuesFromXY(x, y, bitsCount: number) {
    const wires = {};
    let xBools = numberToBoolsArray(x).reverse();
    let yBools = numberToBoolsArray(y).reverse();
    for (let i = 0; i <= bitsCount; i++) {
        const xkey = `x${formatTwoDigits(i)}`;
        wires[xkey] = xBools?.[i] ?? false;
        const ykey = `y${formatTwoDigits(i)}`;
        wires[ykey] = yBools?.[i] ?? false;
    }
    return wires;
}

function numberFromWireValues(
    wireValues: Record<string, boolean>,
    value: 'x' | 'y' | 'z'
): number {
    return parseInt(
        Object.entries(wireValues)
            .filter(([wireName, wireValue]) => wireName.startsWith(value))
            .sort(([wireNameA, a], [wireNameB, b]) =>
                wireNameB.localeCompare(wireNameA)
            )
            .map(([name, value]) => Number(value))
            .join(''),
        2
    );
}

function runCircuit(
    wireValues: Record<string, boolean>,
    circuits: CircuitComponent[]
) {
    while (circuits.length > 0) {
        let resolvedIndex;
        for (const [i, problem] of circuits.entries()) {
            const { leftWire, rightWire, gate, outputWire } = problem;
            if (
                wireValues[leftWire] !== undefined &&
                wireValues[rightWire] !== undefined
            ) {
                wireValues[outputWire] = gate(
                    wireValues[leftWire],
                    wireValues[rightWire]
                );
                resolvedIndex = i;
                break;
            }
        }
        if (resolvedIndex !== undefined) {
            circuits = [
                ...circuits.slice(0, resolvedIndex),
                ...circuits.slice(resolvedIndex + 1),
            ];
        } else {
            return -1;
        }
    }

    return numberFromWireValues(wireValues, 'z');
}

function processInput(input: string): {
    wireValues: Record<string, boolean>;
    circuits: CircuitComponent[];
} {
    const rows = input.split('\n');
    const wireValues: Record<string, boolean> = {};
    let i = 0;
    while (rows[i].length > 0) {
        const row = rows[i];
        const wireName = row.split(':')[0];
        const value = extractNumbers(row.split(':')[1]) === 1;
        wireValues[wireName] = value;
        i += 1;
    }
    i += 1;
    let circuits: CircuitComponent[] = [];
    while (i < rows.length) {
        const row = rows[i];
        if (row.length === 0) {
            i += 1;
            continue;
        }
        let gate;
        switch (row.split(' ')[1]) {
            case 'AND':
                gate = (a: boolean, b: boolean) => a && b;
                break;
            case 'OR':
                gate = (a: boolean, b: boolean) => a || b;
                break;
            case 'XOR':
                gate = (a: boolean, b: boolean) => a !== b;
                break;
            default:
                throw new Error(row);
        }

        circuits.push({
            leftWire: row.split(' ')[0],
            gate: gate as LogicGate,
            rightWire: row.split(' ')[2],
            outputWire: row.split(' ')[4],
        });
        i += 1;
    }
    return { circuits, wireValues };
}
function part1(input: string): number {
    // input =
    // 'x00: 1\nx01: 0\nx02: 1\nx03: 1\nx04: 0\ny00: 1\ny01: 1\ny02: 1\ny03: 1\ny04: 1\n\nntg XOR fgs -> mjb\ny02 OR x01 -> tnw\nkwq OR kpj -> z05\nx00 OR x03 -> fst\ntgd XOR rvg -> z01\nvdt OR tnw -> bfw\nbfw AND frj -> z10\nffh OR nrd -> bqk\ny00 AND y03 -> djm\ny03 OR y00 -> psh\nbqk OR frj -> z08\ntnw OR fst -> frj\ngnj AND tgd -> z11\nbfw XOR mjb -> z00\nx03 OR x00 -> vdt\ngnj AND wpb -> z02\nx04 AND y00 -> kjc\ndjm OR pbm -> qhw\nnrd AND vdt -> hwm\nkjc AND fst -> rvg\ny04 OR y02 -> fgs\ny01 AND x02 -> pbm\nntg OR kjc -> kwq\npsh XOR fgs -> tgd\nqhw XOR tgd -> z09\npbm OR djm -> kpj\nx03 XOR y03 -> ffh\nx00 XOR y04 -> ntg\nbfw OR bqk -> z06\nnrd XOR fgs -> wpb\nfrj XOR qhw -> z04\nbqk OR frj -> z07\ny03 OR x01 -> nrd\nhwm AND bqk -> z03\ntgd XOR rvg -> z12\ntnw OR pbm -> gnj';
    const { circuits, wireValues } = processInput(input);
    return runCircuit(wireValues, circuits);
}

function part2(input: string): any {
    // input x = 11, y = 13, expected_z = 24
    // input =
    // 'x00: 0\nx01: 1\nx02: 0\nx03: 1\nx04: 0\nx05: 1\ny00: 0\ny01: 0\ny02: 1\ny03: 1\ny04: 0\ny05: 1\n\nx00 AND y00 -> z05\nx01 AND y01 -> z02\nx02 AND y02 -> z01\nx03 AND y03 -> z03\nx04 AND y04 -> z04\nx05 AND y05 -> z00';
    const { circuits, wireValues } = processInput(input);
    const x = numberFromWireValues(wireValues, 'x');
    const y = numberFromWireValues(wireValues, 'y');
    // const outputWiresToKey = (wires: string[]) => JSON.stringify(wires.sort());
    // const swapSets = new Set();
    const wireToDependencies: Record<string, Set<string>> = {};
    for (const { leftWire, rightWire, gate, outputWire } of circuits) {
        if (wireToDependencies[outputWire]) {
            throw new Error('same output wire in multiple places!');
        }
        wireToDependencies[outputWire] = new Set<string>([leftWire, rightWire]);
    }

    // 5 if test, 44 if real
    const wrongOutputWires = new Set<string>();
    let inputSize = 44;
    const testPairs: bigint[][] = [[BigInt(x), BigInt(y)]];
    // let bigExample = [
    //     BigInt(2) ** BigInt(inputSize) - BigInt(1),
    //     BigInt(2) ** BigInt(inputSize) - BigInt(1),
    // ];
    // testPairs.push(bigExample);
    for (const [xx, yy] of testPairs) {
        let newWires = wireValuesFromXY(xx, yy, inputSize);
        // run the circuit
        const expectedZ = xx + yy;
        const actualZ = runCircuit(newWires, circuits);
        const diff = xorBigInt(expectedZ, actualZ);
        if (diff > 0) {
            let diffAsBools = numberToBoolsArray(diff);
            diffAsBools.reverse().forEach((val, i) => {
                if (val) {
                    wrongOutputWires.add(`z${formatTwoDigits(i)}`);
                }
            });
        }
    }
    // get names of all wires these outputs depend on
    const allCandidateWires = new Set<string>();
    const wireToAllDeps = {};
    for (const wire of wrongOutputWires) {
        let stack = [wire];
        while (stack.length > 0) {
            const curr = stack.shift();
            if (wireToAllDeps[wire]) {
                wireToAllDeps[wire].push(curr);
            } else {
                wireToAllDeps[wire] = [curr];
            }
            allCandidateWires.add(curr);
            wireToDependencies[curr].forEach((dep) => {
                if (!dep.startsWith('x') && !dep.startsWith('y')) {
                    stack.push(dep);
                }
            });
        }
    }

    // [18, 12, 13, 14, 16, 17, 21, 22, 23, 30, 31, 44]
    const candidateComponents = [
        ...circuits.filter((cir) => allCandidateWires.has(cir.outputWire)),
    ];

    let a = 1;

    // Naive approach is too slow
    // Need a way to know which logical components contributed to each bit that was wrong, and only swap around the components connected to the wrong bits
    // z XOR (x+y) gives us the bits that were wrong, then lookup z{bitnum} -> circuitComponents
    // then only consider swapping those...
    // Also try to optimize how the circuit runs so we dont have to check each component to see if we can run it yet...maybe just have some tree and build up from the leaf nodes to the root.
    // have output.dependsOn -> gives components (do depth first search, and when something has no dependencies we can run it)
    // mapFromWireToComponentDependencies (same as output wire mapping to its input wires)
    // then we need to map from input wire to the component that has that as an output wire.
}

const DAY_NUMBER = 24;
const rawInput = await requestInput(DAY_NUMBER);
// console.log(part1(rawInput));
console.log(part2(rawInput));
