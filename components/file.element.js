class FileDisplay extends HTMLElement {
    constructor() {
        super();
        // Attach a shadow root to the element.
        const shadowRoot = this.attachShadow({mode: 'open'});

        // Create a template element
        const template = document.createElement('template');

        // Set the inner HTML of the template including style and content placeholders
        template.innerHTML = `
            <style>
                :host {
                    display: block;
                    margin: 10px 0;
                    box-sizing: border-box;
                }
                .file-container {
                    display: grid;
                    grid-template-columns: auto 1fr;
                    gap: 10px;
                    align-items: center;
                    padding: 10px;
                    border: 1px solid #ccc;
                    cursor: pointer;
                }
                .file-attribute {
                    white-space: nowrap;
                    overflow: hidden;
                    text-overflow: ellipsis;
                }
                .details {
                    display: none;
                    padding: 10px;
                    border-top: 1px solid #ccc;
                }
                .details.visible {
                    display: block;
                }
                .toggle-icon {
                    user-select: none;
                }
            </style>
            <div class="file-container">
                <span class="toggle-icon">▶</span>
                <div class="summary"></div>
            </div>
            <div class="details"></div>
        `;

        // Append the content of the template to the shadow DOM
        shadowRoot.appendChild(template.content.cloneNode(true));

        // Toggle details on icon click
        this.toggleIcon = shadowRoot.querySelector('.toggle-icon');
        this.details = shadowRoot.querySelector('.details');
        this.summary = shadowRoot.querySelector('.summary');

        this.toggleIcon.addEventListener('click', () => {
            this.toggleDetails();
        });
    }

    connectedCallback() {
        this.render();
    }

    render() {
        if (!this.hasAttribute('data-file')) {
            throw new Error('data-file attribute is required');
        }

        const fileData = JSON.parse(this.getAttribute('data-file'));
        this.summary.innerHTML = ''; // Clear previous content
        this.details.innerHTML = ''; // Clear previous content

        if (fileData.summary) {
            Object.entries(fileData.summary).forEach(([key, value]) => {
                const div = document.createElement('div');
                div.classList.add('file-attribute');
                div.textContent = `${key}: ${value}`;
                this.summary.appendChild(div);
            });
        }

        if (fileData.details) {
            Object.entries(fileData.details).forEach(([key, value]) => {
                const div = document.createElement('div');
                div.classList.add('file-attribute');
                div.textContent = `${key}: ${value}`;
                this.details.appendChild(div);
            });
        }
    }

    toggleDetails() {
        const isVisible = this.details.classList.contains('visible');
        this.details.classList.toggle('visible', !isVisible);
        this.toggleIcon.textContent = isVisible ? '▶' : '▼';
    }

    static get observedAttributes() {
        return ['data-file'];
    }

    attributeChangedCallback(name, oldValue, newValue) {
        if (name === 'data-file') {
            this.render();
        }
    }
}

customElements.define('file-display', FileDisplay);
