import { eventBus } from "../events/event-bus";
import { addDragDropHandlers } from "../services/drag-drop.service";

interface Page {
  label: string;
  content: any[];
}

export class ScratchPadElement extends HTMLElement {
  private container?: HTMLElement;
  private draggingElement?: HTMLElement;
  private filterType: string = "all";
  private filterStyle: string = "";
  private shadow: ShadowRoot;
  private pages: Page[] = [];

  constructor() {
    super();
    this.shadow = this.attachShadow({ mode: 'open' });
  }

  setPages(pageData: Page[]) {
    this.pages = pageData;
  }

  getPages() {
    return this.pages;
  }

  savePages() {
    localStorage.setItem('scratch pad pages', JSON.stringify(this.getPages()))
  }

  private savePageState() {
    this.pages.forEach((page, index) => {
      let content = this.shadow.querySelector(`.scratchpad-tab-content[data-index="${index}"]`);
      if (content) {
        page.content = Array.from(content.querySelectorAll(':scope > *')).map(node => node.outerHTML);
      }
      this.savePages();
    })
  }

  private handleTabEdit(e: Event, tab: HTMLElement) {
    const index = tab.dataset.index;
    if (index !== undefined) {
      this.pages[Number(index)].label = tab.textContent?.trim() ?? '';
      this.savePages();
    }
  }

  private switchTab(tab: HTMLElement) {
    const index = tab.dataset.index;
    this.shadow.querySelectorAll('.tab').forEach(content => content.classList.remove('active'));
    tab.classList.add('active')
    this.shadow.querySelectorAll('.scratchpad-tab-content').forEach(content => content.classList.remove('active'));
    this.shadow.querySelector(`.scratchpad-tab-content[data-index="${index}"]`)?.classList.add('active');
  }

  private addTab() {
    this.pages.push({ label: 'New Page', content: [] });
    this.savePages();
    this.connectedCallback();
    let tabs = this.shadow.querySelectorAll('.tab');
    let index = this.pages.length-1;
    this.switchTab(tabs[index] as HTMLElement);
  }


  connectedCallback() {
    const scratchPadPagesData = JSON.parse(localStorage.getItem('scratch pad pages') ?? `[{"label": "Main", "content": []}]`);
    this.setPages(scratchPadPagesData);
    this.shadow.innerHTML = '';
    this.container = document.createElement('section');
    this.container.appendChild(this.createStyles());
    this.container.appendChild(this.createControls());
    this.shadow.appendChild(this.container);
    this.render();
  }

  getActiveTabContents() {
    return this.shadow.querySelector('.scratchpad-tab-content.active');
  }

  createStyles(): HTMLStyleElement {
    const style = document.createElement("style");
    style.textContent = `
        section {
          height: 100%;
          overflow-y: auto; /* Scrollable content area */
          box-sizing: border-box;
          display: grid;
          grid-template-rows: auto auto 1fr;
        }
        .controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 0.2rem 0.2rem 0.2rem 0.2rem;
          padding: 3px;
        }
        .drop-target {
          outline: dashed 3px green;
          z-index: 99;
        }
        .controls button img {
          height: 32px;
          width: 32px;
        }
        .bin-target {
          outline: dashed 3px green;
          z-index: 99;
        }
        button.bin {
          background-color: transparent;
          margin: 3px;
          border: none;
          color: var(--header-text-color);
          cursor: pointer;
          justify-self: flex-start;
          flex-grow: 0;
          margin-right: 1rem;
          border-radius: 50%;
          background-color: var(--button-background);
          padding: 0.5rem;
        }
        `;
    return style;
  }

  createControls(): HTMLElement {
    const controls = document.createElement("div");
    controls.className = "controls";
    const types = document.createElement('div')
    controls.appendChild(types)

    // Radio buttons for filter type
    let typeMap: any = {
      All: "all",
      Tracks: "track-element",
      Cortinas: "cortina-element",
      Tandas: "tanda-element",
    };
    Object.keys(typeMap).forEach((type, idx) => {
      const label = document.createElement("label");
      label.appendChild(document.createTextNode(type));
      const radio = document.createElement("input");
      radio.id = `style-select-radio-${idx}`;
      radio.type = "radio";
      radio.name = "type";
      radio.value = typeMap[type];
      radio.checked = type === "all";
      radio.addEventListener("change", () => this.setFilterType(typeMap[type]));
      label.appendChild(radio);
      types.appendChild(label);
    });

    // Dropdown for data-style filter
    const styleSelect = document.createElement("select");
    styleSelect.name = "style-filter";
    styleSelect.addEventListener("change", () =>
      this.setFilterStyle(styleSelect.value)
    );
    controls.appendChild(styleSelect);
    this.updateStyleOptions(styleSelect);

    // Add Waste-bin

    let self = this;

    const bin = document.createElement("button");
    bin.classList.add('bin');
    const binImage = document.createElement("img");
    binImage.src = "./icons/bin.png";
    bin.appendChild(binImage);
    controls.appendChild(bin);

    // Function to handle dragover event for the bin
    function handleDragOver(event: any) {
      event.preventDefault(); // Necessary to allow a drop
      event.stopPropagation();
      bin.classList.add("bin-target");
    }

    // Function to handle dragover event for the bin
    function handleDragLeave(event: any) {
      event.preventDefault(); // Necessary to allow a drop
      event.stopPropagation();
      bin.classList.remove("bin-target");
    }

    // Function to handle drop event for the bin
    function handleDrop(event: any) {
      event.preventDefault();
      event.stopPropagation();
      console.log("Bin handling drop");
      const id = event.dataTransfer.getData("text/plain");
      if (id?.startsWith('TAB-')) {
        let index = id.split('-')[1];
        console.log('Tab?', index, self.draggingElement);
        console.log(self.pages[Number(index)]);
        self.pages.splice(Number(index), 1);
        console.log('New pages', self.pages)
        self.savePages();
        self.connectedCallback()
      } else {
        console.log("ID", id);
        const element = document.querySelector(`[data-id="${id}"]`) || self.shadow.querySelector(`[data-id="${id}"]`);
        console.log(element);
        if (element) {
          element.remove(); // Remove the element from the DOM
        }
      }
      bin.classList.remove("bin-target");
      self.savePageState();
      document.querySelector(".drop-target")?.classList.remove("drop-target");
      self.shadow.querySelector(".drop-target")?.classList.remove("drop-target");
      eventBus.emit("changed-playlist");

    }

    // Add event listeners to the bin
    bin.addEventListener("dragleave", handleDragLeave);
    bin.addEventListener("dragover", handleDragOver);
    bin.addEventListener("drop", handleDrop.bind(this));
    bin.addEventListener('click', () => { this.innerHTML = ''; })
    return controls;
  }

