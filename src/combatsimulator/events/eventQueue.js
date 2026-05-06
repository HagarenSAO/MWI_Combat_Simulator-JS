import Heap from "https://esm.sh/heap-js@2.2.0";

class EventQueue {
    constructor() {
        this.minHeap = new Heap((a, b) => a.time - b.time);
    }

    addEvent(event) {
        this.minHeap.push(event);
    }

    getNextEvent() {
        return this.minHeap.pop();
    }

    containsEventOfType(type) {
        const heapEvents = this.minHeap.toArray();

        return heapEvents.some((event) => event.type == type);
    }

    containsEventOfTypeAndHrid(type, hrid) {
        const heapEvents = this.minHeap.toArray();
        return heapEvents.some((event) => event.type == type && event.hrid == hrid);
    }

    clear() {
        this.minHeap = new Heap((a, b) => a.time - b.time);
    }

    clearEventsForUnit(unit) {
        this.clearMatching((event) => event.source == unit || event.target == unit);
    }

    clearEventsOfType(type) {
        this.clearMatching((event) => event.type == type);
    }

    clearMatching(fn) {
        let cleared = false;
        const heapEvents = this.minHeap.toArray();

        for (const event of heapEvents) {
            if (fn(event)) {
                this.minHeap.remove(event);
                cleared = true;
            }
        }
        return cleared;
    }

    getMatching(fn) {
        const heapEvents = this.minHeap.toArray(); 
    
        for (const event of heapEvents) {
            if (fn(event)) {
                return event; 
            }
        }
    
        return null; 
    }
}

export default EventQueue;
