export type WeightsMatrix = {
    [fromKey: GenericKey]: {
        [toKey: GenericKey]: number;
    };
};

export type KeyToNodeMap<T> = { [key: GenericKey]: GraphNode<T> };
export type Graph<T> = {
    nodes: KeyToNodeMap<T>;
    weightsMatrix: WeightsMatrix;
};

export type GenericKey = keyof any;

export type GraphNode<T> = {
    key: GenericKey;
    value: T;
    neighbours: GenericKey[];
    path: GenericKey[];
};
