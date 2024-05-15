import { eventBus } from "../events/event-bus";
export type Action = {
    id: string;
  image: string;
  alt: string;
  sortOrder: number;
};

interface State {
    isPlaying: boolean,
    isPlayingOnHeadphones: boolean,
    actions: Set<Action>
}

class TrackElement extends HTMLElement {
  private isPlaying = false;
  private isPlayingOnHeadphones = false;
  private actions = new Set();

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

    this.shadowRoot!.querySelector(".actions")!.addEventListener(
      "click",
      this.handleTargetButtonClick.bind(this)
    );

    this.shadowRoot!.querySelector("main")!.addEventListener(
      "click",
      this.handleTrackClick.bind(this)
    );
  }

  addAction(action: Action) {
    this.actions.add(action);
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
        this.shadowRoot!.querySelector("#headphones")!.classList.remove("playing");
    }
    eventBus.emit('playOnHeadphones', { element: this, playing: this.isPlayingOnHeadphones })
  }

  handleTargetButtonClick(event: Event) {
    const targetButton = (event.target as HTMLElement)?.closest(
      "button.target"
    );
    if (targetButton) {
      event.stopPropagation();
      event.preventDefault();
      const emitEvent = new CustomEvent("clickedTargetTrack", {
        detail: { actionId: targetButton.id, element: this },
        bubbles: true,
      });
      this.dispatchEvent(emitEvent);
    }
  }

  handleTrackClick() {
    const trackId = this.getAttribute("trackid");
    if (trackId) {
      const event = new CustomEvent("clickedTrack", {
        detail: this,
        bubbles: true,
      });
      this.dispatchEvent(event);
    }
  }

  render() {
    this.shadowRoot!.innerHTML = `
        <style>
        * {
            background-color:transparent;
        }
        .track {
            padding: 0.4rem;
        }
        header {
            display: flex;
            flex-direction: row;
            align-items: center;
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
        :host-context(track-element:nth-child(1n).playing) article{
            border: solid 2px orange;
            display: block;
            border-radius: 5px;
            background-color: #ffe000a6;
        }
        :host-context(track-element.selected) {
            border: dashed 2px orange;
            display: block;
            border-radius: 5px;
            background-color: #fffbdea6;
            margin: 1rem;
        }
        :host-context(track-element:nth-child(2n)) article{
            background-color: #ffffffa6;
        }
        :host-context(track-element:nth-child(2n+1)) article{
            background-color: #f9ede1a6;
        }
        :host-context(track-element.target) button.target {
            display: block;
        }
        button.target {
            display: none;
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
        section.actions {
            float: right;
        }
        #headphones {
            border: solid 2px transparent;
        }
        #headphones.playing {
            background-color: #00800040;
            border: solid 2px red;
            border-radius: 100%;
        }
    </style>
    <article class="track">
        <section class="actions">
        ${([...this.actions] as Action[])
          .sort((a: Action, b: Action) => {
            return a.sortOrder - b.sortOrder;
          })
          .map((action) => {
            return `<button id="${action.id}"><img src="${action.image}" alt="${action.alt}"></button>`;
          })}
        </section>
        <header>
            <button id="headphones" class="${
                this.isPlayingOnHeadphones ? "playing" : ""
            }">
                <img src="./icons/headphones-icon.png" alt="Listen on headphones">
            </button><h2>${this.getAttribute("title")}</h2>
        </header>
        <main>
            <p>                
                <span class='style'>${this.getAttribute("style")}</span>
                By <span class='artist'>${this.getAttribute("artist")}</span>
                Year <span class='year'>${this.getAttribute("year")}</span>
                Duration: <span class='duration'>${this.getAttribute(
                  "duration"
                )}</span>
            </p>
        </main>
    </article>
        `;
  }
}

customElements.define("track-element", TrackElement);

export { TrackElement };
