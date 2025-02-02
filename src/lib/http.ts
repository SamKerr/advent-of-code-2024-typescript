import { cookie } from '$secrets/cookie';

export const requestInput = async (day: number): Promise<string> => {
    const response = await fetch(
        `https://adventofcode.com/2024/day/${day}/input`,
        {
            method: 'GET',
            headers: {
                Cookie: `session=${cookie}`,
            },
        }
    );

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.text();
};
