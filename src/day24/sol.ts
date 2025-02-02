import { requestInput } from '$src/utils/http';
import {
    extractNumbers,
} from '$src/utils/parsing';

type LogicGate = (a: boolean, b: boolean) => boolean;
type CircuitComponent = {
    leftWire: string;
    rightWire: string;
    gate: LogicGate;
    outputWire: string;
};

// we can use this tree to evaluate each output using post-order dfs
// eval(leftComp), eval(rightComp), eval(curr)
type CircuitCompTree = {
    leftWire: string;
    leftTree?: CircuitCompTree;
    rightWire: string;
    rightTree?: CircuitCompTree;
    gate: LogicGate;
    outputWire: string;
}

type Input = {
    wireValues: Record<string, boolean>;
    circuitTrees: Map<string, CircuitCompTree>;
}

const isInput = (s) => s.startsWith('x') || s.startsWith('y')
const isOutput = (s) => s.startsWith('z') 
const numberTo2Digit = (n) => n.toString().padStart(2, '0')

function update_wire_values_with_x_y(x: number, y: number, wireValues: Record<string, boolean>){
    const binaryX = x.toString(2).split('').reverse()
    for (const [i, v] of Object.entries(binaryX)) {
        const name = numberTo2Digit(i)
        wireValues[`x${name}`] = v === '1'
    }
    let i = binaryX.length
    while(i <= 44){
        const name = numberTo2Digit(i)
        wireValues[`x${name}`] = false;
        i++;
    }

    const binaryY = y.toString(2).split('').reverse()
    for (const [i, v] of Object.entries(binaryY)) {
        const name = numberTo2Digit(i)
        wireValues[`y${name}`] = v === '1'
    }
    i = binaryY.length
    while(i <= 44){
        const name = numberTo2Digit(i)
        wireValues[`y${name}`] = false;
        i++;
    }
} 

function boolmapToNumber(
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

function preprocessInput(input: string, swaps?: Map<string, string>): Input  {
    const rows = input.split('\n');
    const wireValues: Record<string, boolean> = {};
    const swap = (s) => swaps?.[s] !== undefined ? swaps[s] : s;
    let i = 0;
    // section 1, go until blank line
    while (rows[i].length > 0) {
        const row = rows[i];
        const wireName = swap(row.split(':')[0]);
        const value = extractNumbers(row.split(':')[1]) === 1;
        wireValues[wireName] = value;
        i += 1;
    }
    i += 1;
    let circuits = new Map<string, CircuitComponent>();

    // section 2, rest of lines
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

        circuits[swap(row.split(' ')[4])] = {
            leftWire: swap(row.split(' ')[0]),
            gate: gate as LogicGate,
            rightWire: swap(row.split(' ')[2]),
            outputWire: swap(row.split(' ')[4]),
        };
        i += 1;
    }

    function buildTreeRecursively(wireName){
        const circuit =  circuits[wireName]
        let leftTree;
        let rightTree;

        if(circuit == undefined || circuit?.leftWire == undefined || circuit?.rightWire == undefined){
            let b = 'b'
        }
        if(!isInput(circuit.leftWire) ){
            leftTree = buildTreeRecursively(circuit.leftWire);
        }

        if(!isInput(circuit.rightWire)){
            rightTree = buildTreeRecursively(circuit.rightWire)
        }

        const result = {...circuit, leftTree, rightTree};
        return result;
    }

    const circuitTrees = new Map<string, CircuitCompTree>();
    for (const [outputWire, circuit] of Object.entries(circuits)) {
        if(outputWire.startsWith('z')){
            circuitTrees[outputWire] = buildTreeRecursively(outputWire);
        }
    }

    return { circuitTrees, wireValues };
}

