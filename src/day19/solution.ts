import { requestInput } from '$src/utils/http';

function canConstruct(target: string, S: string[]): boolean {
    if (target.length === 0) {
        return true;
    }

    for (const substring of S) {
        if (substring === target) {
            return true;
        }
    }

    for (const [i, start] of S.entries()) {
        if (target.startsWith(start)) {
            for (const [j, end] of S.entries()) {
                if (target.slice(start.length).endsWith(end)) {
                    if (
                        canConstruct(target.slice(start.length, -end.length), S)
                    ) {
                        return true;
                    }
                }
            }
        }
    }
    return false;
}

function countPossibleConstructs(
    target: string,
    S: string[],
    stringToCount: Record<string, number>
): number {
    // console.log('CALLING COUNT POSS WITH TARGET:', target);
    if (target.length === 0) {
        return 1;
    }
    if (stringToCount[target]) {
        return stringToCount[target];
    }

    let count = 0;
    for (const [i, start] of S.entries()) {
        if (target.startsWith(start)) {
            if (target === start) {
                count++;
                continue;
            }

            // if we need an end, also pick an end
            for (const [j, end] of S.entries()) {
                if (target.slice(start.length).endsWith(end)) {
                    const toConstruct = target.slice(
                        start.length,
                        target.length - end.length
                    );
                    if (canConstruct(toConstruct, S)) {
                        let possibilities = countPossibleConstructs(
                            toConstruct,
                            S,
                            stringToCount
                        );
                        count += possibilities;
                        stringToCount[toConstruct] = possibilities;
                    }
                }
            }
        }
    }
    stringToCount[target] = count;
    return count;
}

function part1(input: string): number {
    // given a set of S, and another list T, how many strings in T can be made from concatenating strings in S
    // input =
    // 'r, wr, b, g, bwu, rb, gb, br\n\nbrwrr\nbggr\ngbbr\nrrbgbr\nubwu\nbwurrg\nbrgr\nbbrgwb';
    const lines = input.split('\n').filter((s) => s.length > 0);
    const S = lines[0]
        .split(',')
        .map((s) => s.trim())
        .sort((a, b) => b.length - a.length);
    const T = lines.filter((_, i) => i > 0).map((s) => s.trim());

    let count = 0;
    for (const target of T) {
        if (canConstruct(target, S)) {
            count++;
            console.log('can construct', target);
        } else {
            console.log('cannot construct', target);
        }
    }
    return count;
}

function part2(input: string): number {
    // given a set of S, and another list T, how many strings in T can be made from concatenating strings in S
    // input =
    // 'r, wr, b, g, bwu, rb, gb, br\n\nbrwrr\nbggr\ngbbr\nrrbgbr\nubwu\nbwurrg\nbrgr\nbbrgwb';
    const lines = input.split('\n').filter((s) => s.length > 0);
    const S = lines[0]
        .split(',')
        .map((s) => s.trim())
        .sort((a, b) => b.length - a.length);
    const T = lines.filter((_, i) => i > 0).map((s) => s.trim());

    let count = 0;
    for (const target of T) {
        if (canConstruct(target, S)) {
            console.log('trying to find ways of making', target);
            let possibilities = countPossibleConstructs(target, S, {});
            count += possibilities;
            console.log('can construct', target, 'in ', possibilities, ' ways');
        } else {
            console.log('cannot construct', target);
        }
        console.log('---');
    }
    return count;
}

const DAY_NUMBER = 19;
const rawInput = await requestInput(DAY_NUMBER);
console.log(part1(rawInput));
console.log(part2(rawInput));
