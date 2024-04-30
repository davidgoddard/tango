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
        <article class="track">
            <h2>${this.getAttribute('title')}</h2>
            <p>${this.getAttribute('style')} By ${this.getAttribute('artist')} Year ${this.getAttribute('year')} Duration: ${this.getAttribute('duration')}</p>
        </article>
        `;
    }
}
customElements.define('track-element', TrackElement);
export { TrackElement };