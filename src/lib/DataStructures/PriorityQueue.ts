export class PriorityQueue<T extends { key: keyof any }> {
    // priority, value
    private minHeap: [number, T][];
    // Map to track indices of elements by their key, can use it to update priority
    private keyMap: Map<T['key'], number>;

    constructor() {
        this.minHeap = [];
        this.keyMap = new Map();
    }

    private swap(i: number, j: number) {
        [this.minHeap[i], this.minHeap[j]] = [this.minHeap[j], this.minHeap[i]];
        // Update keyMap after swapping
        this.keyMap.set(this.minHeap[i][1].key, i);
        this.keyMap.set(this.minHeap[j][1].key, j);
    }

    private compare(i: number, j: number) {
        return this.minHeap[i][0] < this.minHeap[j][0];
    }

    push(element: [number, T]) {
        const [priority, value] = element;
        const existingIndex = this.keyMap.get(value.key);

        if (existingIndex !== undefined) {
            // If the key exists, update its priority
            this.minHeap[existingIndex][0] = priority;
            // update the value in the heap too
            this.minHeap[existingIndex][1] = value;
            this.bubbleUp(existingIndex);
            this.bubbleDown(existingIndex);
        } else {
            // If the key doesn't exist, add it
            this.minHeap.push(element);
            const index = this.minHeap.length - 1;
            this.keyMap.set(value.key, index);
            this.bubbleUp(index);
        }
    }

    pop() {
        if (this.size() === 0) return undefined;
        if (this.size() === 1) {
            const top = this.minHeap.pop();
            this.keyMap.delete(top[1].key);
            return top;
        }

        const top = this.minHeap[0];
        const last = this.minHeap.pop();
        this.minHeap[0] = last;
        this.keyMap.set(last[1].key, 0);
        this.keyMap.delete(top[1].key);
        this.bubbleDown(0);
        return top;
    }

    peek() {
        return this.minHeap[0];
    }

    size() {
        return this.minHeap.length;
    }

    private bubbleUp(index: number) {
        while (index > 0) {
            const parent = Math.floor((index - 1) / 2);
            if (this.compare(index, parent)) {
                this.swap(index, parent);
                index = parent;
            } else {
                break;
            }
        }
    }

    private bubbleDown(index: number) {
        const length = this.minHeap.length;
        while (true) {
            const left = 2 * index + 1;
            const right = 2 * index + 2;
            let smallest = index;

            if (left < length && this.compare(left, smallest)) smallest = left;
            if (right < length && this.compare(right, smallest))
                smallest = right;

            if (smallest !== index) {
                this.swap(index, smallest);
                index = smallest;
            } else {
                break;
            }
        }
    }
}
