export class PriorityQueue<T> {
    // priority, value
    heap: [number, T][];

    constructor() {
        this.heap = [];
    }

    swap(i: number, j: number) {
        [this.heap[i], this.heap[j]] = [this.heap[j], this.heap[i]];
    }

    compare(i: number, j: number) {
        return this.heap[i][0] < this.heap[j][0];
    }

    push(element: [number, T]) {
        this.heap.push(element);
        this.bubbleUp();
    }

    pop() {
        if (this.size() === 1) return this.heap.pop();
        const top = this.heap[0];
        this.heap[0] = this.heap.pop();
        this.bubbleDown();
        return top;
    }

    peek() {
        return this.heap[0];
    }

    size() {
        return this.heap.length;
    }

    bubbleUp() {
        let index = this.heap.length - 1;
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

    bubbleDown() {
        let index = 0;
        const length = this.heap.length;
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
