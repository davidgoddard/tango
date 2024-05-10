import { eventBus } from "./event-bus";
// Example function with strong typing for events
function emitTandaUpdated(payload) {
    eventBus.emit('tandaUpdated', payload);
}
