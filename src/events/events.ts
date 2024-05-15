import { eventBus } from "../events/event-bus";
// Define types for event payloads
interface TandaUpdatedPayload {
    id: string;
    songs: string[];
}

interface PlaylistCreatedPayload {
    playlistId: string;
    name: string;
}

// Example function with strong typing for events
function emitTandaUpdated(payload: TandaUpdatedPayload) {
    eventBus.emit('tandaUpdated', payload);
}
