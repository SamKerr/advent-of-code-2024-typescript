export function extractNumbers(input: string): number {
    const regex = /-?\d+/g; // Matches sequences of digits, including optional leading "-"
    const matches = input.match(regex); // Find all matches

    if (!matches) {
        throw new Error(`failed to extract numbers from string ${input}`);
    }

    return parseInt(matches[0]);
}

export function parseAsOneStrArray(input: string): string[] {
    return input
        .split('\n')
        .filter((arr) => arr.length > 0)
        .map((s) => s.split(' '))
        .flat();
}

export function parseAsStrGrid(input: string): string[][] {
    return input
        .split('\n')
        .filter((arr) => arr.length > 0)
        .map((arr) => arr.split(''));
}

export function parseAsIntArray(input: string): number[] {
    return parseAsOneStrArray(input).map((s) => parseInt(s));
}

export function parseAsIntGrid(input: string): number[][] {
    return parseAsStrGrid(input).map((arr) => arr.map((s) => parseInt(s)));
}
