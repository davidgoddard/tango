class ScratchPadElement extends HTMLElement {
    private container: HTMLElement;
    private filterType: string = 'all';
    private filterStyle: string = '';
  
    constructor() {
      super();
      this.container = document.createElement('div');
      this.container.className = 'dropzone';
      this.attachShadow({ mode: 'open' });
      this.shadowRoot?.appendChild(this.createStyles());
      this.shadowRoot?.appendChild(this.createControls());
      this.shadowRoot?.appendChild(this.container);
    }
  
    connectedCallback() {
      this.render();
    }
  
    createStyles(): HTMLStyleElement {
      const style = document.createElement('style');
      style.textContent = `
        :host {
          display: block;
          border: 1px solid #ccc;
          padding: 10px;
          margin: 10px;
        }
        .controls {
          margin-bottom: 10px;
        }
        .dropzone {
          min-height: 50px;
          border: 1px dashed #ccc;
          padding: 10px;
        }
      `;
      return style;
    }
  
    createControls(): HTMLElement {
      const controls = document.createElement('div');
      controls.className = 'controls';
  
      // Radio buttons for filter type
      ['all', 'tracks', 'tandas', 'cortinas'].forEach((type) => {
        const label = document.createElement('label');
        const radio = document.createElement('input');
        radio.type = 'radio';
        radio.name = 'type';
        radio.value = type;
        radio.checked = type === 'all';
        radio.addEventListener('change', () => this.setFilterType(type));
        label.appendChild(radio);
        label.appendChild(document.createTextNode(type));
        controls.appendChild(label);
      });
  
      // Dropdown for data-style filter
      const styleSelect = document.createElement('select');
      styleSelect.addEventListener('change', () => this.setFilterStyle(styleSelect.value));
      controls.appendChild(styleSelect);
      this.updateStyleOptions(styleSelect);
  
      return controls;
    }
  
    updateStyleOptions(selectElement: HTMLSelectElement) {
      const styles = Array.from(this.container.children).map((el) => (el as HTMLElement).dataset.style);
      const uniqueStyles = Array.from(new Set(styles));
      selectElement.innerHTML = '<option value="">All styles</option>';
      uniqueStyles.forEach((style) => {
        const option = document.createElement('option');
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
      const children = Array.from(this.container.children) as HTMLElement[];
      children.forEach((child) => {
        const type = child.tagName.toLowerCase();
        const style = child.dataset.style;
        const matchesType = this.filterType === 'all' || this.filterType === `${type}s`;
        const matchesStyle = !this.filterStyle || this.filterStyle === style;
        child.style.display = matchesType && matchesStyle ? '' : 'none';
      });
    }
  }
  
  customElements.define('scratch-pad-element', ScratchPadElement);
  