  updateStyleOptions(selectElement: HTMLSelectElement) {
    const styles = Array.from(
      this.querySelectorAll("tanda-element, track-element, cortina-element")
    ).map((el) => (el as HTMLElement).dataset.style);
    const uniqueStyles = Array.from(new Set(styles));
    console.log("debug styles", styles, uniqueStyles);
    selectElement.innerHTML =
      '<option name="all-styles" value="">All styles</option>';
    uniqueStyles.forEach((style) => {
      const option = document.createElement("option");
      option.value = style!;
      option.textContent = style!;
      selectElement.appendChild(option);
    });
  }

  setFilterType(type: string) {
    this.filterType = type;
    this.render();
  }

  setFilterStyle(style: string) {
    this.filterStyle = style;
    this.render();
  }

  render() {

    const style = `
    <style>
        .tabs { display: flex; flex-direction: row; flex-wrap: wrap; border-bottom: 1px solid #ccc; height: min-content; }
        .tab { 
          position: relative;
          padding: 0px 20px;
          cursor: pointer;
          border: 1px solid #ccc;
          border-bottom: none;
          background-color: #f0f0f0;
          transition: background-color 0.3s;
          color: black;          
        }
        .tab span {
          line-height: 2rem;
        }
        .tab:hover, .tab.active {
          background-color: var(--tab-active);
        }
        .scratchpad-tab-content { display: none; padding: 10px; height: 100%; flex-direction: column; }
        .scratchpad-tab-content.active { display: flex; margin: 3px;}
        .tab.delete, .tab.add { }
        .tab.add { background-color: transparent; border: none; }
        .tab span[contenteditable]:hover { background: #f0f0f0; }

    </style>
`;

    const tabs = this.pages.map((page, index) => `
    <div draggable="true" data-index="${index}"  class="tab" ><span contenteditable="true" >
        ${page.label}
    </span></div>
`).join('');

    const tabContents = this.pages.map((page, index) => `
    <div class="scratchpad-tab-content" data-index="${index}">
            ${page.content.join('')}
    </div>
`).join('');

    let template = document.createElement('template');
    template.innerHTML = `
    ${style}
      <div class="tabs">
          ${tabs}
          <div class="tab add"><span>➕</span></div>
      </div>
      ${tabContents}
`;
    this.container!.appendChild(template.content.cloneNode(true));

    let tabElements = this.shadow.querySelectorAll('.tab, .tab span') as unknown as HTMLInputElement[];
    tabElements.forEach(tab => {
      tab.addEventListener('click', () => this.switchTab(tab as HTMLElement));
      tab.addEventListener('input', (e) => this.handleTabEdit(e, tab as HTMLElement));
      tab.addEventListener('dragstart', (event) => {
        const target = event.target as HTMLElement;
        if (target.matches("[draggable]")) {
          console.log("dragstart", target.dataset.index);
          event.dataTransfer?.setData("text/plain", 'TAB-' + target.dataset.index!);
          this.draggingElement = target;
        }
      });
      tab.addEventListener('dragend', (event) => {
        this.draggingElement = undefined;
      })
    });
    (this.shadow.querySelector('.add') as unknown as HTMLInputElement)?.addEventListener('click', () => this.addTab());

    let tabHeadings = this.shadow.querySelectorAll('.tab');
    tabHeadings[0]?.classList.add('active')
    let tabContainers = this.shadow.querySelectorAll('.scratchpad-tab-content') as unknown as HTMLElement[];
    tabContainers[0]?.classList.add('active');
    for (const content of tabContainers) {
      addDragDropHandlers(content);
      content.addEventListener('drop', this.savePageState.bind(this))
    }



    const children = Array.from(this.children) as HTMLElement[];
    children.forEach((child) => {
      const type = child.tagName.toLowerCase();
      const style = child.dataset.style;
      const matchesType = this.filterType === "all" || this.filterType === type;
      console.log(type, matchesType, this.filterType, type);
      const matchesStyle = !this.filterStyle || this.filterStyle === style;
      child.style.display = matchesType && matchesStyle ? "" : "none";
    });
  }
}

customElements.define("scratch-pad-element", ScratchPadElement);
