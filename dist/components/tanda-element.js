import { eventBus } from "../events/event-bus";
class TandaComponent extends HTMLElement {
    connectedCallback() {
        this.innerHTML = `<p>Tanda Component</p>`;
        eventBus.on("songAdded", (song) => {
            console.log("A new song was added elsewhere:", song);
        });
        // Emit an event
        eventBus.emit("songAdded", {
            title: "Another from Tanda New Song",
            artist: "Some Artist",
        });
    }
}
customElements.define("tanda-element", TandaComponent);
