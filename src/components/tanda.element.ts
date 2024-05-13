class TandaElement extends HTMLElement {
  private expanded: boolean = false;

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.render();
  }

  private timeStringToSeconds(timeString: string | null): number | string {
    if (timeString) {
      const parts = timeString.split(":").map(Number);
      let seconds = 0;

      if (parts.length === 3) {
        seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
      } else if (parts.length === 2) {
        seconds = parts[0] * 60 + parts[1];
      } else {
        return "?";
      }

      return seconds;
    } else {
      return "";
    }
  }

  private toTime(seconds: number): string {
    if (isNaN(seconds)) return "?";

    let minutes = Math.floor(seconds / 60);
    let hours = Math.floor(minutes / 60);

    seconds %= 60;
    minutes %= 60;

    const formattedSeconds = seconds < 10 ? "0" + seconds : seconds;
    const formattedMinutes = minutes < 10 ? "0" + minutes : minutes;

    const parts = [];
    if (hours > 0) {
      parts.push(hours);
      parts.push(formattedMinutes);
    } else {
      parts.push(minutes);
    }
    parts.push(formattedSeconds);

    return parts.join(":");
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

  private render() {
    const tracks = Array.from(this.querySelectorAll("track-element"));
    const cortina = Array.from(this.querySelectorAll("cortina-element"));
    const titles = tracks
      .map((track) => track.getAttribute("title"))
      .filter((x) => x);
    const titleSet = new Set(titles);
    const artists = new Set(
      tracks.map((track) => track.getAttribute("artist")).filter((x) => x)
    );
    const years = tracks
      .map((track) => track.getAttribute("year"))
      .filter((x) => x)
      .map((year) => year!.substring(0, 4));
    const styles = new Set(
      tracks.map((track) => track.getAttribute("style"))?.filter((x) => x)
    );
    if (styles.size == 0) {
      console.log(
        "Getting tanda style from attribute",
        this.getAttribute("style")
      );
      styles.add(this.getAttribute("style"));
    }
    let duration = 0;
    tracks.forEach(
      (track) =>
        (duration += this.timeStringToSeconds(track.getAttribute("duration")) as number)
    );
    const summary = `(${titles.length} Tracks; Duration: ${this.toTime(
      duration
    )}):  ${
      [...titleSet][0] == "place holder" ? "Place Holder" : ""
    } ${this.findMinMaxYears(years)} ${[...artists].join(", ")}`;

    const track = cortina[0];
    let cortinaArtist;
    let cortinaTitle;
    if (track) {
      cortinaTitle = track.getAttribute("title")!;
      cortinaArtist = track.getAttribute("artist")!;
      if (cortinaTitle.length > 15)
        cortinaTitle = cortinaTitle.substring(0, 15) + "...";
      if (cortinaArtist.length > 15)
        cortinaArtist = cortinaArtist.substring(0, 15) + "...";
    } else {
      cortinaTitle = "Unknown";
      cortinaArtist = "";
    }

    const cortinaSummary =
      cortinaTitle.length > 0
        ? `<button>${cortinaTitle}${
            cortinaArtist ? "<br/>" + cortinaArtist : ""
          }</button>`
        : "";

    this.shadowRoot!.innerHTML = `
            <style>
                .summary { cursor: pointer; display: grid; grid-template-columns: 40px auto;}
                .summary header { display: flex; justify-content: center }
                .summary header span {
                    font-size: 1.5rem;
                    font-weight: bold;
                }
                .details { display: none; }
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
                    display: block;
                }
                #container.moving article {
                    border: dashed 2px red;
                    margin: 1rem;
                }
                #container.empty article {
                    border: dashed 2px green;
                    margin: 1rem;
                }
                :host-context(tanda-element.target) #actions button {
                    display: block;
                }
                #actions button.target {
                    display: none;
                }
                button img {
                    height: 20px;
                    width: 20px;
                }
                :host-context(.playing) #container article {
                    border: dashed 2px #cf8805;
                    display: block;
                    border-radius: 10px;
                    margin: 1rem!important;
                }
                :host-context(.played) {
                    display: block;
                    background-color: #777;
                    border-radius: 10px;
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
                }
            </style>
            <div id="container">
                <article>
                    <div id="toggle" class="summary">
                        <header>
                            <span>${
                              styles.size == 1
                                ? [...styles]?.[0]?.charAt(0)?.toUpperCase()
                                : "?"
                            }</span>
                        </header>
                        <main>
                                                     
                            <section>
                                <div class="cortinaControls">
                                    <button class="playAll"><img src="./icons/player_play 2.png" alt="Play whole cortina"></button>
                                    <button class="stopPlayAll"><img src="./icons/player_stop 2.png" alt="Play whole cortina"></button>
                                </div>
                                ${cortinaSummary}
                                <section id="actions"></section>
                            </section>

                            <span></span>${summary}   
                        </main>
                    </div>
                    <div class="details">   
                        <slot></slot>                 
                    </div>
                </article>
            </div>
        `;
    this.shadowRoot!
      .querySelector("#toggle main")!
      .addEventListener("click", () => this.toggleExpand());


    this.shadowRoot!
      .querySelector(".playAll")!
      .addEventListener("click", this.notifyPlayAll.bind(this));

    this.shadowRoot!
      .querySelector(".stopPlayAll")!
      .addEventListener("click", this.notifyStopPlayAll.bind(this));
  }

  private toggleExpand() {
    this.expanded = !this.expanded;
    let details = this.shadowRoot!.querySelector(".details");
    let span = this.shadowRoot!.querySelector("main span");
    if (this.expanded) {
      details!.classList.add("expanded");
      span!.textContent = "►";
    } else {
      details!.classList.remove("expanded");
      span!.textContent = "";
    }
  }

  private notifyPlayAll() {
    const event = new CustomEvent("playFullCortina", { bubbles: true });
    this.dispatchEvent(event);
  }

  private notifyStopPlayAll() {
    const event = new CustomEvent("stopPlayFullCortina", { bubbles: true });
    this.dispatchEvent(event);
  }
}

customElements.define("tanda-element", TandaElement);

export { TandaElement };