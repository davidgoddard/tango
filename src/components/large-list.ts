const template = document.createElement('template');
template.innerHTML = `
  <style>
    .viewport {
      height: 400px;
      overflow-y: auto;
      position: relative;
    }
    .content {
      position: relative;
      width: 100%;
    }
    .list-item {
      position: absolute;
      width: 100%;
    }
  </style>
  <div class="viewport" id="viewport">
    <div class="content" id="content"></div>
  </div>
`;

export class LargeListElement extends HTMLElement {
  private viewport: HTMLElement;
  private contentDiv: HTMLElement;
  private itemHeight: number;
  private totalItems: number;
  private buffer: number;
  private ticking: boolean;
  private itemHeights: number[];
  private renderItemFunction?: (N: number) => Promise<HTMLElement>;

  constructor() {
    super();
    const shadow = this.attachShadow({ mode: 'open' });
    shadow.appendChild(template.content.cloneNode(true));

    this.viewport = shadow.getElementById('viewport') as HTMLElement;
    this.contentDiv = shadow.getElementById('content') as HTMLElement;
    this.itemHeight = 50;
    this.totalItems = 1000;
    this.buffer = 5;
    this.ticking = false;
    this.itemHeights = new Array(this.totalItems).fill(this.itemHeight);

    this.viewport.addEventListener('scroll', this.onScroll.bind(this));
    window.addEventListener('keydown', this.onKeyDown.bind(this));
  }

  async connectedCallback() {
    this.contentDiv.style.height = `${this.calculateContentHeight()}px`;
    await this.renderItems(
      0,
      Math.ceil(this.viewport.clientHeight / this.itemHeight) + this.buffer
    );
  }

  public setRenderItem(x: (N: number) => Promise<HTMLElement>): void {
    this.renderItemFunction = x;
  }

  private measureItemHeight(item: HTMLElement): number {
    return item.getBoundingClientRect().height;
  }

  private calculateContentHeight(): number {
    return this.itemHeights.reduce((a, b) => a + b, 0);
  }

  private updateHeightsAndPositions() {
    const children = Array.from(this.contentDiv.children) as HTMLElement[];
    children.forEach((item, index) => {
      const height = this.measureItemHeight(item);
      this.itemHeights[index] = height;
      const previousHeights = this.itemHeights
        .slice(0, index)
        .reduce((a, b) => a + b, 0);
      item.style.transform = `translateY(${previousHeights}px)`;
    });
    this.contentDiv.style.height = `${this.calculateContentHeight()}px`;
  }

  private async renderItems(startIndex: number, endIndex: number) {
    this.contentDiv.replaceChildren(); // Efficiently clear all child elements
    for (let i = startIndex; i <= endIndex; i++) {
      if (this.renderItemFunction) {
        const item = await this.renderItemFunction(i);
        item.className = 'list-item';
        this.contentDiv.appendChild(item);
      }
    }
    this.updateHeightsAndPositions();
  }

  private async updateVisibleItems() {
    const scrollTop = this.viewport.scrollTop;
    let accumulatedHeight = 0;
    let startIndex = 0;
    for (let i = 0; i < this.itemHeights.length; i++) {
      if (accumulatedHeight + this.itemHeights[i] > scrollTop) {
        startIndex = i;
        break;
      }
      accumulatedHeight += this.itemHeights[i];
    }

    let endIndex = startIndex;
    accumulatedHeight = this.itemHeights[startIndex];
    for (let i = startIndex + 1; i < this.itemHeights.length; i++) {
      if (accumulatedHeight > scrollTop + this.viewport.clientHeight) {
        endIndex = i;
        break;
      }
      accumulatedHeight += this.itemHeights[i];
    }

    await this.renderItems(
      Math.max(0, startIndex - this.buffer),
      Math.min(this.totalItems - 1, endIndex + this.buffer)
    );
    this.ticking = false;
  }

  private onScroll() {
    if (!this.ticking) {
      requestAnimationFrame(this.updateVisibleItems.bind(this));
      this.ticking = true;
    }
  }

  private onKeyDown(event: KeyboardEvent) {
    switch (event.key) {
      case 'ArrowDown':
        this.viewport.scrollTop += this.itemHeight;
        break;
      case 'ArrowUp':
        this.viewport.scrollTop -= this.itemHeight;
        break;
      case 'PageDown':
        this.viewport.scrollTop += this.viewport.clientHeight;
        break;
      case 'PageUp':
        this.viewport.scrollTop -= this.viewport.clientHeight;
        break;
      case 'Home':
        this.viewport.scrollTop = 0;
        break;
      case 'End':
        this.viewport.scrollTop = this.contentDiv.scrollHeight;
        break;
      default:
        break;
    }
  }
}

customElements.define('large-list-element', LargeListElement);
