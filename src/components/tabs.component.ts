import { IndexedDBManager } from "../services/database";
import { SearchElement } from "./search.element";

export class TabsContainer {

  constructor(public container: HTMLElement, public tabs: string[]) {
    this.render();
  }

  render() {
    this.container.innerHTML = `
        <ul class="tab-list" role="tablist">
          ${this.tabs.map((label, idx) => {
            return `<li class="tab ${idx == 0 ? "active" : ""}" id="tab${idx + 1}" role="tab">${label}</li>`;
          }).join('')}
        </ul>
        <div class="tab-panels">
          ${this.tabs.map((label, idx) => {
            return `<div class="tab-panel ${idx == 0 ? "" : "hidden"}" id="tab${idx + 1
              }-panel" role="tabpanel">
            <!-- Content for Tab ${idx + 1} -->
            <search-element></search-element>
          </div>
`;
    }).join('')}
      </div>
`;

  }
}

export class SearchTabsContainer extends TabsContainer {

  constructor(container: HTMLElement, tabs: string[], private dbManager: IndexedDBManager) { 
    super(container, tabs);
  }

  render() {
    super.render();

    // Give each search its own database access

    const searchComponents = Array.from(document.querySelectorAll('search-element')) as unknown as SearchElement[];
    searchComponents.forEach((search) => search.setDB(this.dbManager))

    // Now add clicks to tabs to select
    const tabs = Array.from(this.container.querySelectorAll('.tab')) as unknown as HTMLElement[];
    const panels = Array.from(this.container.querySelectorAll('.tab-panel')) as unknown as HTMLElement[];
    tabs.map((tab: HTMLElement, idx: number) => tab.addEventListener('click', () => {
      tabs.forEach((tab: HTMLElement) => tab.classList.remove('active'))
      tab.classList.add('active')
      const childPanel = panels[idx];
      panels.forEach((panel: HTMLElement) => panel.classList.add('hidden'))
      childPanel.classList.remove('hidden');
      (childPanel?.querySelector('search-element') as HTMLElement)?.focus();
    }))


  }

}

