class ScratchPadElement extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this._data = {
            sourceTanda: null,
            sourceTrack: null,
        }

    }

    connectedCallback() {
        this.render();

        // Create a new MutationObserver instance
        const observer = new MutationObserver(mutationsList => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    // Check if any Tanda elements were added
                    const addedTandas = Array.from(mutation.addedNodes).filter(node => {
                        return node.tagName.toUpperCase() === 'TANDA-ELEMENT'
                    });
                    for (const tanda of addedTandas) {
                        this.handleTandaAdded(tanda);
                    }
                }
            }
        });

        // Start observing changes to the DOM
        observer.observe(this.parentElement || document, { subtree: true, childList: true });


        // this.addDragDropListeners();
    }

    handleTandaAdded(tanda) {
        console.log('Tanda added to scratchpad:', tanda);

        let tracks = tanda.querySelectorAll('track-element,cortina-element')
        for ( let track of tracks ){
            track.classList.remove('playing')
        }

        tanda.scrollIntoView({
            behavior: 'smooth', // Smooth scrolling
            block: 'start',     // Scroll to the top of the element
            inline: 'nearest'   // Scroll horizontally to the nearest edge of the element
          });
        

        let actions = tanda.shadowRoot.querySelector('#actions')

        let button = document.createElement('button')
        button.innerHTML = `<img alt="Add to playlist" height="15px" width="15px" src="./icons/playlist.PNG"/>`
        button.title = 'Move to playlist'
        button.addEventListener('click', (event) => {
            console.log('Got event to move to playlist', tanda)
            const playlistSelector = this.getAttribute('playlistSelector');
            const playlist = document.querySelector(playlistSelector);
            // Move tanda to target list
            playlist.appendChild(tanda);
        });
        actions.appendChild(button);  

        button = document.createElement('button')
        button.innerHTML = `<img alt="Remove from scratchpad" height="15px" width="15px" src="./icons/bin.PNG"/>`
        button.title = 'Remove from scratch pad'
        button.addEventListener('click', (event) => {
            console.log('Got event to remove to scratch pad', tanda)
            tanda.remove()
        });
        actions.appendChild(button);  
       }

    render() {
        console.log('rendering scratchpad');
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

            console.log('Tanda Element', tanda)

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

}

customElements.define('scratch-pad-element', ScratchPadElement);
export { ScratchPadElement };