function runCircuit({
    wireValues,
    circuitTrees}: Input
) {

    function evaluate(circuit: CircuitCompTree): boolean {

        let leftVal;
        let rightVal;
        if(isInput(circuit.leftWire)){
            leftVal = wireValues[circuit.leftWire]
        } else {
            leftVal = evaluate(circuit.leftTree)
        }

        if(isInput(circuit.rightWire)){
            rightVal = wireValues[circuit.rightWire]
        } else {
            rightVal = evaluate(circuit.rightTree)
        }
        
        const result = circuit.gate(leftVal, rightVal);
        return result;
    }

    for (const [wireName, circuitTree] of Object.entries(circuitTrees)) {
        wireValues[wireName] = evaluate(circuitTree)
    } 

    // while (circuits.length > 0) {
    //     let resolvedIndex;
    //     for (const [i, problem] of circuits.entries()) {
    //         const { leftWire, rightWire, gate, outputWire } = problem;
    //         if (
    //             wireValues[leftWire] !== undefined &&
    //             wireValues[rightWire] !== undefined
    //         ) {
    //             wireValues[outputWire] = gate(
    //                 wireValues[leftWire],
    //                 wireValues[rightWire]
    //             );
    //             resolvedIndex = i;
    //             break;
    //         }
    //     }
    //     if (resolvedIndex !== undefined) {
    //         circuits = [
    //             ...circuits.slice(0, resolvedIndex),
    //             ...circuits.slice(resolvedIndex + 1),
    //         ];
    //     } else {
    //         return -1;
    //     }
    // }

    return boolmapToNumber(wireValues, 'z');
}


function part1(input: string) {
    const { circuitTrees, wireValues } = preprocessInput(input);
    return runCircuit({ circuitTrees, wireValues });
}


    // definately wrong: 
    // z18 (doesnt depend on a carry)

    // sus since its a big jump in how many it depends on, z19

    // z14 is an OR and should be a NOT
    // z18 is an AND and should be a NOT
    // z23 is an AND and should be a NOT

//     Key insight z00 tree should be indential in gates as one of the branches of z01, (one is carry and the other is x01 and y01)
// for z11 it should depend on x10 && y10 (carry) + x11 !== y11 and thats it!
const candidateWiresMemo = {};
function getCandidateWires(circuit: CircuitCompTree, result: Set<string>){
    if(candidateWiresMemo?.[circuit.outputWire])  candidateWiresMemo[circuit.outputWire].forEach(e => result.add(e));
    result.add(circuit.outputWire)
    
    if(!isInput(circuit.leftWire)){
        result.add(circuit.leftWire)
    }
    
    if(!isInput(circuit.rightWire)){
        result.add(circuit.rightWire)
    }

    if(circuit.leftTree){
        getCandidateWires(circuit.leftTree, result)
    }

    if(circuit.rightTree){
        getCandidateWires(circuit.rightTree, result)
    }
    
    // memoize the output wire calls
    if(isOutput(circuit.outputWire)){
        candidateWiresMemo[circuit.outputWire] = result
    }
}

