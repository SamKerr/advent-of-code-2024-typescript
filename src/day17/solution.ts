import { requestInput } from '$src/utils/http';
import {
    extractNumbers,
    parseAsIntArray,
    parseAsIntGrid,
    parseAsOneStrArray,
    parseAsStrGrid,
} from '$src/utils/parsing';

type Opcode = 0 | 1 | 2 | 3 | 4 | 5 | 6 | 7;
type LiteralOperand = 0 | 1 | 2 | 3;
type RegisterOperand = 4 | 5 | 6;
type RegisterName = 'A' | 'B' | 'C';
type Operand = LiteralOperand | RegisterOperand | 7;

let regA = 0;
let regB = 0;
let regC = 0;
let programCounter = 0;
let stdOut = [];

function getComboOperandValue(operand: Operand): number {
    switch (operand) {
        case 0:
            return 0;
        case 1:
            return 1;
        case 2:
            return 2;
        case 3:
            return 3;
        case 4:
            return regA;
        case 5:
            return regB;
        case 6:
            return regC;
        case 7:
            throw new Error('Invalid operand');
        default:
            throw new Error('Invalid operand');
    }
}

function handleInstruction(code): void {
    let opcode = code[programCounter];
    let operand = code[programCounter+1];
    programCounter += 2
    let comboOperand;
    switch (opcode) {
        case 0:
            // A = A/2^comboOperand
            comboOperand = getComboOperandValue(operand);
            regA = Math.floor(regA / Math.pow(2, comboOperand));
            break;
        case 1:
            // B = B xor operand
            regB = regB ^ operand;
            break;
        case 2:
            // B = comboOperand mod 8 (keeps the last 3 bits, so could do | 0b111)
            comboOperand = getComboOperandValue(operand);
            regB = (comboOperand % 8 + 8) % 8;
            break;

        case 3:
            // nothing if register A is 0, otherwise set program counter to opcode
            if (regA !== 0) {
                programCounter = operand;
            }
            break;
        case 4:
            // B = B or C (ignores operand)
            regB = regB ^ regC;
            break;
        case 5:
            // add comboOperand % 8 to stdout
            comboOperand = getComboOperandValue(operand);
            stdOut.push((comboOperand % 8 + 8) % 8);
            break;
        case 6:
            // B = A/2^comboOperand
            comboOperand = getComboOperandValue(operand);
            regB = Math.floor(regA / Math.pow(2, comboOperand));
            break;
        case 7:
            // C = A / 2^comboOperand
            comboOperand = getComboOperandValue(operand);
            regC = Math.floor(regA / Math.pow(2, comboOperand));
            break;
        default:
            throw new Error('Invalid opcode');
    }
}

function runProgram(code: number[], [a,b,c]: number[]){
    regA = a;
    regB = b;
    regC = c;
    programCounter = 0;
    stdOut = []
    while (programCounter < code.length) {
        handleInstruction(code);
    }
}


function part1(input: string): void {
    const lines = input.split('\n');
    const initialRegValues = [
        extractNumbers(lines[0]),
        extractNumbers(lines[1]),
        extractNumbers(lines[2]),
    ]
    const code = lines[4]
        .split(':')[1]
        .split(',')
        .map((s) => parseInt(s));
    const result =  runProgram(code, initialRegValues);
    console.log(result)
}

function part2(input: string): number {
    const lines = input.split('\n');
    const code = lines[4]
        .split(':')[1]
        .split(',')
        .map((s) => parseInt(s));
    const target = [2,4,1,1,7,5,0,3,1,4,4,5,5,5,3,0];
    let currentA = 0;
    let found = false;
    let s = 1;
    while(!found){
        runProgram(code, [currentA, 0, 0]);
        if(stdOut.toString() === target.toString()){
            found = true;
            console.log(currentA)
        } else if(stdOut.toString() === target.slice(-1*s).toString()){
            s+=1
            currentA *= 8;
        } else {
            currentA +=1;
        }
    }
    return currentA;

}

const DAY_NUMBER = 17;
const rawInput = await requestInput(DAY_NUMBER);
console.log(part1(rawInput));
console.log(part2(rawInput));
