import { eventBus } from "../events/event-bus";
import { formatTime, timeStringToSeconds } from "../services/utils";
import { TrackElement } from "./track.element";

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
  private playingTime: string = '';
  private editable: boolean = false;
  
  private handleExtendBound: EventListener;
  private handleShrinkBound: EventListener;
  private handleToggleBound: EventListener;
  private handleChangeCortinaBound: EventListener;
  private handleChangeEditBound: EventListener;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
    this.handleExtendBound = this.handleExtend.bind(this);
    this.handleShrinkBound = this.handleShrink.bind(this);
    this.handleToggleBound = this.toggleExpand.bind(this);
    this.handleChangeCortinaBound = this.handleChangeCortina.bind(this);
    this.handleChangeEditBound = this.handleEdit.bind(this);
  }

  public scheduledPlayingTime(time: string){
    this.playingTime = time;
    let timeField = this.shadowRoot?.querySelector('#play-time')!;
    if ( timeField ) timeField.textContent = this.playingTime;
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
    eventBus.emit('changed-playlist')
  }

  private handleShrink(event: any) {
    let n = this.children.length;
    if (n > 0) this.removeChild(this.children[n - 1]);
    this.render();
    eventBus.emit('changed-playlist')
  }

  private handleChangeCortina(event: any){
    event.preventDefault();
    event.stopPropagation();
    console.log('Change cortina')
    const newEvent = new CustomEvent("changeCortina", {
      detail: this,
      bubbles: true,
    });
    this.dispatchEvent(newEvent);    
  }

  private handleEdit(event: any){
    event.preventDefault();
    event.stopPropagation();
    this.editable = !this.editable;
    console.log('Enable edit')
    const tracks = Array.from(this.querySelectorAll('track-element, cortina-element')) as TrackElement[];
    tracks.forEach((track) => {
      track.enableEdit(this.editable);
    })
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
      this.render();
    } else {
      this.classList.remove('playing');
      this.draggable = true;
      this.shadowRoot!.querySelector('#container article')?.classList.remove('playing');
      this.render();
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
    this.shadowRoot!.querySelector('#changeCortinaButton')!.addEventListener('click', this.handleChangeCortinaBound);
    this.shadowRoot!.querySelector('#editContentButton')!.addEventListener('click', this.handleChangeEditBound);
  }

  private removeEventListeners() {
    this.shadowRoot!.querySelector('#extendTanda')!.removeEventListener('click', this.handleExtendBound);
    this.shadowRoot!.querySelector('#shrinkTanda')!.removeEventListener('click', this.handleShrinkBound);
    this.shadowRoot!.querySelector("#toggle main")!.removeEventListener("click", this.handleToggleBound);
    this.shadowRoot!.querySelector('#changeCortinaButton')!.removeEventListener('click', this.handleChangeCortinaBound);
    this.shadowRoot!.querySelector('#editContentButton')!.removeEventListener('click', this.handleChangeEditBound);
  }

  public collapse(){
    this.expanded = false;
    this.render();
  }
  public render(firstCall: boolean = false) {
    if ( !firstCall ) this.removeEventListeners();
    const tracks = Array.from(this.querySelectorAll("track-element")) as unknown as HTMLElement[];
    const cortina = Array.from(this.querySelectorAll("cortina-element")) as unknown as HTMLElement[];
    const titles = [...tracks, ...cortina]
      .map((track) => track.dataset.title)
      .filter((x) => x);
    const titleSet = new Set(titles);
    console.log("Title Set", titleSet)
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
    let isPlaceHolder = [...titleSet].find(title => title == "place holder");
    const summary = `(${tracks.length} Tracks; Duration: ${formatTime(
      duration
    )}):  ${isPlaceHolder ? "Incomplete!" : ""} ${this.findMinMaxYears(years)} ${[...artists].join(", ")}`;

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
        ? `<button id="changeCortinaButton" class="cortinaName">${cortinaTitle}</button>`
        : "";

    this.shadowRoot!.innerHTML = `
            <style>
                * {
                  color: var(--track-text-color)
                  
                }
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
                  outline: solid 2px orange;
                  margin: 1rem;
                }
                #container article.played {
                  background-color: var(--played-tanda-background);
                  color: var(--played-tanda-foreground);
                }
                #container article.placeHolder {
                  background-color: var(--placeholder-background);
                  outline: dashed 1px red;
                  z-index: 2;
                  position: relative;
                }
                #container article {
                    border: solid 2px #ccc;
                    border-radius: 7px;
                    margin-top: 0rem;
                    margin-bottom: 1px;
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
                    padding: 0.5rem;
                }
                #container.moving article {
                    border: dashed 2px red;
                    margin: 1rem;
                }
                #container.empty article {
                    border: dashed 2px green;
                    margin: 1rem;
                }
                #actions button.target {
                    display: none;
                }
                button img {
                    height: 25px;
                    width: 25px;
                }
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
                    color: black;
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
                  background-color: var(--button-background);
                  color: var(--text-color);
                  font-weight: bolder;
                  margin: 0.2rem;
                  padding: 0.4rem;
                  display: flex;
                }
                #extensions button img {
                  height: 25px;
                  width: 25px;
                }

            </style>
            <div id="container" class="${this.hasPlayed ? 'played' : ''}">
                <span id="play-time">${this.playingTime ? `${this.playingTime}` : ''}</span>
                <article class="${isPlaceHolder ? 'placeHolder' : ''}">
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

                            <span>${summary}</span>   
                        </main>
                    </div>
                    <div class="details ${(this.expanded || this.classList.contains('playing')) ? "expanded" : ""}">   
                        <slot></slot>                 
                    </div>
                    <section id="extensions" class="${!(this.expanded || this.classList.contains('playing')) ? "hidden" : ""}">
                      <button id="editContentButton"><img src="./icons/edit.svg"></button>
                      <button id="extendTanda"><img src="./icons/add.svg"></button>
                      <button id="shrinkTanda"><img src="./icons/subtract.svg"></button>
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
    if (this.expanded) {
      details!.classList.add("expanded");
      extensions!.classList.remove("hidden");
    } else {
      details!.classList.remove("expanded");
      extensions!.classList.add("hidden");
    }
  }

}

customElements.define("tanda-element", TandaElement);

export { TandaElement };
