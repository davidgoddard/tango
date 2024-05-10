// event-bus.ts

type EventHandler = (payload: any) => void;

interface EventHandlers {
    [event: string]: EventHandler[];
}

class EventBus {
    private handlers: EventHandlers = {};

    // Subscribe to an event
    public on(event: string, handler: EventHandler): void {
        if (!this.handlers[event]) {
            this.handlers[event] = [];
        }
        this.handlers[event].push(handler);
    }

    // Unsubscribe from an event
    public off(event: string, handler: EventHandler): void {
        if (!this.handlers[event]) return;

        this.handlers[event] = this.handlers[event].filter(h => h !== handler);

        if (this.handlers[event].length === 0) {
            delete this.handlers[event];
        }
    }

    // Emit an event with a payload
    public emit(event: string, payload?: any): void {
        if (!this.handlers[event]) return;

        for (const handler of this.handlers[event]) {
            handler(payload);
        }
    }
}

export const eventBus = new EventBus();
