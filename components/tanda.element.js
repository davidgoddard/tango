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
            throw new Error('Invalid time format');
        }
    
        return seconds;
    }

    to_time(s) {
        // Calculate hours, minutes and seconds
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

    findMinMaxYears(years) {
        // Convert all year strings to numbers
        const numericYears = years.map(Number);
    
        // Calculate min and max
        const minYear = Math.min(...numericYears);
        const maxYear = Math.max(...numericYears);
    
        if ( minYear != maxYear ){
            return minYear + ' to ' + maxYear
        } else {
            return 'Year ' + minYear
        }
    }

    render() {
        const tracks = Array.from(this.querySelectorAll('track-element'));
        const cortina = Array.from(this.querySelectorAll('cortina-element'));
        const titles = tracks.map(track => track.getAttribute('title'));
        const artists = tracks.map(track => track.getAttribute('artist'));
        const years = tracks.map(track => track.getAttribute('year'));
        const styles = new Set(tracks.map(track => track.getAttribute('style').charAt(0).toUpperCase()));
        let duration = 0;
        tracks.forEach(track => duration += this.timeStringToSeconds(track.getAttribute('duration')));
        const summary = `(${titles.length} Tracks; Duration: ${this.to_time(duration)}):  (${this.findMinMaxYears(years)}) - ${artists.join(', ')}`

        const cortinaSummary = cortina.map(track=>track.getAttribute('title')).join(', ')
    
        this.shadowRoot.innerHTML = `
            <style>
                .summary { cursor: pointer; display: grid; grid-template-columns: 20px 4fr auto auto;}
                .summary header { display: flex; justify-content: center }
                .details { display: ${this.expanded ? 'block' : 'none'}; }
            </style>
            <div id="toggle" class="summary">
                <header>
                    <span>${styles.size == 1 ? [...styles][0] : '?'}</span>
                </header>
                <main>
                    <span>${this.expanded ? '▼' : '►'}</span>${summary}
                    
                </main>
                <section>
                    <button>${cortinaSummary}</button>
                </section>
                <section>
                    <button>↤<button>
                </section>
            </div>
            <div class="details">
                <slot></slot>
            </div>
        `;
        this.shadowRoot.querySelector('#toggle main').addEventListener('click', () => this.toggleExpand());
    }
    
    toggleExpand() {
        this.expanded = !this.expanded;
        this.render();
    }
}
customElements.define('tanda-element', TandaElement);
export { TandaElement };