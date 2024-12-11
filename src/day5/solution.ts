import { requestInput } from '$src/utils/http';

interface Relation {
    before: number;
    after: number;
}

interface SleighLaunchSpecs {
    relations: Relation[];
    updates: number[][];
    afterToBefores: Record<number, Set<number>>;
    beforeToAfters: Record<number, Set<number>>;
}

async function parseInput() {
    const input = (await requestInput(5)).split('\n');
    const result: SleighLaunchSpecs = {
        relations: [],
        updates: [],
        afterToBefores: {},
        beforeToAfters: {},
    };

    const relationPattern = /(\d+)\|(\d+)/g;
    let allRelationsSeen = false;
    let lineNumber = 0;
    while (!allRelationsSeen) {
        let line = input[lineNumber];
        if (line === '') {
            allRelationsSeen = true;
            lineNumber += 1;
            break;
        }
        const matches = [...line.matchAll(relationPattern)];
        if (
            !matches ||
            isNaN(parseInt(matches[0][1])) ||
            isNaN(parseInt(matches[0][2]))
        ) {
            throw new Error('Error matching regex to input');
        }
        const before = parseInt(matches[0][1]);
        const after = parseInt(matches[0][2]);
        result.relations.push({
            before,
            after,
        });
        result.afterToBefores[after] = result.afterToBefores[after]
            ? new Set([...result.afterToBefores[after], before])
            : new Set([before]);
        result.beforeToAfters[before] = result.beforeToAfters[before]
            ? new Set([...result.beforeToAfters[before], after])
            : new Set([after]);
        lineNumber += 1;
    }

    while (lineNumber < input.length) {
        result.updates.push(input[lineNumber].split(',').map(Number));
        lineNumber += 1;
    }
    return result;
}

function isPageOrderValid(pages: number[], input: SleighLaunchSpecs) {
    // page order is valid if for each pair X,Y in pages, the rule X before Y is followed
    const pagesSet = new Set(pages);
    const seen = new Set();
    for (const page of pages) {
        seen.add(page);
        const x = input.afterToBefores[page] ?? new Set();
        const requiredBefores = [...x].filter((before) => pagesSet.has(before));
        const allBeforeAreSeen = requiredBefores.every((before) =>
            seen.has(before)
        );
        if (!allBeforeAreSeen) return false;
    }
    return true;
}

function part1(input: SleighLaunchSpecs): number {
    return input.updates
        .map((pages) =>
            isPageOrderValid(pages, input)
                ? pages[Math.floor(pages.length / 2)]
                : 0
        )
        .reduce((acc, x) => acc + x, 0);
}

function findValidPageOrdering(
    pages: number[],
    input: SleighLaunchSpecs
): number[] {
    // find a valid page ordering by checking if valid, doing one swap, then repeating until valid
    let newPages = [...pages];
    while (!isPageOrderValid(newPages, input)) {
        let swapped = false;
        for (const [i, x] of newPages.entries()) {
            if (swapped) break;
            for (const [j, y] of newPages.entries()) {
                const isInWrongOrder =
                    i != j && i < j && input.afterToBefores[x].has(y);
                if (isInWrongOrder) {
                    const arr_i = newPages[i];
                    const arr_j = newPages[j];
                    newPages[i] = arr_j;
                    newPages[j] = arr_i;
                    swapped = true;
                    break;
                }
            }
        }
    }
    return newPages;
}

function part2(input: SleighLaunchSpecs): number {
    return input.updates
        .map((pages) =>
            !isPageOrderValid(pages, input)
                ? findValidPageOrdering(pages, input)[
                      Math.floor(pages.length / 2)
                  ]
                : 0
        )
        .reduce((acc, x) => acc + x, 0);
}

const input = await parseInput();
console.log(part1(input));
console.log(part2(input));
