import { eventBus } from "../events/event-bus";

interface Page {
    label: string;
    content: any[];
}

export class PageManager extends HTMLElement {
    private shadow: ShadowRoot;
    private pages: Page[] = [];

    constructor() {
        super();
        this.shadow = this.attachShadow({ mode: 'open' });
    }

    static get observedAttributes() {
        return ['pages'];
    }

    attributeChangedCallback(name: string, oldValue: any, newValue: any) {
        if (name === 'pages' && oldValue !== newValue) {
            this.render();
        }
    }

    setPages(pageData: Page[]) {
        this.pages = pageData;
        this.render();
    }

    getPages(){
        return this.pages;
    }

    connectedCallback() {
        this.render();
    }

    private render() {

        const style = `
            <style>
                .tabs { display: flex; border-bottom: 1px solid #ccc; flex-wrap: wrap;}
                .tab { margin: 0; padding: 10px; cursor: pointer; position: relative; }
                .tab-content { display: none; padding: 10px; }
                .tab-content.active { display: block; }
                .tab .delete, .tab .add { position: absolute; right: 5px; top: 5px; cursor: pointer; }
                .tab .add { right: 25px; }
                .tab[contenteditable]:hover { background: #f0f0f0; }
            </style>
        `;

        const tabs = this.pages.map((page, index) => `
            <div draggable=true class="tab" data-index="${index}" contenteditable="true">
                ${page.label}
            </div>
        `).join('');

        const tabContents = this.pages.map((page, index) => `
            <div class="tab-content" data-index="${index}">
                <slot>
                    ${page.content.map(item => `<p>${item}</p>`).join('')}
                </slot>
            </div>
        `).join('');

        this.shadow.innerHTML = `
            ${style}
            <div class="tabs">
                ${tabs}
                <div class="tab add">➕</div>
            </div>
            ${tabContents}
        `;

        let tabElements = this.shadow.querySelectorAll('.tab') as unknown as HTMLInputElement[];
        tabElements.forEach(tab => {
            tab.addEventListener('click', () => this.switchTab(tab as HTMLElement));
            tab.addEventListener('input', (e) => this.handleTabEdit(e, tab as HTMLElement));
        });
        (this.shadow.querySelector('.add') as unknown as HTMLInputElement)?.addEventListener('click', () => this.addTab());

        this.shadow.querySelectorAll('.tab-content')[0]?.classList.add('active');

    }

    private handleTabEdit(e: Event, tab: HTMLElement) {
        const index = tab.dataset.index;
        if (index !== undefined) {
            this.pages[Number(index)].label = tab.textContent?.trim() ?? '';
            eventBus.emit("ScratchPad Renamed");
        }
    }

    private switchTab(tab: HTMLElement) {
        const index = tab.dataset.index;
        this.shadow.querySelectorAll('.tab-content').forEach(content => content.classList.remove('active'));
        this.shadow.querySelector(`.tab-content[data-index="${index}"]`)?.classList.add('active');
    }

    private addTab() {
        this.pages.push({ label: 'New Page', content: [] });
        this.render();
    }
}

customElements.define('page-manager', PageManager);
