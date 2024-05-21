import { eventBus } from "../events/event-bus";
export type Action = {
  id: string;
  image: string;
  alt: string;
  sortOrder: number;
};

interface State {
  isPlaying: boolean;
  isPlayingOnHeadphones: boolean;
  actions: Set<Action>;
}

let nextId = 0;

class BaseTrackElement extends HTMLElement {
  private isPlaying = false;
  private isPlayingOnHeadphones = false;
  private actions = new Set();

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.draggable = true;
    this.dataset.id = "T-" + String(nextId++);
    this.render();

    this.shadowRoot!.querySelector("#headphones")!.addEventListener(
      "click",
      this.playOnHeadphones.bind(this)
    );

    this.shadowRoot!.querySelector(".actions")!.addEventListener(
      "click",
      this.handleTargetButtonClick.bind(this)
    );

    this.shadowRoot!.querySelector(".track")!.addEventListener(
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

  setPlaying(state: boolean){
    this.isPlaying = state;
    this.draggable = !this.isPlaying && (this.parentElement!.draggable);
    if ( this.isPlaying ){
      this.classList.add('playing')
      this.shadowRoot!.querySelector('article')?.classList.add('playing')
    } else {
      this.classList.remove('playing')
      this.shadowRoot!.querySelector('article')?.classList.remove('playing')
    }
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
    const trackId = this.dataset.trackId!;
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
            padding: 0 0 0 0.4rem;
        }
        header {
          display: grid;
          grid-template-columns: auto 1fr auto;
          align-items: center;
        }
        span {
          font-size: 0.85rem;
        }
        span span {
          margin-right: 1rem;
        }

        main span span {
          font-size: 1rem;
        }
        h2 {
            margin: 0px;
            padding: 0px;
            font-size: medium;
        }
        p {
            padding: 0px;
            margin: 0px;
        }
        article {
          border: solid 2px transparent;
          display: block;
          border-radius: 5px;
          margin: 2px;
      }
        article.playing {
            border: solid 2px orange;
            background-color: #ffe000a6 !important;
        }
        :host-context(track-element:nth-child(2n)) article{
            background-color: #ffffffa6;
        }
        :host-context(track-element:nth-child(2n+1)) article{
            background-color: #f9ede1a6;
        }
    //     :host-context(track-element.drop-target) article {
    //       outline: dashed 2px green !important;
    //   }
    //   :host-context(cortina-element.drop-target) article {
    //     outline: dashed 2px green !important;
    // }
  
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
        .notes {
          color: lightgray;
        }
    </style>
    <article class="track ${this.isPlaying ? 'playing' : ''}">
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
            <img src="./icons/headphones.png" alt="Listen on headphones">
        </button>
        <h2>${this.dataset.tandaId ? this.dataset.tandaId : ''} ${this.tagName === 'CORTINA-ELEMENT' ? '(Cortina) ' : ''} ${this.dataset.title}</h2>
            <div id="floated">
              ${
                !/undefined|null/.test(this.dataset.bpm!)
                  ? `<span>BPM: <span>${this.dataset.bpm}</span></span>`
                  : ""
              }
              ${
                !/undefined|null/.test(this.dataset.year!)
                  ? `<span>Year: ${this.dataset.year}</span></span>`
                  : ""
              }
              <span>Duration: <span class='duration'>${
                this.dataset.duration
              }</span></span>                
            </div>
        </header>
        <main>
            <p>                
                ${! (this.dataset.style == "undefined") ? `<span><span class='style'>${
                  this.dataset.style}</span></span>` : ''}
                <span><span class='artist'>${this.dataset.artist}</span></span>
                ${
                  !/undefined|null/.test(this.dataset.notes!)
                    ? `<span><span>${this.dataset.notes}</span></span>`
                    : ""
                }
                </p>
        </main>
    </article>
        `;
  }
}

class TrackElement extends BaseTrackElement {};
class CortinaElement extends BaseTrackElement {};
customElements.define("track-element", TrackElement);
customElements.define("cortina-element", CortinaElement);

export { TrackElement, CortinaElement };
