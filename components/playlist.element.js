class PlaylistElement extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        // this.addDragDropListeners();
    }

    render() {
        this.shadowRoot.innerHTML = `
            <style>
                .tanda {
                    padding: 10px;
                    margin-bottom: 2rem;
                    background-color: #f0f0f0;
                    border: 1px solid #ccc;
                    cursor: grab;
                }
                .tanda:hover {
                    background-color: #e9e9e9;
                }
                .actions {
                    margin-left: 10px;
                }
                button {
                    cursor: pointer;
                }
            </style>
            <slot></slot>
        `;

        // Query all assigned nodes (tanda-elements) and add delete and copy buttons
        this.querySelectorAll('tanda-element').forEach(tanda => {
            // const deleteButton = document.createElement('button');
            // deleteButton.textContent = 'Delete';
            // deleteButton.onclick = () => this.deleteTanda(tanda);

            // const copyButton = document.createElement('button');
            // copyButton.textContent = 'Copy to Scratchpad';
            // copyButton.onclick = () => this.copyToScratchpad(tanda);

            // const actions = document.createElement('div');
            // actions.className = 'actions';
            // actions.appendChild(deleteButton);
            // actions.appendChild(copyButton);

            // if (!tanda.nextElementSibling || tanda.nextElementSibling.tagName.toLowerCase() !== 'div') {
            //     tanda.appendChild(actions);
            // }
        });
    }

    addDragDropListeners() {
        this.addEventListener('dragstart', (event) => {
            event.target.style.opacity = '0.4';
            event.dataTransfer.setData('text/plain', event.target.id);
        });

        this.addEventListener('dragover', (event) => {
            event.preventDefault();
        });

        this.addEventListener('drop', (event) => {
            event.preventDefault();
            const id = event.dataTransfer.getData('text/plain');
            const draggableElement = this.querySelector(`#${id}`);
            const dropzone = event.target.closest('tanda-element');
            if (dropzone && dropzone !== draggableElement) {
                let relativePosition = dropzone.compareDocumentPosition(draggableElement);
                if (relativePosition & Node.DOCUMENT_POSITION_FOLLOWING) {
                    dropzone.before(draggableElement);
                } else {
                    dropzone.after(draggableElement);
                }
            }
            draggableElement.style.opacity = '1.0';
        });

        this.addEventListener('dragend', (event) => {
            event.target.style.opacity = '1.0';
        });
    }

    deleteTanda(tanda) {
        tanda.remove();
    }

    copyToScratchpad(tanda) {
        const scratchpadSelector = this.getAttribute('scratchpadSelector');
        const scratchPad = document.querySelector(scratchpadSelector); // Assuming there's an element with id="scratchpad"
        scratchPad.appendChild(tanda.cloneNode(true));
    }
}

customElements.define('playlist-element', PlaylistElement);
export { PlaylistElement };