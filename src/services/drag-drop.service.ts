
let draggingElement: HTMLElement;


export const addDragDropHandlers = (): void => {

    // Centralized drag start handler
    document.addEventListener('dragstart', dragStartHandler);

    // Centralized drag end handler
    document.addEventListener('dragend', (event) => {
        const target = event.target as HTMLElement;
        if (target.matches('[draggable]')) {
            console.log('dragend', target.dataset.id);
        }
    });

    // Centralized drag over handler
    document.addEventListener('dragover', (event) => {
        event.preventDefault();
        const target = event.target as HTMLElement;
        if (isValidDropTarget(draggingElement, target))
            target.classList.add('drop-target')
        console.log('dragover', target.id);
        event.dataTransfer!.dropEffect = 'move';
    });

    document.addEventListener('dragleave', (event) => {
        event.preventDefault();
        const target = event.target as HTMLElement;
        target.classList.remove('drop-target')
    });

    // Centralized drop handler
    document.addEventListener('drop', (event) => {
        event.preventDefault();
        document.querySelector('.drop-target')?.classList.remove('drop-target')

        let target;
        switch (draggingElement.tagName) {
            case 'TANDA-ELEMENT': {
                target = (event.target as HTMLElement).closest('tanda-element');
                break;
            }
            case 'TRACK-ELEMENT': {
                target = (event.target as HTMLElement).closest('track-element');
                break;
            }
            case 'CORTINA-ELEMENT': {
                target = (event.target as HTMLElement).closest('cortina-element');
                break;
            }
            default: {
                break;
            }

        }
        if (!target) {
            target = (event.target as HTMLElement).closest('.dropzone');
        }

        console.log('Found drop zone', target)

        if (target) {
            if (draggingElement && isValidDropTarget(draggingElement, target as HTMLElement)) {
                console.log('drop', target.id);
                // Handle the drop logic (e.g., swapping elements)
                swapElements(target as HTMLElement, draggingElement)

            }
        }
    });

};

function isValidDropTarget(source: HTMLElement, target: HTMLElement): boolean {
    console.log('Is valid', source, target)
    return source !== target && source.tagName == target.tagName;
}

function swapElements(element1: HTMLElement, element2: HTMLElement) {
    // Create a temporary placeholder element
    const temp = document.createElement("div");

    // Insert temp before element1
    element1.parentNode!.insertBefore(temp, element1);

    // Move element1 to before element2
    element2.parentNode!.insertBefore(element1, element2);

    // Move element2 to before temp (which is now where element1 used to be)
    temp.parentNode!.insertBefore(element2, temp);

    // Remove temp
    temp.parentNode!.removeChild(temp);
}

export function dragStartHandler(event: any) {
    const target = event.target as HTMLElement;
    if (target.matches('[draggable]')) {
        console.log('dragstart', target.dataset.id);
        event.dataTransfer?.setData('text/plain', target.dataset.id!);
        draggingElement = target;
    }

}