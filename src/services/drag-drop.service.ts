let draggingElement: HTMLElement;

export const addDragDropHandlers = (
  container: HTMLElement | Document
): void => {
  // Centralized drag start handler
  container.addEventListener("dragstart", dragStartHandler);

  // Centralized drag end handler
  container.addEventListener("dragend", dragEndHandler);

  // Centralized drag over handler
  container.addEventListener("dragover", dragOverHandler);

  container.addEventListener("dragleave", dragLeaveHandler);

  // Centralized drop handler
  container.addEventListener("drop", dragDropHandler);
};

function isValidDropTarget(source: HTMLElement, target: HTMLElement): boolean {
    console.log("Is valid", source.tagName, target.tagName, source.dataset.style, target.dataset.style);
  let valid = sameStyle(
    source.dataset?.style || "",
    target.dataset?.style || ""
  );
  return (
    target.tagName == "SCRATCH-PAD-ELEMENT" ||
    (source !== target && source.tagName == target.tagName && valid)
  );
}

function sameStyle(a: string, b: string): boolean {
  if (a == b) return true;
  if (a.charAt(0).toUpperCase() == "U" || b.charAt(0).toUpperCase() == "U")
    return true;
  return false;
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
  if (target.matches("[draggable]")) {
    console.log("dragstart", target.dataset.id);
    event.dataTransfer?.setData("text/plain", target.dataset.id!);
    draggingElement = target;
  }
}

export function dragOverHandler(event: any) {
  event.preventDefault();
  const target = event.target as HTMLElement;
  if (isValidDropTarget(draggingElement, target)) {
    target.classList.add("drop-target");
    // console.log("dragover", target.id);
    event.dataTransfer!.dropEffect = "move";
  }
}

export function dragLeaveHandler(event: any) {
  event.preventDefault();
  const target = event.target as HTMLElement;
  target.classList.remove("drop-target");
}

export function dragDropHandler(event: any) {
  event.preventDefault();
  document.querySelector(".drop-target")?.classList.remove("drop-target");

  let target;
  target = (event.target as HTMLElement).closest(draggingElement.tagName);
  if (!target) {
    console.log("No target yet - ", event.target);
    if ( event.target.tagName === 'SCRATCH-PAD-ELEMENT'){
        console.log(draggingElement.parentElement)
        if ( draggingElement.parentElement?.id === 'playlistContainer'){
            // Create a dummy object to swap it with
            const swap = document.createElement(draggingElement.tagName);
            if ( draggingElement.tagName === 'TANDA-ELEMENT'){
                swap.dataset.style = draggingElement.dataset.style;
                let html = '';
                console.log(draggingElement.children)
                for ( let i = 0; i < draggingElement.children.length; i++ ){
                    let child = draggingElement.children[i];
                    html += `<${child.tagName} data-title="place-holder" data-style="${swap.dataset.style}"></${child.tagName}>`
                }
                swap.innerHTML = html;
            } else {
                swap.dataset.title = 'place-holder';
                swap.dataset.style = draggingElement.dataset.style;
            }
            event.target.appendChild(swap)
            swapElements(draggingElement, swap)
        } else {
            console.log('Nearest', draggingElement.parentElement)
            if ( draggingElement.parentElement?.classList.contains('content')){
                event.target.appendChild(draggingElement)
            }
        }
    }
    return;
  }

  console.log("Found drop zone", target, "dragging", draggingElement);
  console.log(
    "Valid?",
    isValidDropTarget(draggingElement, target as HTMLElement)
  );

  if (target) {
    if (
      draggingElement &&
      isValidDropTarget(draggingElement, target as HTMLElement)
    ) {
      console.log("drop", target.id);
      // Handle the drop logic (e.g., swapping elements)
      swapElements(target as HTMLElement, draggingElement);
    }
  }
}

export function dragEndHandler(event: any) {
  const target = event.target as HTMLElement;
  if (target.matches("[draggable]")) {
    // console.log("dragend", target.dataset.id);
  }
}
