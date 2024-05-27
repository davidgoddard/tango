import { Tanda, Track } from "../data-types";
import { eventBus } from "../events/event-bus";
import { IndexedDBManager } from "../services/database";
import { addDragDropHandlers } from "../services/drag-drop.service";
import { renderTrackDetail } from "../services/utils";

export interface SearchResult {
  search?: HTMLElement;
  tracks: any[];
  tandas: any[];
  queryNo: number;
}

export class SearchElement extends HTMLElement {
  private searchInput: HTMLInputElement;
  private filterSelect: HTMLSelectElement;
  private tracksTab: HTMLElement;
  private tandasTab: HTMLElement;
  private tracksContent: HTMLElement;
  private tandasContent: HTMLElement;
  private tracksCount: HTMLElement;
  private tandasCount: HTMLElement;
  private dbManager?: IndexedDBManager;
  private queryCount: number = 0;

  constructor() {
    super();

    // Create a shadow root
    this.attachShadow({ mode: "open" });

    // Define the template
    this.shadowRoot!.innerHTML = `
        <style>
          section {
            background-color: var(--background-color);
          }
          .tab-container {
            display: flex;
          }
          .tab {
            flex: 1;
            text-align: center;
            cursor: pointer;
            padding: 8px;
            border: 1px solid #ccc;
            border-bottom: none;
          }
          .tab.active {
            background-color: var(--tab-active);
          }
          .results {
            border: 1px solid #ccc;
            padding: 16px;
          }
          .hidden {
            display: none;
          }
          section {
            display: grid;
            grid-template-rows: auto auto 1fr;
          }
          .scrollable {
            overflow-y: auto;
          }
          track-element, cortina-element, tanda-element {
            display: block;
          }
          .drop-target {
            outline: dashed 2px green;
            z-index: 99;
          }
          
        </style>
        <section>
          <div>
            <label for="search-input">Search:</label>
            <input type="text" id="search-input" placeholder="Enter search string">
            <label for="filter-select">Style:</label>
            <select id="filter-select">
              <option value="all">All</option>
              <option value="rock / pop">Rock / Pop</option>
              <option value="jazz">Jazz</option>
              <option value="tango">Tango</option>
              <option value="waltz">Waltz</option>
              <option value="milonga">Milonga</option>
              <!-- Add more options as needed -->
            </select>
          </div>
          <div class="tab-container">
            <div id="tracks-tab" class="tab active">Tracks (<span id="tracks-count">0</span>)</div>
            <div id="tandas-tab" class="tab">Tandas (<span id="tandas-count">0</span>)</div>
          </div>
          <div class="scrollable">
            <div id="tracks-content" class="results ">
              <!-- Content for tracks -->
            </div>
            <div id="tandas-content" class="results hidden">
              <!-- Content for tandas -->
            </div>
          </div>
        <section>`;

    // Initialize elements
    this.searchInput = this.shadowRoot!.querySelector("#search-input")!;
    this.filterSelect = this.shadowRoot!.querySelector("#filter-select")!;
    this.tracksTab = this.shadowRoot!.querySelector("#tracks-tab")!;
    this.tandasTab = this.shadowRoot!.querySelector("#tandas-tab")!;
    this.tracksContent = this.shadowRoot!.querySelector("#tracks-content")!;
    this.tandasContent = this.shadowRoot!.querySelector("#tandas-content")!;
    this.tracksCount = this.shadowRoot!.querySelector("#tracks-count")!;
    this.tandasCount = this.shadowRoot!.querySelector("#tandas-count")!;

    // Add event listeners
    this.searchInput.addEventListener("input", this.handleSearch.bind(this));
    this.filterSelect.addEventListener("change", this.handleFilter.bind(this));
    this.tracksTab.addEventListener("click", () => this.showContent("tracks"));
    this.tandasTab.addEventListener("click", () => this.showContent("tandas"));

    addDragDropHandlers(this.tandasContent);
    addDragDropHandlers(this.tracksContent);

    // Initialize counts
    this.tracksCount.textContent = "0";
    this.tandasCount.textContent = "0";

    eventBus.on("queryResults", this.results.bind(this));
  }

  public setDB(dbManager: IndexedDBManager): void {
    this.dbManager = dbManager;
  }

  public focus() {
    this.searchInput.focus();
  }

  // Method to handle search input
  private handleSearch() {
    const searchData = this.searchInput.value.trim();
    const selectedStyle = this.filterSelect.value;
    eventBus.emit("query", { queryNo: ++this.queryCount, search: this, searchData, selectedStyle });
  }

  // Method to handle filter selection
  private handleFilter() {
    this.handleSearch();
  }

  // Method to update search results
  public async results(resultset: SearchResult) {
    if ( resultset.search !== this ) return;
    if ( resultset.queryNo !== this.queryCount ) return;
    this.tracksCount.textContent = resultset.tracks.length.toString();
    this.tandasCount.textContent = resultset.tandas.length.toString();
    this.tracksContent.innerHTML = resultset.tracks
      .map((track) => renderTrackDetail(0, track, "track"))
      .join("");

    let tandasHTML = "";
    for (let idx = 0; idx < resultset.tandas.length; idx++) {
      const tanda = resultset.tandas[idx];
      let html = "";
      if (tanda.cortina) {
        let track = (await this.dbManager!.getDataByName(
          "cortina",
          tanda.cortina
        )) as Track;
        if ( track ){
          html += renderTrackDetail(idx, track, "cortina");
        }
      }
      const styles = new Set();
      if (tanda.tracks) {
        for (let trackName of tanda.tracks) {
          let track = (await this.dbManager!.getDataByName(
            "track",
            trackName
          )) as Track;
          styles.add(track.metadata.style)
          html += renderTrackDetail(idx, track, "track");
        }
      }
      tandasHTML += `<tanda-element data-tanda-id="${idx}" data-style='${styles.size !== 1 ? 'unknown' : [...styles][0]}'>
                          ${html}
                      </tanda-element>`;
    }
    this.tandasContent.innerHTML = tandasHTML;

  }

  // Method to show content based on tab clicked
  private showContent(tab: "tracks" | "tandas") {
    if (tab === "tracks") {
      this.tracksTab.classList.add("active");
      this.tandasTab.classList.remove("active");
      this.tracksContent.classList.remove("hidden");
      this.tandasContent.classList.add("hidden");
    } else {
      this.tracksTab.classList.remove("active");
      this.tandasTab.classList.add("active");
      this.tracksContent.classList.add("hidden");
      this.tandasContent.classList.remove("hidden");
    }
  }
}

customElements.define("search-element", SearchElement);
