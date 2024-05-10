// event-bus.ts
class EventBus {
    handlers = {};
    // Subscribe to an event
    on(event, handler) {
        if (!this.handlers[event]) {
            this.handlers[event] = [];
        }
        this.handlers[event].push(handler);
    }
    // Unsubscribe from an event
    off(event, handler) {
        if (!this.handlers[event])
            return;
        this.handlers[event] = this.handlers[event].filter(h => h !== handler);
        if (this.handlers[event].length === 0) {
            delete this.handlers[event];
        }
    }
    // Emit an event with a payload
    emit(event, payload) {
        console.log('DEBUG: Emitting', event, payload == undefined ? 'no payload' : payload);
        if (!this.handlers[event]) {
            console.log('DEBUG - no event listeners for', event, payload);
        }
        else {
            for (const handler of this.handlers[event]) {
                handler(payload);
            }
        }
    }
}
export const eventBus = new EventBus();
