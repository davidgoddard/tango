import { eventBus } from "../events/event-bus";

class CortinaElement extends HTMLElement {
  private isPlayingOnHeadphones: boolean = false;
  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
    this.shadowRoot!.querySelector("#headphones")!.addEventListener(
      "click",
      this.playOnHeadphones.bind(this)
    );

    this.shadowRoot!.querySelector(".cortina")!.addEventListener(
      "click",
      this.handleTrackClick.bind(this)
    );
  }

  handleTrackClick() {
    const trackId = this.getAttribute("trackid");
    if (trackId) {
      const event = new CustomEvent("clickedTrack", {
        detail: this,
        bubbles: true,
      });
      this.dispatchEvent(event);
      console.log('Sending event', event)
    }
  }

  render() {
    this.shadowRoot!.innerHTML = `
        <style>
        * {
            background-color:transparent;
        }
        .cortina {
            padding: 0.4rem;
        }
        h2 {
            margin: 0px;
            padding: 0px;
            font-size: medium;
        }
        p {
            padding: 0px;
            margin: 0.2rem 0;
        }
        
        button {
            background-color: transparent;
            border: none;
            margin-right: 10px;
        }
        img {
            height: 20px;
            width: 20px;
        }
        
        #headphones {
            border: solid 2px transparent;
        }
        #headphones.playing {
            background-color: #00800040;
            border: solid 2px red;
            border-radius: 100%;
        }
        header {
            display: flex;
            flex-direction:row;
            align-items:center;
        }
        </style>
        <article class="cortina">
          <header>
            <button id="headphones" class="${
              this.isPlayingOnHeadphones ? "playing" : ""
            }"><img src="./icons/headphones-icon.png" alt="Listen on headphones"></button>
            <h2>(Cortina) ${this.getAttribute("title")}</h2>
          </header>
          <main>          
            <p><span class='style'>${this.getAttribute("style") == 'undefined' ?  'Style undefined' : this.getAttribute("style")}</span> By ${this.getAttribute(
      "artist"
    )} Year ${this.getAttribute("year")} Duration: ${this.getAttribute(
      "duration"
    )}</p>
            </main>
        </article>
        `;
  }

  stopPlayingOnHeadphones() {
    this.isPlayingOnHeadphones = false;
    this.shadowRoot!.querySelector("#headphones")!.classList.remove("playing");
  }

  playOnHeadphones(event: Event) {
    event.stopPropagation();
    event.preventDefault();
    console.log("Play on headphones", this);
    if (!this.isPlayingOnHeadphones) {
      this.isPlayingOnHeadphones = true;
      this.shadowRoot!.querySelector("#headphones")!.classList.add("playing");
    } else {
      this.isPlayingOnHeadphones = false;
      this.shadowRoot!.querySelector("#headphones")!.classList.remove(
        "playing"
      );
    }
    eventBus.emit("playOnHeadphones", {
      element: this,
      playing: this.isPlayingOnHeadphones,
    });
  }
}
customElements.define("cortina-element", CortinaElement);
export { CortinaElement };
