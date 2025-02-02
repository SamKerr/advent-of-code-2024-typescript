import { requestInput } from '$src/utils/http';


function part1(input: string): number {
    // input =
    // 'kh-tc\nqp-kh\nde-cg\nka-co\nyn-aq\nqp-ub\ncg-tb\nvc-aq\ntb-ka\nwh-tc\nyn-cg\nkh-ub\nta-co\nde-co\ntc-td\ntb-wq\nwh-td\nta-ka\ntd-qp\naq-cg\nwq-ub\nub-vc\nde-ta\nwq-aq\nwq-vc\nwh-yn\nka-de\nkh-ta\nco-tc\nwh-qp\ntb-vc\ntd-yn';
    const nodeToNeighbours = {};
    const addNodeAndNeighbour = (node, neighbour) => {
        if (!nodeToNeighbours[node]) {
            nodeToNeighbours[node] = new Set([neighbour]);
        } else {
            nodeToNeighbours[node].add(neighbour);
        }
    };

    input
        .split('\n')
        .filter((r) => r.length > 0)
        .map((r) => r.split('-'))
        .forEach(([left, right]) => {
            addNodeAndNeighbour(left, right);
            addNodeAndNeighbour(right, left);
        });

    let count = 0;
    let doubleCounted = 0;
    let tripleCounted = 0;
    for (const node of Object.keys(nodeToNeighbours)) {
        if (node.startsWith('t')) {
            // pick 2 neighbours
            // check if the 2 neighbours are connected
            const neighbours = [...nodeToNeighbours[node]];
            for (let i = 0; i < neighbours.length; i++) {
                for (let j = i + 1; j < neighbours.length; j++) {
                    const elementI = neighbours[i];
                    const elementJ = neighbours[j];
                    if (nodeToNeighbours[elementI].has(elementJ)) {
                        if (
                            elementI.startsWith('t') &&
                            elementJ.startsWith('t')
                        ) {
                            tripleCounted += 1;
                        } else if (
                            elementI.startsWith('t') ||
                            elementJ.startsWith('t')
                        ) {
                            doubleCounted += 1;
                        } else {
                            count += 1;
                        }
                    }
                }
            }
        }
    }

    return count + doubleCounted / 2 + tripleCounted / 3;
}

function isNodeConnectedToClique(
    nodeToNeighbours: Record<string, Set<string>>,
    node: string,
    clique: Set<string>
) {
    const neighbours = nodeToNeighbours[node];
    return [...clique].every((element) => neighbours.has(element));
}

const setToKey = (s: Set<string>): string =>
    JSON.stringify([...s].sort().join(','));

const memo: Record<string, Set<string>> = {};
function findMaximalClique(
    nodeToNeighbours: Record<string, Set<string>>,
    clique: Set<string>,
    cliqueNeighbours: Set<string>
): Set<string> {
    // how do I find the maximal subset of nodes that are fully connected to each other?
    // start a node, and have a clique set, have a set of potential neighbours to add (every neighbour must be fully connected to the clique)
    if (cliqueNeighbours.size === 0) {
        return clique;
    }
    if (memo[setToKey(clique)]) return memo[setToKey(clique)];

    let maximalClique;
    for (const cNeighbour of cliqueNeighbours) {
        // add cNeighbour to clique
        let newClique = new Set([cNeighbour, ...clique]);

        // filter down the cliqueNeighbours to those that have cNeighbour
        // add in cNeighbours neighbours as long as they connect to the clique
        let newCliqueNeighbours = new Set(
            [...cliqueNeighbours].filter((cn) =>
                nodeToNeighbours[cn].has(cNeighbour)
            )
        );

        for (const neighbour of nodeToNeighbours[cNeighbour]) {
            if (
                isNodeConnectedToClique(nodeToNeighbours, neighbour, newClique)
            ) {
                newCliqueNeighbours.add(neighbour);
            }
        }

        let maximalReachableClique = findMaximalClique(
            nodeToNeighbours,
            newClique,
            newCliqueNeighbours
        );
        if (
            maximalClique === undefined ||
            maximalReachableClique.size > maximalClique.size
        ) {
            maximalClique = maximalReachableClique;
        }
    }
    memo[setToKey(clique)] = maximalClique;
    return maximalClique;
}

function part2(input: string): any {
    // input =
    // 'kh-tc\nqp-kh\nde-cg\nka-co\nyn-aq\nqp-ub\ncg-tb\nvc-aq\ntb-ka\nwh-tc\nyn-cg\nkh-ub\nta-co\nde-co\ntc-td\ntb-wq\nwh-td\nta-ka\ntd-qp\naq-cg\nwq-ub\nub-vc\nde-ta\nwq-aq\nwq-vc\nwh-yn\nka-de\nkh-ta\nco-tc\nwh-qp\ntb-vc\ntd-yn';
    const nodeToNeighbours: Record<string, Set<string>> = {};
    const addNodeAndNeighbour = (node, neighbour) => {
        if (!nodeToNeighbours[node]) {
            nodeToNeighbours[node] = new Set([neighbour]);
        } else {
            nodeToNeighbours[node].add(neighbour);
        }
    };

    input
        .split('\n')
        .filter((r) => r.length > 0)
        .map((r) => r.split('-'))
        .forEach(([left, right]) => {
            addNodeAndNeighbour(left, right);
            addNodeAndNeighbour(right, left);
        });

    let maximalClique: undefined | Set<string>;
    for (const [node, neighbours] of Object.entries(nodeToNeighbours)) {
        const clique = findMaximalClique(
            nodeToNeighbours,
            new Set([node]),
            neighbours
        );
        if (maximalClique === undefined || clique.size > maximalClique.size) {
            maximalClique = clique;
        }
    }
    return setToKey(maximalClique);
}

const DAY_NUMBER = 23;
const rawInput = await requestInput(DAY_NUMBER);
console.log(part1(rawInput));
console.log(part2(rawInput));
