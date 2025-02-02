import { requestInput } from '$src/utils/http';

const part1 = (input: string): number => {
    let encodedMemory = input
        .split('\n')
        .filter((s) => s.length > 0)[0]
        .split('')
        .map((x) => parseInt(x));

    // expand out the encoded memory
    let expandedMemory = [];
    let isSpace = false;
    let id = 0;
    for (const size of encodedMemory) {
        const expansion = isSpace
            ? new Array(size).fill('.')
            : new Array(size).fill(id);
        expandedMemory = expandedMemory.concat(expansion);
        isSpace = !isSpace;
        id = isSpace ? id : id + 1;
    }

    // have a pointer pointing to the left of the string, and one to the right
    // scan the left to the right until you find a '.'
    // scan the right to the left until you find a non-'.'
    // swap them
    // stop when leftptr === rightptr
    let leftPtr = 0;
    let leftValue;
    let rightPtr = expandedMemory.length - 1;
    let rightValue;
    while (leftPtr < rightPtr) {
        leftValue = expandedMemory[leftPtr];
        rightValue = expandedMemory[rightPtr];
        if (leftValue === '.') {
            if (rightValue !== '.') {
                // swap
                expandedMemory[leftPtr] = rightValue;
                expandedMemory[rightPtr] = leftValue;
            } else {
                rightPtr -= 1;
            }
        } else {
            leftPtr += 1;
        }
    }
    // calculate checksum by suming product of id and value
    return expandedMemory.reduce(
        (acc, val, i) => (val !== '.' ? acc + parseInt(val) * i : acc),
        0
    );
};

type Memory = {
    id: number | null;
    size: number;
    isSpace: boolean;
};
const part2 = (input: string): number => {
    let encodedMemory = input
        .split('\n')
        .filter((s) => s.length > 0)[0]
        .split('')
        .map((x) => parseInt(x));

    // expand out the encoded memory
    let memoryArr: Memory[] = [];
    let isSpace = false;
    let id = 0;
    for (const size of encodedMemory) {
        const memory: Memory = {
            isSpace,
            id: isSpace ? null : id,
            size,
        };
        memoryArr.push(memory);
        isSpace = !isSpace;
        id = isSpace ? id : id + 1;
    }

    // for each block of memory, starting from the right
    // see if there is a block of space that you can place the memory into
    // if there is, place the memory there before the space, and shrink the available space
    for (let i = memoryArr.length - 1; i >= 0; i--) {
        const block1 = memoryArr[i];
        if (block1.isSpace) {
            continue;
        } else {
            for (let j = 0; j < i; j++) {
                const block2 = memoryArr[j];
                if (block2.isSpace && block2.size >= block1.size) {
                    // we want to:
                    // move block 1 into index j-1 (via extending the array)
                    // shrink block 2 space down
                    // replace block 1 with space
                    const block2Clone = { ...block2, size: block1.size };
                    block2.size -= block1.size;
                    memoryArr = [
                        ...memoryArr.slice(0, j),
                        block1,
                        ...memoryArr.slice(j, i),
                        block2Clone,
                        ...memoryArr.slice(i + 1),
                    ];
                    // we have to increment i since the array grew by 1 and we are decrementing down
                    i++;
                    break;
                }
            }
        }
    }

    // again calculate the checksum
    let index = 0;
    return memoryArr.reduce((acc, memory) => {
        if (memory.isSpace) {
            index += memory.size;
            return acc;
        } else {
            for (let i = index; i < index + memory.size; i++) {
                acc += i * memory.id;
            }
            index = index + memory.size;
            return acc;
        }
    }, 0);
};

const rawInput = await requestInput(9);
console.log(part1(rawInput));
console.log(part2(rawInput));
