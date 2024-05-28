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
  private editable: boolean = false;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.draggable = true;
    this.dataset.id = "T-" + String(nextId++);
    this.render();

    if (this.dataset.title !== "place holder") {
      this.shadowRoot!.querySelector("#headphones")!.addEventListener(
        "click",
        this.playOnHeadphones.bind(this)
      );
      this.shadowRoot!.querySelector(".track")!.addEventListener(
        "click",
        this.handleTrackClick.bind(this)
      );
    }
  }

  enableEdit(state: boolean) {
    this.editable = state;
    this.render();
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

  setPlaying(state: boolean) {
    this.isPlaying = state;
    this.draggable = !this.isPlaying;
    if (this.isPlaying) {
      this.classList.add("playing");
      this.shadowRoot!.querySelector("article")?.classList.add("playing");
    } else {
      this.classList.remove("playing");
      this.shadowRoot!.querySelector("article")?.classList.remove("playing");
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
            color: var(--track-text-color);
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
          border-radius: 5px;
      }
        article.playing {
            border: solid 2px orange;
            background-color: #f9ede191 !important;
        }
        :host-context(track-element:nth-child(2n)) article{
            background-color: #cececea6;
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
        #track-title {
          font-size: 1.1rem;
        }
    </style>
    <article class="track ${this.isPlaying ? "playing" : ""}">
        <header>
        ${
          this.dataset.title !== "place holder"
            ? `<button id="headphones" class="${
                this.isPlayingOnHeadphones ? "playing" : ""
              }">
            <img src="./icons/headphones.png" alt="Listen on headphones">
        </button>`
            : "<span></span>"
        }
        <h2>
        <!--${this.dataset.tandaId ? this.dataset.tandaId : ""}-->
        ${
          this.tagName === "CORTINA-ELEMENT" ? "(Cortina) " : ""
        } <span id="track-title">${this.dataset.title}</span></h2>
            <div id="floated">
              ${
                this.editable || !/undefined|null/.test(this.dataset.bpm!)
                  ? `<span>BPM: <span id="bpmValue">${this.dataset.bpm}</span></span>`
                  : ""
              }
              ${
                this.editable || !/undefined|null/.test(this.dataset.year!)
                  ? `<span>Year: <span id="yearValue">${this.dataset.year}</span></span>`
                  : ""
              }
              <span>Duration: <span class='duration'>${
                this.dataset.duration
              }</span></span>                
            </div>
        </header>
        <main>
            <p>                
                ${
                  this.editable || !(this.dataset.style == "undefined")
                    ? `<span><span id="styleValue" class='style'>${this.dataset.style}</span></span>`
                    : ""
                }
                <span><span id="artistValue" class='artist'>${
                  this.dataset.artist
                }</span></span>
                ${
                  this.editable || !/undefined|null/.test(this.dataset.notes!)
                    ? `<span><span id="notesValue">${this.dataset.notes}</span></span>`
                    : ""
                }
                </p>
        </main>
    </article>
        `;

    const editableElements: { [key:string]: string} = {
      "track-title" : 'track.metadata.tags.title',
      "bpmValue" : 'track.metadata.tags.title',
      "yearValue" : 'track.metadata.tags.year',
      "styleValue" : 'track.metadata.style',
      "artistValue" : 'track.metadata.tags.artist',
      "notesValue" : 'track.metadata.tags.notes',
    };
    Object.keys(editableElements).forEach((item) => {
      let element = this.shadowRoot!.querySelector("#" + item)! as HTMLElement;
      if (element) {
        element.contentEditable = this.editable ? "true" : "false";
        if (this.editable) {
          element.addEventListener("input", () => {
            console.log("Content changed:", element.innerHTML);
          });
          element.addEventListener("blur", () => {
            console.log("Editing finished:", element.innerHTML);
            eventBus.emit('changeTrackData', {
              field: editableElements[item],
              value: element.textContent,
              trackId: this.dataset.trackId,
              type: this.tagName == 'CORTINA-ELEMENT' ? 'cortina' : 'track'
            })
          });
        }
      }
    });
  }
}

class TrackElement extends BaseTrackElement {}
class CortinaElement extends BaseTrackElement {}
customElements.define("track-element", TrackElement);
customElements.define("cortina-element", CortinaElement);

export { TrackElement, CortinaElement };
