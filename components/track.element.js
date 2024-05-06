class TrackElement extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
        
        this.addEventListener('click', ()=>{
            const event = new CustomEvent("clickedTrack", { detail: this, bubbles: true });
            this.dispatchEvent(event);
        })

    }

    render() {
        this.shadowRoot.innerHTML = `
        <style>
            .track {
                padding: 0.4rem;
            }
            h2 {
                margin: 0px;
                padding: 0px;
                font-size: medium;
            }
            p {
                padding: 0px;
                margin: 0.2rem 0;
            }
            :host-context(track-element.playing) {
                border: solid 2px orange;
                display: block;
                border-radius: 5px;
                background-color: #ffe000;
            }
        </style>
        <article class="track">
            <h2>${this.getAttribute('title')}</h2>
            <p>
                <span class='style'>${this.getAttribute('style')}</span>
                By <span class='artist'>${this.getAttribute('artist')}</span>
                Year <span class='year'>${this.getAttribute('year')}</span>
                Duration: <span class='duration'>${this.getAttribute('duration')}</span>
            </p>
        </article>
        `;
    }
}
customElements.define('track-element', TrackElement);
export { TrackElement };