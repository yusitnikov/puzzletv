export class PrioritizedQueue<T> {
    private queues: T[][] = [];

    constructor(items: T[] = []) {
        this.push(0, ...items);
    }

    isEmpty() {
        return this.queues.length === 0;
    }

    push(priority: number, ...items: T[]) {
        if (items.length === 0) {
            return;
        }

        while (this.queues.length <= priority) {
            this.queues.push([]);
        }
        this.queues[priority].push(...items);
    }

    private cleanEmptyLayers() {
        while (this.queues.length && !this.queues[0].length) {
            this.queues.shift();
        }
    }

    shift(): T | undefined {
        this.cleanEmptyLayers();

        const result = this.queues[0]?.shift();

        this.cleanEmptyLayers();

        return result;
    }
}
