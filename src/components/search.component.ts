import { eventBus } from "../events/event-bus";

export class SearchComponent {
  private searchInput: HTMLInputElement;
  private styleFilter: HTMLSelectElement;
  private searchButton: HTMLButtonElement;

  constructor(private container: HTMLElement) {
    this.render();
    this.searchInput = container.querySelector('#searchInput')!;
    this.styleFilter = container.querySelector('#styleFilter')!;
    this.searchButton = container.querySelector('#searchButton')!;
    this.searchButton.addEventListener('click', this.handleSearch.bind(this));
  }

  private render() {
    const template = document.createElement('template')
    template.innerHTML = `
      <div>
        <input type="text" id="searchInput" placeholder="Enter search query" />
        <select id="styleFilter">
          <option value="">All Styles</option>
          <option value="rock">Rock</option>
          <option value="pop">Pop</option>
          <!-- Add more options if needed -->
        </select>
        <button id="searchButton">Search</button>
      </div>`
    this.container.appendChild(template.content.cloneNode(true));
  }

  private handleSearch() {
    const query = this.searchInput.value;
    const selectedStyle = this.styleFilter.value;
    // Emit query event to event bus
    const searchData = { query, selectedStyle };
    eventBus.emit('query', searchData);
  }
}