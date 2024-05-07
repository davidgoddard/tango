class PlaylistElement extends HTMLElement {
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
    playing(N) {
        const trackList = Array.from(this.querySelectorAll('track-element, cortina-element')).filter(track => track.getAttribute('trackid')); // Get all tracks in the playlist
        const tandaList = Array.from(this.querySelectorAll('tanda-element')); // Get all tandas in the playlist
        const tanda = trackList[N].parentElement

        trackList.map(track => track.classList.remove('playing'))
        trackList[N].classList.add('playing')

        console.log('Playlist', trackList[N].tagName)
        const cortinaControls = tanda.shadowRoot.querySelector('div.cortinaControls')
        if (trackList[N].tagName == 'CORTINA-ELEMENT') {
            cortinaControls.classList.add('active')
        } else {
            cortinaControls.classList.remove('active')
        }

        tandaList.map(tanda => {
            tanda.classList.remove('playing')
            tanda.classList.remove('played')
        })

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

    setTrackTargets(track, enable) {
        this._data.sourceTrack = track;
        if (enable && track) {
            const trackStyle = track.getAttribute('style') || '?'
            console.log('Set all tracks as targets', trackStyle, track);
            const tracks = this.querySelectorAll('track-element');
            console.log(tracks)
            for (const track of tracks) {
                if (enable) {
                    if (trackStyle == '?' || trackStyle == track.style) {
                        track.classList.add('target')
                    }
                } else {
                    track.classList.remove('target')
                }
            }
        } else {
            const tracks = this.querySelectorAll('track-element');
            console.log(tracks)
            for (const track of tracks) {
                track.classList.remove('target')
            }
        }
    }

    handleTandaAdded(tanda) {
        const self = this;


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

            this._data.sourceTanda = tanda;
            const container = tanda.shadowRoot.querySelector('#container')
            container.classList.toggle('moving')

            const tandaRect = tanda.getBoundingClientRect();

            // Save the current scroll position
            const initialScrollY = window.scrollY;

            const tandas = this.querySelectorAll('tanda-element');
            for (const t of tandas) {
                if (t !== tanda && t.getAttribute('style') == tanda.getAttribute('style')) {
                    t.classList.add('target')
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

        function targetHandler(event) {
            console.log('Fetch source item and move here', this._data.sourceTanda, tanda)
            this.swapTandas(this._data.sourceTanda, tanda)
            const tandas = this.querySelectorAll('tanda-element');
            for (const t of tandas) {
                t.classList.remove('target')
            }

        }

        let actionList = [
            { title: 'Use this tanda as the target for swap/move', class: 'target', text: null, image: './icons/target.png', handler: targetHandler.bind(this), margin: null },
            { title: 'Move to scratch pad', text: null, image: './icons/notepad.png', handler: moveToScratchPad.bind(this), margin: null },
            { title: 'Select this tanda to move', text: null, image: './icons/copy-move.png', handler: copyMove.bind(this), margin: null },
            { title: 'Remove', text: null, image: './icons/bin.png', handler: removeTanda.bind(this), margin: '1rem' },
        ]

        actionList.forEach((action) => {
            let button = document.createElement('button')
            if (action.text) button.textContent = action.text;
            if (action.title) button.title = action.title;
            if (action.class) button.classList.add(action.class)
            if (action.image) {
                let image = document.createElement('img');
                image.alt = action.title;
                image.src = action.image;
                button.appendChild(image)
            }
            function handler(event) {
                event.stopPropagation();
                event.preventDefault();
                action.handler(event)
            }

            if (action.handler) {
                button.addEventListener('click', handler)
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
                button {
                    border: none;
                    background: transparent;
                }
                img {
                    height: 20px;
                    width: 20px;
                }

            </style>
            <slot></slot>
            <button class="target"><img alt="choose this as the tanda target" src='./icons/target.png'></button>
        `;

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