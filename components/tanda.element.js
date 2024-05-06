class TandaElement extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        this.expanded = false;
    }

    connectedCallback() {
        this.render();
    }

    timeStringToSeconds(timeString) {
        const parts = timeString.split(':').map(Number); // Split the string and convert to numbers
        let seconds = 0;

        if (parts.length === 3) {
            // Format HH:MM:SS
            seconds = parts[0] * 3600 + parts[1] * 60 + parts[2];
        } else if (parts.length === 2) {
            // Format MM:SS
            seconds = parts[0] * 60 + parts[1];
        } else {
            return '?'
        }

        return seconds;
    }

    to_time(s) {
        // Calculate hours, minutes and seconds
        if (isNaN(s)) {
            return '?'
        } else {

            let seconds = Math.round(s);
            let minutes = Math.floor(seconds / 60);
            let hours = Math.floor(minutes / 60);

            // Reduce minutes and seconds to be within 0-59
            seconds %= 60;
            minutes %= 60;

            // Create an array of the time components
            const parts = [];

            // Format minutes and seconds: always two digits if hours or minutes are included
            const formattedSeconds = seconds < 10 ? '0' + seconds : seconds;
            const formattedMinutes = minutes < 10 ? '0' + minutes : minutes;

            // Add hours if non-zero
            if (hours > 0) {
                parts.push(hours);  // Add hours if non-zero
                parts.push(formattedMinutes); // Minutes with leading zero
            } else {
                parts.push(minutes); // Add minutes as is (no leading zero)
            }

            // Always add seconds, with leading zero if necessary
            parts.push(formattedSeconds);

            // Join parts with ':' to form the final time string
            return parts.join(':');
        }
    }

    findMinMaxYears(years) {
        // Convert all year strings to numbers
        let numericYears = years.map(Number);

        const hasUnknown = numericYears.find(year => isNaN(year))
        numericYears = numericYears.filter(year => !isNaN(year))

        if (numericYears.length > 0) {

            // Calculate min and max
            const minYear = Math.min(...numericYears);
            const maxYear = Math.max(...numericYears);

            if (minYear != maxYear) {
                return [(hasUnknown ? 'Unknown' : ''), 'Years ' + minYear + ' to ' + maxYear].filter(x => x).join(', ')
            } else {
                return [(hasUnknown ? 'Unknown' : ''), 'Year ' + minYear].filter(x => x).join(', ')
            }
        } else {
            return 'Unknown'
        }
    }

    render() {
        const tracks = Array.from(this.querySelectorAll('track-element'));
        const cortina = Array.from(this.querySelectorAll('cortina-element'));
        const titles = tracks.map(track => track.getAttribute('title'));
        const artists = tracks.map(track => track.getAttribute('artist'));
        const years = tracks.map(track => track.getAttribute('year').substring(0, 4));
        const styles = new Set(tracks.map(track => track.getAttribute('style')));
        let duration = 0;
        tracks.forEach(track => duration += this.timeStringToSeconds(track.getAttribute('duration')));
        const summary = `(${titles.length} Tracks; Duration: ${this.to_time(duration)}):  (${this.findMinMaxYears(years)}) - ${artists.join(', ')}`

        const track = cortina[0]
        let cortinaArtist;
        let cortinaTitle;
        if ( track ){
            cortinaTitle = track.getAttribute('title')
            cortinaArtist = track.getAttribute('artist')
            if ( cortinaTitle.length > 15 ) cortinaTitle = cortinaTitle.substring(0,15) + '...'
            if ( cortinaArtist.length > 15 ) cortinaArtist = cortinaArtist.substring(0,15) + '...'
        } else {
            cortinaTitle = 'Unknown'
            cortinaArtist = '';
        }
        
        const cortinaSummary = cortinaTitle.length>0 ? `<button>${cortinaTitle}${cortinaArtist ? '<br/>' + cortinaArtist : ''}</button>` : ''

        this.shadowRoot.innerHTML = `
            <style>
                .summary { cursor: pointer; display: grid; grid-template-columns: 40px auto;}
                .summary header { display: flex; justify-content: center }
                .summary header span {
                    font-size: 1.5rem;
                    font-weight: bold;
                }
                .details { display: none; }
                #container article {
                    border: solid 2px #ccc;
                    border-radius: 7px;
                    margin-top: 0rem;
                    margin-bottom: 0rem;
                    padding: 0.2rem;
                }
                #actions {
                    display: flex;
                    flex-direction: row;
                    justify-content: flex-end;
                }
                #actions button {
                    display: flex;
                    align-self: center;
                    padding: 0px;
                    margin-left: 10px;
                    border: none;
                    background: transparent;
                    height: 20px;
                    width: 20px;
                }
                .details.expanded {
                    display: block;
                }
                #container.moving article {
                    border: dashed 2px red;
                    margin: 1rem;
                }
                #container.empty article {
                    border: dashed 2px green;
                    margin: 1rem;
                }
                #container.target .target {
                    display: block;
                }
                button.target,
                #actions button.target {
                    display: none;
                    border: none;
                    margin: 0 0 0 1rem;
                    padding: 0px;
                    background: transparent;
                }
                button img {
                    height: 20px;
                    width: 20px;
                }
                :host-context(.playing) #container article {
                    border: dashed 2px #cf8805;
                    display: block;
                    border-radius: 10px;
                    margin: 1rem!important;
                }
                :host-context(.played) {
                    display: block;
                    background-color: #777;
                    border-radius: 10px;
                }
                .cortinaControls {
                    display: none;
                }
                .cortinaControls button {
                    border: none;
                    background-color:transparent;
                }
                .cortinaControls img {
                    height: 40px;
                    width: 40px;
                }
                .cortinaControls.active {
                    display: block;
                }

                main > section {
                    float: right;
                    text-align: right;
                    min-width: 8rem;
                }
                main > section > button {
                    width: 100%;
                    margin-bottom: 0.3rem;
                }
            </style>
            <div id="container" class="${styles.size == 1 ? [...styles][0] : '?'}">
                <article>
                    <div id="toggle" class="summary">
                        <header>
                            <span>${styles.size == 1 ? [...styles][0].charAt(0).toUpperCase() : '?'}</span>
                        </header>
                        <main>
                                                     
                            <section>
                                <div class="cortinaControls">
                                    <button class="playAll"><img src="./icons/player_play 2.png" alt="Play whole cortina"></button>
                                    <button class="stopPlayAll"><img src="./icons/player_stop 2.png" alt="Play whole cortina"></button>
                                </div>
                                ${cortinaSummary}
                                <section id="actions">
                                    <button class="target"><img src='./icons/target.png'></button>
                                </section>
                            </section>

                            <span></span>${summary}   
                        </main>
                    </div>
                    <div class="details">   
                        <slot></slot>                 
                    </div>
                </article>
            </div>
        `;
        this.shadowRoot.querySelector('#toggle main').addEventListener('click', () => this.toggleExpand());

        function notifyPlayAll() {
            const event = new CustomEvent("playFullCortina", { bubbles: true });
            this.dispatchEvent(event);
        }
        this.shadowRoot.querySelector('.playAll').addEventListener('click', notifyPlayAll.bind(this))
        function notifyStopPlayAll() {
            const event = new CustomEvent("stopPlayFullCortina", { bubbles: true });
            this.dispatchEvent(event);
        }
        this.shadowRoot.querySelector('.stopPlayAll').addEventListener('click', notifyStopPlayAll.bind(this))
    }

    toggleExpand() {
        this.expanded = !this.expanded;
        let details = this.shadowRoot.querySelector('.details');
        let span = this.shadowRoot.querySelector('main span');
        if (this.expanded) {
            details.classList.add('expanded');
            span.textContent = '►'
        } else {
            details.classList.remove('expanded')
            span.textContent = ''
        }
    }

}
customElements.define('tanda-element', TandaElement);
export { TandaElement };