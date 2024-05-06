class PlaylistElement extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();

        // Create a new MutationObserver instance
        const observer = new MutationObserver(mutationsList => {
            for (const mutation of mutationsList) {
                if (mutation.type === 'childList') {
                    // Check if any Tanda elements were added
                    const addedTandas = Array.from(mutation.addedNodes).filter(node => node.tagName === 'TANDA-ELEMENT');
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

    // Method called during playback when track changes
    playing(N){
        const trackList = Array.from(this.querySelectorAll('track-element, cortina-element')); // Get all tracks in the playlist
        const tandaList = Array.from(this.querySelectorAll('tanda-element')); // Get all tandas in the playlist

        trackList.map(track => track.classList.remove('playing'))
        trackList[N].classList.add('playing')

        tandaList.map(tanda => {
            tanda.classList.remove('playing')
            tanda.classList.remove('played')
        })

        const tanda = trackList[N].parentElement

        let sibling = tanda;
        while (sibling.previousElementSibling) {
            sibling = sibling.previousElementSibling;
            sibling.classList.add('played')
          }

        tanda.classList.add('playing')
        tanda.scrollIntoView({
            behavior: 'smooth', // Smooth scrolling
            block: 'start',     // Scroll to the top of the element
            inline: 'nearest'   // Scroll horizontally to the nearest edge of the element
          });



        // const currentTanda = tandaList.find(tanda => {
        //     const tandaTracks = tanda.querySelectorAll('track-element')
        // })

        

    }

    replaceTanda(existingTanda, newTanda) {
        const tandaList = Array.from(this.querySelectorAll('tanda-element')); // Get all tandas in the playlist

        const index = tandaList.indexOf(existingTanda); // Find the index of the existing tanda

        if (index === -1) {
            console.error('Existing tanda not found in playlist');
            return;
        }

        // Remove the existing tanda from its position
        existingTanda.remove();

        // Insert the new tanda at the position of the removed tanda
        this.insertTandaAtIndex(newTanda, index);
    }

    swapTandas(tanda1, tanda2) {
        const tandaList = Array.from(this.querySelectorAll('tanda-element')); // Get all tandas in the playlist

        const index1 = tandaList.indexOf(tanda1); // Find the index of the first tanda
        const index2 = tandaList.indexOf(tanda2); // Find the index of the second tanda

        if (index1 === -1 || index2 === -1) {
            console.error('Tanda not found in playlist');
            return;
        }

        // Remove the existing tandas from their positions
        tanda1.remove();
        tanda2.remove();

        // Insert the first tanda at the position of the second tanda
        this.insertTandaAtIndex(tanda1, index2);

        // Insert the second tanda at the position of the first tanda
        this.insertTandaAtIndex(tanda2, index1);
    }

    insertTandaAtIndex(tanda, index) {
        const tandas = this.querySelectorAll('tanda-element');
        if (index >= tandas.length) {
            this.appendChild(tanda); // Append tanda if index is out of bounds
        } else {
            const referenceTanda = tandas[index];
            this.insertBefore(tanda, referenceTanda); // Insert tanda before the reference tanda
        }
    }

    handleTandaAdded(tanda) {

        let actions = tanda.shadowRoot.querySelector('#actions')
        
        // function clickHandler(){
        //     console.log('Clicked tanda', tanda)
        //     const event = new CustomEvent("playTanda", { detail: tanda });
        //     this.dispatchEvent(event);
        // }
        // tanda.addEventListener('clickedTrack', clickHandler.bind(this))

        function moveToScratchPad(event) {
            const scratchpadSelector = this.getAttribute('scratchpadSelector');
            const scratchPad = document.querySelector(scratchpadSelector);
            scratchPad.appendChild(tanda)
        }
        function removeTanda(event) {
            tanda.remove()
        }

        function copyMove(event) {
            const container = tanda.shadowRoot.querySelector('#container')
            container.classList.toggle('moving')

            const tandaRect = tanda.getBoundingClientRect();

            // Save the current scroll position
            const initialScrollY = window.scrollY;

            const tandas = this.querySelectorAll('tanda-element');
            for (const t of tandas) {
                if (t !== tanda) {
                    const container = t.shadowRoot.querySelector('#container')
                    container.classList.toggle('target')
                }
            }

            // Calculate the adjustment in scroll position
            const finalTandaRect = tanda.getBoundingClientRect();
            const scrollAdjustment = finalTandaRect.top - tandaRect.top;

            // Scroll the viewport to adjust for the change in position
            window.scrollTo(0, initialScrollY + scrollAdjustment);

            // const newTanda = document.createElement('tanda-element');
            // const newContainer = tanda.shadowRoot.querySelector('#container')
            // newContainer.classList.add('empty')
            // this.replaceTanda(tanda, newTanda)

        }

        let actionList = [
            { title: 'Move to scratch pad', text: null, image: './icons/notepad.png', handler: moveToScratchPad, margin: null },
            { title: 'Select this tanda to move', text: null, image: './icons/copy-move.png', handler: copyMove, margin: null },
            { title: 'Remove', text: null, image: './icons/bin.png', handler: removeTanda, margin: '1rem' }
        ]

        actionList.forEach((action) => {
            let button = document.createElement('button')
            if (action.text) button.textContent = action.text;
            if (action.title) button.title = action.title;
            if (action.image) {
                let image = document.createElement('img');
                image.alt = action.title;
                image.src = action.image;
                button.appendChild(image)
            }
            if (action.handler) {
                button.addEventListener('click', action.handler.bind(this))
            }
            if (action.margin) {
                button.style.marginLeft = '1rem';
            }
            actions.appendChild(button);
        })

    }


    render() {
        console.log('rendering playlist');
        this.shadowRoot.innerHTML = `
            <style>
                tanda-element {
                    padding: 10px;
                    margin-bottom: 2rem;
                    background-color: #f0f0f0;
                    border: 1px solid #ccc;
                    cursor: grab;
                }
                tanda-element:hover {
                    background-color: #e9e9e9;
                }
                tanda-element.actions {
                    margin-left: 10px;
                }
                tanda-element button {
                    cursor: pointer;
                }
                button.target {
                    border: none;
                    background: transparent;
                }
                button.target img {
                    height: 20px;
                    width: 20px;
                }
            </style>
            <slot></slot>
            <button class="target"><img alt="choose this as the tanda target" src='./icons/target.png'></button>
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

}

customElements.define('playlist-element', PlaylistElement);
export { PlaylistElement };