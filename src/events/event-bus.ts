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

    // Subscribe to an event, but only once
    public once(event: string, handler: EventHandler): void {
        const onceHandler: EventHandler = (payload) => {
            // Call the original handler
            handler(payload);

            // Unsubscribe the once handler after the event is fired once
            this.off(event, onceHandler);
        };

        // Subscribe to the event using the once handler
        this.on(event, onceHandler);
    }

    // Emit an event with a payload
    public emit(event: string, payload?: any): void {
        console.log('DEBUG: Emitting', event, payload == undefined ? 'no payload' : payload)
        if (!this.handlers[event]) {
            console.log('DEBUG - no event listeners for', event, payload)
        } else {
            for (const handler of this.handlers[event]) {
                handler(payload);
            }
        }
    }
}

export const eventBus = new EventBus();