// for (let i = 0; i <= 45; i++) {
//     const name = numberTo2Digit(i);
//     const allInputs = [];
//     getCandidateWires(circuitTrees[`z${name}`], allInputs)
//     console.log(`z${name} depends on`, allInputs.sort())
// }
function part2(input: string) {
    // input =
    // 'x00: 1\nx01: 0\nx02: 1\nx03: 1\nx04: 0\ny00: 1\ny01: 1\ny02: 1\ny03: 1\ny04: 1\n\nntg XOR fgs -> mjb\ny02 OR x01 -> tnw\nkwq OR kpj -> z05\nx00 OR x03 -> fst\ntgd XOR rvg -> z01\nvdt OR tnw -> bfw\nbfw AND frj -> z10\nffh OR nrd -> bqk\ny00 AND y03 -> djm\ny03 OR y00 -> psh\nbqk OR frj -> z08\ntnw OR fst -> frj\ngnj AND tgd -> z11\nbfw XOR mjb -> z00\nx03 OR x00 -> vdt\ngnj AND wpb -> z02\nx04 AND y00 -> kjc\ndjm OR pbm -> qhw\nnrd AND vdt -> hwm\nkjc AND fst -> rvg\ny04 OR y02 -> fgs\ny01 AND x02 -> pbm\nntg OR kjc -> kwq\npsh XOR fgs -> tgd\nqhw XOR tgd -> z09\npbm OR djm -> kpj\nx03 XOR y03 -> ffh\nx00 XOR y04 -> ntg\nbfw OR bqk -> z06\nnrd XOR fgs -> wpb\nfrj XOR qhw -> z04\nbqk OR frj -> z07\ny03 OR x01 -> nrd\nhwm AND bqk -> z03\ntgd XOR rvg -> z12\ntnw OR pbm -> gnj';
    // for each z output, find a
    
    // Key insight z00 tree should be indential in gates as one of the branches of z01, (one is carry and the other is x01 and y01)
    // for z11 it should depend on x10 && y10 (carry) + x11 !== y11 and thats it!
    // function getAllInputWires(circuit: CircuitCompTree, result: string[]){
    //     if(isInput(circuit.leftWire)){
    //         result.push(circuit.leftWire)
    //     }else {
    //         getAllInputWires(circuit.leftTree, result)
    //     }

    //     if(isInput(circuit.rightWire)){
    //         result.push(circuit.rightWire)
    //     } else {
    //         getAllInputWires(circuit.rightTree, result)
    //     }
    // }

    // for (let i = 0; i <= 45; i++) {
    //     const name = numberTo2Digit(i);
    //     const allInputs = [];
    //     getAllInputWires(circuitTrees[`z${name}`], allInputs)
    //     console.log(`z${name} depends on`, allInputs.sort())
    // }
    
    let x = 0;
    let y = 0;
    let z = x+y;

    const swapCandidates = Array.from({length:45}).map((_,i) => i)
    const { circuitTrees: originalCircuitTrees, wireValues: originalWireValues } = preprocessInput(input);

    for (const offset1 of swapCandidates) {
        for (const offset2 of swapCandidates) {
            if(offset1 === offset2) continue;
            console.log({offset1, offset2})
            const output1 = `z${numberTo2Digit(offset1)}`
            const output2 = `z${numberTo2Digit(offset2)}`
            const candidates1 = new Set<string>(); 
            getCandidateWires(originalCircuitTrees[output1], candidates1)
            const candidates2 = new Set<string>(); 
            getCandidateWires(originalCircuitTrees[output2], candidates2)
            
            let c1 = 0;
            for (const candidate1 of candidates1) {
                console.log(`${c1} out of ${candidates1.size}`)
                c1++;
                for (const candidate2 of candidates2) {
                    const swaps = new Map<string, string>();
                    swaps[candidate1] = candidate2;
                    swaps[candidate2] = candidate1;
                    const { circuitTrees, wireValues } = preprocessInput(input, swaps);
                    
                    let foundError = false;
                    for (const [xval, yval] of [[1,1], [1,0], [0,1], [0,0], [3,3], [3,0], [0,3]]) {
                        x = xval << offset1;
                        y = yval << offset1;
                        z = x+y;
                        update_wire_values_with_x_y(x,y, wireValues)
                        let result = runCircuit({wireValues, circuitTrees});
                        // console.log(`x: ${x}, y: ${y}, z: ${z}, result: ${result}`)
                        if(z === result){
                            // console.log('worked for x', x, ' and y', y)
                        } else {
                            foundError = true;
                            break;
                        }

                        x = xval << offset2;
                        y = yval << offset2;
                        z = x+y;
                        update_wire_values_with_x_y(x,y, wireValues)
                        result = runCircuit({wireValues, circuitTrees});
                        // console.log(`candidat1: ${candidate1}, candidate2: ${candidate2}, offset1: ${offset1}, offset2: ${offset2}, x: ${x}, y: ${y}, z: ${z}, result: ${result}`)
                        if(z === result){
                            // console.log('GOOD')
                        } else {
                            // console.log('ERROR')
                            foundError = true;
                            break;
                        }
                    }

                    if(!foundError){
                        console.log('FOUND A VALID SWAP: ')
                        console.log(candidate1, candidate2)
                        return 
                    }
                }
            }

        }
    }
    console.log('finished considering offset1 and 2')


    // const failedOffsets = []
    // for (let offset = 0; offset <= 44; offset++) {
    //     // [[1,1], [1,0], [0,1], [3,3], [3,0], [0,3], [0,0]]
    //     for (const [xval, yval] of [[1,1], [1,0], [0,1], [0,0], [3,3], [3,0], [0,3]]) {
    //         x = xval << offset;
    //         y = yval << offset;
    //         z = x+y;
    //         update_wire_values_with_x_y(x,y, wireValues)
    //         let result = runCircuit({wireValues, circuitTrees});
    //         console.log(`x: ${x}, y: ${y}, z: ${z}, result: ${result}`)
    //         if(z === result){
    //             console.log('worked for x', x, ' and y', y)
    //         } else {
    //             console.log('failed for x', x, ' and y', y)
    //             failedOffsets.push([offset].toString())
    //         }
    //     }
    // }
    // console.log([...new Set(failedOffsets)])
}

const DAY_NUMBER = 24;
const rawInput = await requestInput(DAY_NUMBER);

// console.log(part1(rawInput));
console.log(part2(rawInput));
