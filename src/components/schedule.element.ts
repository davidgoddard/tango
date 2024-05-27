class ScheduleElement extends HTMLElement {
    constructor() {
        super();
        this.attachShadow({ mode: 'open' });
        
        const style = document.createElement('style');
        style.textContent = `
            .tanda {
                display: flex;
                align-items: center;
                margin-bottom: 10px;
            }
            .time {
                margin-right: 10px;
                font-weight: bold;
            }
        `;

        this.shadowRoot!.appendChild(style);
    }

    connectedCallback() {
        this.render();
    }

    render() {
        // Create a container element to hold the rendered schedule
        const container = document.createElement('div');

        let currentTime = new Date();
        
        // Iterate over the children in the slot
        Array.from(this.children).forEach((tanda, index) => {

            // Create a wrapper for each tanda
            const tandaWrapper = document.createElement('div');
            tandaWrapper.classList.add('tanda');

            // Create an element to display the start time
            const timeElement = document.createElement('div');
            timeElement.classList.add('time');
            timeElement.textContent = currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });

            // Append the time element and the tanda to the wrapper
            tandaWrapper.appendChild(timeElement);
            tandaWrapper.appendChild(tanda.cloneNode(true));

            // Append the wrapper to the container
            container.appendChild(tandaWrapper);

            const clone = tandaWrapper.querySelector('tanda-element')! as HTMLElement;

            // Go back and get the duration the tanda calculated
            const duration = parseInt(clone.dataset.duration || '0', 10);
            console.log(JSON.stringify(clone),duration)

            // Update the current time for the next tanda
            currentTime.setMinutes(currentTime.getMinutes() + duration);
        });

        // Clear the shadow root and append the updated container
        this.shadowRoot!.innerHTML = '';
        this.shadowRoot!.appendChild(container);
    }
}

customElements.define('schedule-element', ScheduleElement);