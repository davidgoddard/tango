class TrackElement extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
    }

    connectedCallback() {
        this.render();
    }

    render() {
        this.shadowRoot.innerHTML = `
        <style>
            h2 {
                margin: 0px;
                padding: 0px;
            }
            p {
                padding: 0px;
                margin: 0.2rem 0.2rem 1rem 0.2rem;
            }
        </style>
        <article class="track">
            <h2>${this.getAttribute('title')}</h2>
            <p>
                <span class='style'>${this.getAttribute('style')}</span> By <span class='artist'>${this.getAttribute('artist')}</span> Year <span class='year'>${this.getAttribute('year')}</span> Duration: <span class='duration'>${this.getAttribute('duration')}</span></p>
        </article>
        `;
    }
}
customElements.define('track-element', TrackElement);
export { TrackElement };