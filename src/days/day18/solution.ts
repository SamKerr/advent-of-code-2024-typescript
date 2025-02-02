import { dfs } from '$src/lib/ClassicalAlgorithms/GraphAlgortihms/DFS';
import { dijkstra } from '$src/lib/ClassicalAlgorithms/GraphAlgortihms/Dijkstra';
import { Graph, GraphNode, KeyToNodeMap } from '$src/lib/DataStructures/Graph';
import { requestInput } from '$src/lib/http';
import {
    extractNumbers,
    parseAsIntArray,
    parseAsIntGrid,
    parseAsOneStrArray,
    parseAsStrGrid,
} from '$src/lib/parsing';

function part1(input: string): any {
    // input =
    // '5,4\n4,2\n4,5\n3,0\n2,1\n6,3\n2,4\n1,5\n0,6\n3,3\n2,6\n5,1\n1,2\n5,5\n2,5\n6,5\n1,4\n0,4\n6,4\n1,1\n6,1\n1,0\n0,5\n1,6\n2,0';
    const walls = input
        .split('\n')
        .filter((r) => r.length > 0)
        .map((r) => r.split(',').map((s) => extractNumbers(s)));
    const GRID_WIDTH = 71;
    const GRID_HEIGHT = GRID_WIDTH;
    const grid = Array.from({ length: GRID_HEIGHT }).map((r) =>
        Array.from({ length: GRID_WIDTH }).map((_) => '.')
    );
    for (const [x, y] of walls.slice(0, 1024)) {
        grid[y][x] = '#';
    }

    const coordsToKey = ([x, y]) => `${x},${y}`;
    const orthogonalDeltas = [
        [0, 1],
        [1, 0],
        [-1, 0],
        [0, -1],
    ];
    const nodes: KeyToNodeMap<string> = {};
    const weightsMatrix = {};
    for (const [y, row] of grid.entries()) {
        for (const [x, element] of row.entries()) {
            const key = coordsToKey([x, y]);
            const neighbours = orthogonalDeltas
                .map(([dx, dy]) => {
                    const candidate = grid?.[y + dy]?.[x + dx];

                    if (candidate === '.') {
                        return coordsToKey([x + dx, y + dy]);
                    } else {
                        return undefined;
                    }
                })
                .filter((v) => v !== undefined);

            const node: GraphNode<string> = {
                key,
                value: key,
                neighbours,
                path: [key],
            };
            nodes[key] = node;
            for (const neighbourKey of neighbours) {
                if (weightsMatrix[key] !== undefined) {
                    weightsMatrix[key][neighbourKey] = 1;
                } else {
                    weightsMatrix[key] = {};
                    weightsMatrix[key][neighbourKey] = 1;
                }
            }
        }
    }
    const graph: Graph<string> = {
        nodes,
        weightsMatrix,
    };
    console.log(nodes);
    const startKey = '0,0';
    const endKey = '70,70';
    const result = dijkstra(graph, startKey, endKey);
    // console.log({ result });
    console.log(result[0][0]);
    return result;
}

function part2(input: string): any {
    // input =
    // '5,4\n4,2\n4,5\n3,0\n2,1\n6,3\n2,4\n1,5\n0,6\n3,3\n2,6\n5,1\n1,2\n5,5\n2,5\n6,5\n1,4\n0,4\n6,4\n1,1\n6,1\n1,0\n0,5\n1,6\n2,0';
    const walls = input
        .split('\n')
        .filter((r) => r.length > 0)
        .map((r) => r.split(',').map((s) => extractNumbers(s)));
    const GRID_WIDTH = 71;
    const GRID_HEIGHT = GRID_WIDTH;
    const grid = Array.from({ length: GRID_HEIGHT }).map((r) =>
        Array.from({ length: GRID_WIDTH }).map((_) => '.')
    );
    for (const [x, y] of walls.slice(0, 1024)) {
        grid[y][x] = '#';
    }

    const coordsToKey = ([x, y]) => `${x},${y}`;
    const orthogonalDeltas = [
        [0, 1],
        [1, 0],
        [-1, 0],
        [0, -1],
    ];
    const nodes: KeyToNodeMap<string> = {};
    const weightsMatrix = {};
    for (const [y, row] of grid.entries()) {
        for (const [x, element] of row.entries()) {
            const key = coordsToKey([x, y]);
            const neighbours = orthogonalDeltas
                .map(([dx, dy]) => {
                    const candidate = grid?.[y + dy]?.[x + dx];

                    if (candidate === '.') {
                        return coordsToKey([x + dx, y + dy]);
                    } else {
                        return undefined;
                    }
                })
                .filter((v) => v !== undefined);

            const node: GraphNode<string> = {
                key,
                value: key,
                neighbours,
                path: [key],
            };
            nodes[key] = node;
            for (const neighbourKey of neighbours) {
                if (weightsMatrix[key] !== undefined) {
                    weightsMatrix[key][neighbourKey] = 1;
                } else {
                    weightsMatrix[key] = {};
                    weightsMatrix[key][neighbourKey] = 1;
                }
            }
        }
    }
    const graph: Graph<string> = {
        nodes,
        weightsMatrix,
    };
    console.log(nodes);
    const startKey = '0,0';
    const endKey = '70,70';

    let blockNumber = 1024;
    let optimalPaths = dijkstra(graph, startKey, endKey);
    let pathSets = optimalPaths.map(([l, { path }]) => new Set(path));
    while (pathSets.length > 0) {
        console.log(blockNumber);
        console.log(walls);
        const [x, y] = walls[blockNumber];
        blockNumber += 1;
        const key = coordsToKey([x, y]);

        // update graph to include that wall
        const neighbours = orthogonalDeltas
            .map(([dx, dy]) => {
                const candidate = grid?.[y + dy]?.[x + dx];

                if (candidate !== undefined) {
                    return coordsToKey([x + dx, y + dy]);
                } else {
                    return undefined;
                }
            })
            .filter((v) => v !== undefined);
        for (const neighbourKey of neighbours) {
            const neighbour = graph.nodes?.[neighbourKey];
            const newNeighbourOfNeighbour = neighbour.neighbours?.filter(
                (nk) => nk !== key
            );
            if (neighbour) {
                neighbour.neighbours = newNeighbourOfNeighbour;
            }
        }

        // remove any sets that contain that key
        pathSets = pathSets.filter((pathSet) => !pathSet.has(key));

        // if there are no remaining paths, run dijkstra again on new graph
        if (pathSets.length === 0) {
            optimalPaths = dijkstra(graph, startKey, endKey);
            pathSets = optimalPaths.map(([l, { path }]) => new Set(path));
        }
    }
    blockNumber -= 1;
    console.log(blockNumber);
    return walls[blockNumber];
}

const DAY_NUMBER = 18;
const rawInput = await requestInput(DAY_NUMBER);
// console.log(part1(rawInput));
console.log(part2(rawInput));
