import { SearchComponent } from "./search.component";

export class TabsContainer {
  constructor(private container: HTMLElement, private tabs: string[]) {
    this.render();
  }

  private render() {
    this.container.innerHTML = `
  <ul class="tab-list" role="tablist">
    ${this.tabs.map((label, idx) => {
      return `<li class="tab ${idx == 0 ? "active" : ""}" id="tab${idx + 1}" role="tab">${label}</li>`;
    }).join('')}
  </ul>
  <div class="tab-panels">
    ${this.tabs.map((label, idx) => {
      return `<div class="tab-panel ${idx == 0 ? "" : "hidden"}" id="tab${
        idx + 1
      }-panel" role="tabpanel">
      <!-- Content for Tab ${idx + 1} -->
      <search-element></search-element>
    </div>
`;
    }).join('')}
  </div>
`;

    // Now add clicks to tabs to select
    const tabs = Array.from(this.container.querySelectorAll('.tab')) as HTMLElement[];
    const panels = Array.from(this.container.querySelectorAll('.tab-panel')) as HTMLElement[];
    tabs.map((tab: HTMLElement, idx: number) => tab.addEventListener('click',()=>{
      tabs.forEach((tab:HTMLElement)=>tab.classList.remove('active'))
      tab.classList.add('active')      
      const childPanel = panels[idx];
      panels.forEach((panel:HTMLElement)=>panel.classList.add('hidden'))
      childPanel.classList.remove('hidden');
      (childPanel.querySelector('search-element')! as HTMLElement).focus();
    }))

  }

}
