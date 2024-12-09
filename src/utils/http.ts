import { cookie } from '$secrets/cookie';

export const requestInput = async (inputUri: string): Promise<string> => {
    const response = await fetch(inputUri, {
        method: 'GET',
        headers: {
            Cookie: `session=${cookie}`,
        },
    });

    if (!response.ok) {
        throw new Error(`HTTP error! Status: ${response.status}`);
    }

    return await response.text();
};
