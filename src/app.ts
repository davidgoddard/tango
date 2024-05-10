// Example usage in a component file

import { eventBus } from "./events/event-bus";
import "./components/tanda-element";
import { Player, PlayerOptions, Track } from './services/player'

document.addEventListener("DOMContentLoaded", () => {

    // let systemLowestGain: Track = {};
    let fadeRate = 3;

    const playerConfig: PlayerOptions = {
        ctx: null,
        // systemLowestGain,
        fadeRate
    }
    const player = new Player(playerConfig)
  document.body.appendChild(document.createElement("tanda-element"));

  // Subscribe to an event
  eventBus.on("songAdded", (song) => {
    console.log("A new song was added:", song);
  });

  // Emit an event
  eventBus.emit("songAdded", { title: "New Song", artist: "Some Artist" });
});
