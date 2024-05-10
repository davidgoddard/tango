// Example usage in a component file
import { eventBus } from "./events/event-bus";
import "./components/tanda-element";
document.addEventListener("DOMContentLoaded", () => {
    document.body.appendChild(document.createElement("tanda-element"));
    // Subscribe to an event
    eventBus.on("songAdded", (song) => {
        console.log("A new song was added:", song);
    });
    // Emit an event
    eventBus.emit("songAdded", { title: "New Song", artist: "Some Artist" });
});
