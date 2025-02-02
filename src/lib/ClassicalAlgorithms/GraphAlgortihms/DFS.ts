import { GenericKey, Graph, GraphNode } from '../../DataStructures/Graph';

type NodeWithPath<T> = {
    key: GenericKey;
    node: GraphNode<T>;
    path: Set<GenericKey>;
};

type HeapNode<T> = [number, NodeWithPath<T>];

export function dfs<T>(
    graph: Graph<T>,
    startKey: GenericKey,
    endKey: GenericKey
): NodeWithPath<T>[] {
    // ##################################################
    // use dijkstra's algorithm to find the shortest path
    // from start -> end (single pair shortest path, no heuristic, O(Vlog(E)))
    // ##################################################
    const start = graph.nodes[startKey];
    const end = graph.nodes[endKey];

    // intiail sanity checks
    const nodesSet = new Set(Object.values(graph.nodes));
    if (!nodesSet.has(start) || !nodesSet.has(end)) {
        throw new Error('DFS failed: start or end nodes not in graph');
    }

    // initialize all nodes to have Infinite cost except start
    const nodeKeyToDistance: Record<GenericKey, number> = {};
    for (const nodeKey of Object.keys(graph.nodes)) {
        nodeKeyToDistance[nodeKey] = Infinity; // Default to Infinity
    }
    nodeKeyToDistance[startKey] = 0;

    // start search process
    const stack: HeapNode<T>[] = [
        [0, { key: start.key, node: start, path: new Set([]) }],
    ];
    const result: NodeWithPath<T>[] = [];
    while (stack.length > 0) {
        // pop lowest cost node
        console.log(stack.length);
        const [currDistance, currFrame] = stack.pop();
        const { node, path, key } = currFrame;
        const { neighbours } = node;

        if (path.has(key)) {
            continue;
        } else {
            if (key === end.key) {
                currFrame.path.add(key);
                result.push(currFrame);
            }

            // try all states reachable from current state
            for (const neighbourKey of neighbours) {
                const neighbour = graph.nodes[neighbourKey];
                const newDistance =
                    currDistance + graph.weightsMatrix[key][neighbour.key];
                if (!path.has(neighbourKey)) {
                    stack.push([
                        newDistance,
                        {
                            node: neighbour,
                            path: new Set([...path, key]),
                            key: neighbour.key,
                        },
                    ]);
                }
            }
        }
    }

    return result;
}
