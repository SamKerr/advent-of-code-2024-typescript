class DLLNode<T> {
    value?: T;
    prev?: DLLNode<T>;
    next?: DLLNode<T>;

    constructor(val?: T, prev?: DLLNode<T>, next?: DLLNode<T>) {
        this.value = val;
        this.prev = prev;
        this.next = next;
    }
}

class DoubleLinkedList<T> {
    dummyStart: DLLNode<T>;
    dummyEnd: DLLNode<T>;
    size: number;

    constructor() {
        this.dummyStart = new DLLNode<T>();
        this.dummyEnd = new DLLNode<T>();
        this.dummyStart.next = this.dummyEnd;
        this.dummyEnd.prev = this.dummyStart;
        this.size = 0;
    }

    pushEnd(node: DLLNode<T>) {
        const prevToEnd = this.dummyEnd.prev;
        prevToEnd.next = node;
        node.prev = prevToEnd;
        this.dummyEnd.prev = node;
        node.next = this.dummyEnd;
        this.size += 1;
    }

    popEnd() {
        const prevToEnd = this.dummyEnd.prev;
        if (prevToEnd === this.dummyStart) {
            return undefined; // List is empty
        }
        const prevOfPrev = prevToEnd.prev;
        prevOfPrev.next = this.dummyEnd;
        this.dummyEnd.prev = prevOfPrev;

        prevToEnd.next = undefined;
        prevToEnd.prev = undefined;
        this.size -= 1;
        return prevToEnd;
    }

    pushStart(node: DLLNode<T>) {
        const nextToStart = this.dummyStart.next;
        this.dummyStart.next = node;
        node.prev = this.dummyStart;
        node.next = nextToStart;
        nextToStart.prev = node;
        this.size += 1;
    }

    popStart() {
        const nextToStart = this.dummyStart.next;
        if (nextToStart === this.dummyEnd) {
            return undefined; // List is empty
        }
        const nextOfNext = nextToStart.next;
        this.dummyStart.next = nextOfNext;
        nextOfNext.prev = this.dummyStart;

        nextToStart.next = undefined;
        nextToStart.prev = undefined;
        this.size -= 1;
        return nextToStart;
    }
}
