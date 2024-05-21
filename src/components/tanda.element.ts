import { formatTime, timeStringToSeconds } from "../services/utils";

let nextId = 1;

export type Action = {
  id: string;
  image: string;
  alt: string;
  sortOrder: number;
};

class TandaElement extends HTMLElement {
  private expanded: boolean = false;
  private isPlaying: boolean = false;
  private hasPlayed: boolean = false;
  
  private handleExtendBound: EventListener;
  private handleShrinkBound: EventListener;
  private handleToggleBound: EventListener;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.handleExtendBound = this.handleExtend.bind(this);
    this.handleShrinkBound = this.handleShrink.bind(this);
    this.handleToggleBound = this.toggleExpand.bind(this);
  }

  connectedCallback() {
    this.dataset.id = "Tanda-" + String(nextId++);
    this.render(true);
    this.draggable = true;
  }

  disconnectedCallback() {
    this.removeEventListeners();
  }

  private handleExtend(event: any) {
    const newTrack = document.createElement('track-element');
    newTrack.dataset.style = this.dataset.style;
    newTrack.dataset.title = 'place holder';
    this.appendChild(newTrack);
    this.render();
  }

  private handleShrink(event: any) {
    let n = this.children.length;
    if (n > 0) this.removeChild(this.children[n - 1]);
    this.render();
  }

  private findMinMaxYears(years: (string | null)[]): string {
    const numericYears = years
      .map((year) => (year ? Number(year) : NaN))
      .filter((year) => !isNaN(year));
    const hasUnknown = years.some((year) => !year);

    if (numericYears.length > 0) {
      const minYear = Math.min(...numericYears);
      const maxYear = Math.max(...numericYears);

      if (minYear !== maxYear) {
        return `(${[
          hasUnknown ? "Unknown" : "",
          "Years " + minYear + " to " + maxYear,
        ]
          .filter((x) => x)
          .join(", ")})`;
      } else {
        return `(${[hasUnknown ? "Unknown" : "", "Year " + minYear]
          .filter((x) => x)
          .join(", ")})`;
      }
    } else {
      return "";
    }
  }

  public setPlaying(state: boolean) {
    this.isPlaying = state;
    if (this.isPlaying) {
      this.classList.add('playing');
      this.draggable = false;
      this.shadowRoot!.querySelector('#container article')?.classList.add('playing');
    } else {
      this.classList.remove('playing');
      this.draggable = true;
      this.shadowRoot!.querySelector('#container article')?.classList.remove('playing');
    }
  }

  public setPlayed(state: boolean) {
    this.hasPlayed = state;
    if (this.hasPlayed) {
      this.classList.add('played');
      this.draggable = false;
      this.shadowRoot!.querySelector('#container article')?.classList.add('played');
    } else {
      this.classList.remove('played');
      this.draggable = true;
      this.shadowRoot!.querySelector('#container article')?.classList.remove('played');
    }
  }

  private addEventListeners() {
    this.shadowRoot!.querySelector('#extendTanda')!.addEventListener('click', this.handleExtendBound);
    this.shadowRoot!.querySelector('#shrinkTanda')!.addEventListener('click', this.handleShrinkBound);
    this.shadowRoot!.querySelector("#toggle main")!.addEventListener("click", this.handleToggleBound);
  }

  private removeEventListeners() {
    this.shadowRoot!.querySelector('#extendTanda')!.removeEventListener('click', this.handleExtendBound);
    this.shadowRoot!.querySelector('#shrinkTanda')!.removeEventListener('click', this.handleShrinkBound);
    this.shadowRoot!.querySelector("#toggle main")!.removeEventListener("click", this.handleToggleBound);
  }

  public render(firstCall: boolean = false) {
    if ( !firstCall ) this.removeEventListeners();
    console.log('Rendering tanda', this);
    const tracks = Array.from(this.querySelectorAll("track-element")) as HTMLElement[];
    const cortina = Array.from(this.querySelectorAll("cortina-element")) as HTMLElement[];
    const titles = [...tracks, ...cortina]
      .map((track) => track.dataset.title)
      .filter((x) => x);
    const titleSet = new Set(titles);
    const artists = new Set(
      tracks.map((track) => track.dataset.artist).filter((x) => x)
    );
    const years = tracks
      .map((track) => track.dataset.year)
      .filter((x) => x)
      .map((year) => year!.substring(0, 4));
    const styles = new Set(
      tracks.map((track) => track.dataset.style)?.filter((x) => x)
    );
    if (styles.size == 0) {
      styles.add(this.dataset.style);
    }
    let duration = 0;
    tracks.forEach(
      (track) =>
        (duration += timeStringToSeconds(track.dataset.duration!) as number)
    );
    const summary = `(${tracks.length} Tracks; Duration: ${formatTime(
      duration
    )}):  ${[...titleSet].find(title => title == "place holder") ? "Place Holder" : ""
      } ${this.findMinMaxYears(years)} ${[...artists].join(", ")}`;

    const track = cortina[0];
    let cortinaArtist;
    let cortinaTitle;
    if (track) {
      cortinaTitle = track.dataset.title!;
      cortinaArtist = track.dataset.artist!;
      if (cortinaTitle?.length > 15)
        cortinaTitle = cortinaTitle.substring(0, 15) + "...";
      if (cortinaArtist?.length > 15)
        cortinaArtist = cortinaArtist.substring(0, 15) + "...";
    } else {
      cortinaTitle = "Unknown";
      cortinaArtist = "";
    }

    const cortinaSummary =
      cortinaTitle.length > 0
        ? `<button class="cortinaName">${cortinaTitle}</button>`
        : "";

    this.shadowRoot!.innerHTML = `
            <style>
                .summary { cursor: pointer; display: grid; grid-template-columns: 40px auto;}
                .summary header { display: flex; justify-content: center }
                .summary header span {
                    font-size: 1.5rem;
                    font-weight: bold;
                }
                .details { 
                  height: 0px; 
                  overflow-y: hidden;
                  transition: height 1s ease-in-out;
                }
                #container {
                  width: 100%;
                }
                #container article.playing {
                  border: solid 2px orange;
                }
                #container article.played {
                  background-color: grey;
                }
                #container article {
                    border: solid 2px #ccc;
                    border-radius: 7px;
                    margin-top: 0rem;
                    margin-bottom: 0rem;
                    padding: 0.2rem;
                }
                #actions {
                    display: flex;
                    flex-direction: row;
                    justify-content: flex-end;
                }
                #actions button {
                    display: flex;
                    align-self: center;
                    padding: 0px;
                    margin-left: 10px;
                    border: none;
                    background: transparent;
                    height: 20px;
                    width: 20px;
                }
                .details.expanded {
                    height: auto;
                }
                #container.moving article {
                    border: dashed 2px red;
                    margin: 1rem;
                }
                #container.empty article {
                    border: dashed 2px green;
                    margin: 1rem;
                }
                // :host-context(tanda-element.target) #actions button {
                //     display: block;
                // }
                #actions button.target {
                    display: none;
                }
                button img {
                    height: 20px;
                    width: 20px;
                }
                // #container article {
                //     border: dashed 2px #cf8805;
                //     display: block;
                //     border-radius: 10px;
                //     margin: 1rem!important;
                // }
                // :host-context(.played) {
                //     display: block;
                //     background-color: #777;
                //     border-radius: 10px;
                // }
                .cortinaControls {
                    display: none;
                }
                .cortinaControls button {
                    border: none;
                    background-color:transparent;
                }
                .cortinaControls img {
                    height: 40px;
                    width: 40px;
                }
                .cortinaControls.active {
                    display: block;
                }

                main > section {
                    float: right;
                    text-align: right;
                    min-width: 8rem;
                }
                main > section > button {
                    width: 100%;
                    margin-bottom: 0.3rem;
                }
                button.cortinaName {
                    // width: 100px; /* Set the desired width */
                    // white-space: nowrap;
                    // overflow: hidden;
                    // text-overflow: ellipsis;
                    // direction: rtl;
                    // text-align: left; /* This makes sure that the text starts from the left when it's in RTL mode */
                }
                #extensions {
                  display: flex;
                  justify-content: end;
                }
                #extensions.hidden {
                  display: none;
                }
                #extensions button {
                  font-size: 1rem;
                  border-radius: 50%;
                  border: transparent;
                  background-color: blue;
                  color: white;
                  font-weight: bolder;
                  height: 20px;
                  width: 20px;
                  margin: 0.2rem;
                }
                #extendTanda {
                  padding: 0px;
                  line-height: 1.4rem;
                }
                #shrinkTanda {
                  padding: 0px;
                  line-height: 0.3rem;
                }
            </style>
            <div id="container" class="${this.hasPlayed ? 'played' : ''}">
                <article>
                    <div id="toggle" class="summary">
                        <header>
                            <span>${styles.size == 1
        ? [...styles]?.[0]?.charAt(0)?.toUpperCase()
        : "?"
      }</span>
                        </header>
                        <main>
                                                     
                            <section>
                                ${cortinaSummary}
                                <section id="actions"></section>
                            </section>

                            <span></span>${summary}   
                        </main>
                    </div>
                    <div class="details ${this.expanded ? "expanded" : ""}">   
                        <slot></slot>                 
                    </div>
                    <section id="extensions" class="${!this.expanded ? "hidden" : ""}">
                      <button id="extendTanda">+</button>
                      <button id="shrinkTanda">-</button>
                    </section>
                </article>
            </div>
        `;

    this.addEventListeners();
  }

  private toggleExpand() {
    this.expanded = !this.expanded;
    let details = this.shadowRoot!.querySelector(".details");
    let extensions = this.shadowRoot!.querySelector("#extensions");
    let span = this.shadowRoot!.querySelector("main span");
    if (this.expanded) {
      details!.classList.add("expanded");
      extensions!.classList.remove("hidden");
      span!.textContent = "►";
    } else {
      details!.classList.remove("expanded");
      extensions!.classList.add("hidden");
      span!.textContent = "";
    }
  }

}

customElements.define("tanda-element", TandaElement);

export { TandaElement };
