import { eventBus } from "../events/event-bus";
import { addDragDropHandlers } from "../services/drag-drop.service";

class ScratchPadElement extends HTMLElement {
  private container?: HTMLElement;
  private filterType: string = "all";
  private filterStyle: string = "";

  constructor() {
    super();
    this.attachShadow({ mode: "open" });
  }

  connectedCallback() {
    this.container = document.createElement("slot");
    this.shadowRoot?.appendChild(this.createStyles());
    this.shadowRoot?.appendChild(this.createControls());
    this.shadowRoot?.appendChild(this.container);
    this.render();
    addDragDropHandlers(this);
    this.addEventListener("drop", () => {
      console.log("debug drop");
      const styleSelect = this.shadowRoot!.querySelector("select");
      console.log(styleSelect);
      if (styleSelect) this.updateStyleOptions(styleSelect!);
    });
  }

  createStyles(): HTMLStyleElement {
    const style = document.createElement("style");
    style.textContent = `
        :host {
          display: block;
          border: 1px solid #ccc;
          padding: 10px;
          margin: 10px;
        }
        .controls {
          display: flex;
          justify-content: space-between;
          align-items: center;
          margin: 0.2rem 0.2rem 60px 0.2rem;
          padding: 3px;
        }
        .drop-target {
          outline: dashed 2px green;
          z-index: 99;
        }
        .controls button img {
          height: 32px;
          width: 32px;
        }
        .bin-target {
          outline: dashed 3px red;
          z-index: 99;
        }
        button.bin {
          background-color: transparent;
          border: none;
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
      console.log("ID", id);
      const element = document.querySelector(`[data-id="${id}"]`);
      console.log(element);
      if (element) {
        element.remove(); // Remove the element from the DOM
      }
      bin.classList.remove("bin-target");
      document.querySelector(".drop-target")?.classList.remove("drop-target");
      eventBus.emit("changed-playlist");
    }

    // Add event listeners to the bin
    bin.addEventListener("dragleave", handleDragLeave);
    bin.addEventListener("dragover", handleDragOver);
    bin.addEventListener("drop", handleDrop);
    bin.addEventListener('click', () => {this.innerHTML = '';})
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
    const children = Array.from(this!.children) as HTMLElement[];
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
