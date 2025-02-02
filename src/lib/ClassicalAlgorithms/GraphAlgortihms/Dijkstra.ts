import { GenericKey, Graph, GraphNode } from '../../DataStructures/Graph';
import { PriorityQueue } from '../../DataStructures/PriorityQueue';

type NodeWithPath<T> = {
    key: GenericKey;
    node: GraphNode<T>;
    path: GenericKey[];
};

type HeapNode<T> = [number, NodeWithPath<T>];

export function dijkstra<T>(
    graph: Graph<T>,
    startKey: GenericKey,
    endKey: GenericKey
): HeapNode<T>[] {
    // ##################################################
    // use dijkstra's algorithm to find the shortest path
    // from start -> end (single pair shortest path, no heuristic, O(Vlog(E)))
    // ##################################################
    const start = graph.nodes[startKey];
    const end = graph.nodes[endKey];

    // intiail sanity checks
    const nodesSet = new Set(Object.values(graph.nodes));
    if (!nodesSet.has(start) || !nodesSet.has(end)) {
        throw new Error('Dijkstra failed: start or end nodes not in graph');
    }

    // initialize all nodes to have Infinite cost except start
    const nodeKeyToDistance: Record<GenericKey, number> = {};
    for (const nodeKey of Object.keys(graph.nodes)) {
        nodeKeyToDistance[nodeKey] = Infinity; // Default to Infinity
    }
    nodeKeyToDistance[startKey] = 0;

    // start search process
    const visited = new Set<GenericKey>();
    const pq = new PriorityQueue<NodeWithPath<T>>();
    pq.push([0, { node: start, path: [start.key], key: start.key }]);

    const result: HeapNode<T>[] = [];
    while (pq.size() > 0) {
        // pop lowest cost node
        const currHeapNode = pq.pop();
        const [currDistance, { node, path }] = currHeapNode;
        const { key, neighbours } = node;
        // console.log({ currDistance, node, path, key, neighbours });

        // mark as visited, update cost seen so far
        visited.add(key);
        nodeKeyToDistance[key] = Math.min(nodeKeyToDistance[key], currDistance);

        // if its an optimal path, then add to result
        if (
            key === end.key &&
            (result.length === 0 || result[0][0] === currDistance)
        ) {
            result.push(currHeapNode);
        } else if (result.length > 0 && result[0][0] < currDistance) {
            return result;
        }

        // try all states reachable from current state
        for (const neighbourKey of neighbours) {
            const neighbour = graph.nodes[neighbourKey];
            const newDistance =
                currDistance + graph.weightsMatrix[key][neighbour.key];
            if (
                !visited.has(neighbour.key) ||
                (visited.has(neighbour.key) &&
                    newDistance < nodeKeyToDistance[neighbour.key])
            ) {
                pq.push([
                    newDistance,
                    {
                        node: neighbour,
                        path: [...path, neighbour.key],
                        key: neighbour.key,
                    },
                ]);
            }
        }
    }

    return result;
}
