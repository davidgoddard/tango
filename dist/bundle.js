(() => {
  // dist/events/event-bus.js
  var EventBus = class {
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
      this.handlers[event] = this.handlers[event].filter((h) => h !== handler);
      if (this.handlers[event].length === 0) {
        delete this.handlers[event];
      }
    }
    // Emit an event with a payload
    emit(event, payload) {
      if (!this.handlers[event])
        return;
      for (const handler of this.handlers[event]) {
        handler(payload);
      }
    }
  };
  var eventBus = new EventBus();

  // dist/components/tanda-element.js
  var TandaComponent = class extends HTMLElement {
    connectedCallback() {
      this.innerHTML = `<p>Tanda Component</p>`;
      eventBus.on("songAdded", (song) => {
        console.log("A new song was added elsewhere:", song);
      });
      setTimeout(()=> {
    eventBus.emit("songAdded", {
      title: "Another from Tanda New Song",
      artist: "Some Artist"
    });
  }, 1000)
}
  };
customElements.define("tanda-element", TandaComponent);

// dist/app.js
document.addEventListener("DOMContentLoaded", () => {
  document.body.appendChild(document.createElement("tanda-element"));
  eventBus.on("songAdded", (song) => {
    console.log("A new song was added:", song);
  });
  setTimeout(()=>{
  eventBus.emit("songAdded", { title: "New Song", artist: "Some Artist" });
});},1005)
}) ();
