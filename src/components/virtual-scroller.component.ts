class VirtualScrollList extends HTMLElement {
    private container: HTMLDivElement;
    private content: HTMLDivElement;
    private itemHeight: number = 50; // Default item height
    private totalItems: number = 0;
    private visibleItems: number = 0;
    private buffer: any[] = [];
    private renderFunction?: (item: any, idx: number) => Promise<HTMLElement>;
    private scrollTimeout: any;
    private accelerationFactor: number = 1.1;
    private scrollSpeed: number = 1;
  
    constructor() {
      super();
      const shadow = this.attachShadow({ mode: 'open' });
  
      this.container = document.createElement('div');
      this.container.style.overflowY = 'auto';
      this.container.style.height = '100%';
      this.container.style.position = 'relative';
  
      this.content = document.createElement('div');
      this.content.style.position = 'absolute';
      this.content.style.top = '0';
      this.content.style.left = '0';
      this.content.style.width = '100%';
  
      this.container.appendChild(this.content);
      shadow.appendChild(this.container);
  
      this.container.addEventListener('scroll', async () => this.onScroll());
    }
  
    connectedCallback() {
      this.calculateVisibleItems();
      this.renderVisibleItems();
    }
  
    static get observedAttributes() {
      return ['item-height', 'total-items'];
    }
  
    async attributeChangedCallback(name: string, oldValue: any, newValue: any) {
      if (name === 'item-height') {
        this.itemHeight = parseInt(newValue, 10);
      } else if (name === 'total-items') {
        this.totalItems = parseInt(newValue, 10);
        this.content.style.height = `${this.totalItems * this.itemHeight}px`;
      }
      this.calculateVisibleItems();
      await this.renderVisibleItems();
    }
  
    setRenderFunction(fn: (item: any, idx: number) => Promise<HTMLElement>) {
      this.renderFunction = fn;
    }
  
    private calculateVisibleItems() {
      this.visibleItems = Math.ceil(this.container.clientHeight / this.itemHeight);
    }
  
    private async onScroll() {
      clearTimeout(this.scrollTimeout);
      this.scrollTimeout = setTimeout(() => {
        this.scrollSpeed = 1;
      }, 100);
  
      const scrollTop = this.container.scrollTop;
      const startIndex = Math.floor(scrollTop / this.itemHeight);
      await this.renderVisibleItems(startIndex);
    }
  
    private async renderVisibleItems(startIndex: number = 0) {
      this.content.innerHTML = '';
  
      const endIndex = Math.min(startIndex + this.visibleItems, this.totalItems);
      for (let i = startIndex; i < endIndex; i++) {
        const item = this.buffer[i];
        const itemElement = await this.renderFunction!(item, i);
        itemElement.style.position = 'absolute';
        itemElement.style.top = `${i * this.itemHeight}px`;
        this.content.appendChild(itemElement);
      }
    }
  
    public async setItems(items: any[]) {
      this.buffer = items;
      await this.renderVisibleItems();
    }
  
    private accelerateScroll(direction: number) {
      this.scrollSpeed *= this.accelerationFactor;
      const newScrollTop = this.container.scrollTop + direction * this.scrollSpeed;
      this.container.scrollTop = newScrollTop;
    }
  }
  
  customElements.define('virtual-scroll-list', VirtualScrollList);
  