// search-element.js
class SearchElement extends HTMLElement {
    constructor() {
        super();

        // Create a shadow root
        this.attachShadow({ mode: 'open' });

        // Define the template
        this.shadowRoot.innerHTML = `
        <style>
          /* Add CSS styles here */
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
            background-color: #f0f0f0;
          }
          .content {
            border: 1px solid #ccc;
            padding: 16px;
          }
          .hidden {
            display: none;
          }
        </style>
        <div>
          <label for="search-input">Search:</label>
          <input type="text" id="search-input" placeholder="Enter search string">
          <label for="filter-select">Style:</label>
          <select id="filter-select">
            <option value="all">All</option>
            <option value="rock">Rock</option>
            <option value="pop">Pop</option>
            <option value="jazz">Jazz</option>
            <!-- Add more options as needed -->
          </select>
        </div>
        <div class="tab-container">
          <div id="tracks-tab" class="tab active">Tracks (<span id="tracks-count">0</span>)</div>
          <div id="tandas-tab" class="tab">Tandas (<span id="tandas-count">0</span>)</div>
        </div>
        <div id="tracks-content" class="content">
          <!-- Content for tracks -->
        </div>
        <div id="tandas-content" class="content hidden">
          <!-- Content for tandas -->
        </div>`;

        // Initialize search input and filter select
        this.searchInput = this.shadowRoot.getElementById('search-input');
        this.filterSelect = this.shadowRoot.getElementById('filter-select');

        // Initialize tabs and content sections
        this.tracksTab = this.shadowRoot.getElementById('tracks-tab');
        this.tandasTab = this.shadowRoot.getElementById('tandas-tab');
        this.tracksContent = this.shadowRoot.getElementById('tracks-content');
        this.tandasContent = this.shadowRoot.getElementById('tandas-content');

        // Initialize counts
        this.tracksCount = this.shadowRoot.getElementById('tracks-count');
        this.tandasCount = this.shadowRoot.getElementById('tandas-count');

        // Add event listeners
        this.searchInput.addEventListener('input', this.handleSearch.bind(this));
        this.filterSelect.addEventListener('change', this.handleFilter.bind(this));
        this.tracksTab.addEventListener('click', () => this.showContent('tracks'));
        this.tandasTab.addEventListener('click', () => this.showContent('tandas'));

        // Initialize counts
        this.tracksCount.textContent = '0';
        this.tandasCount.textContent = '0';
    }

    focus() {
        this.searchInput.focus();
    }

    // Method to handle search input
    handleSearch() {
        const searchText = this.searchInput.value.trim();
        const filterValue = this.filterSelect.value;
        this.dispatchEvent(new CustomEvent('search', { detail: { searchText, filterValue } }));
    }

    // Method to handle filter selection
    handleFilter() {
        this.handleSearch();
    }

    results(resultset) {
        this.tracksCount.textContent = resultset.tracks.length;
        this.tandasCount.textContent = resultset.tandas.length;
        this.tracksContent.innerHTML = resultset.tracks.map(track => `<track-element 
            trackid="${track.id}"
            title="${track.metadata?.tags?.title || track.relativeFileName}"
            artist="${track.metadata?.tags?.artist || 'unknown'}"
            year="${track.metadata?.tags?.year || 'unknown'}"
        ></track-element>`).join('')
        this.tandasContent.innerHTML = JSON.stringify(resultset.tandas);        

        // Mark all results as something that can be added to the scratch-pad

        const tracks = this.tracksContent.querySelectorAll('track-element');
        for ( const track of tracks ){
            const button = document.createElement('button')
            button.innerHTML = '<img src="./icons/notepad.png" alt="copy to scratch pad">'
            button.addEventListener('click', ()=>{
                this.dispatchEvent(new CustomEvent('moveToScratchPad', { detail: track }));
            })
            track.shadowRoot.querySelector('article .actions').appendChild(button)
        }
    }

// Method to show content based on tab clicked
showContent(tab) {
    if (tab === 'tracks') {
        this.tracksTab.classList.add('active');
        this.tandasTab.classList.remove('active');
        this.tracksContent.classList.remove('hidden');
        this.tandasContent.classList.add('hidden');
    } else {
        this.tracksTab.classList.remove('active');
        this.tandasTab.classList.add('active');
        this.tracksContent.classList.add('hidden');
        this.tandasContent.classList.remove('hidden');
    }
}
  }

customElements.define('search-element', SearchElement);
