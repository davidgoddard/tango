import { TandaElement } from "../components/tanda.element";
import { eventBus } from "../events/event-bus";
import { createPlaceHolder } from "./utils";

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

function closestParent(node: Element, selector: string) {

  if (!node) {
      return null;
  }

  if (node instanceof ShadowRoot) {
      return closestParent(node.host, selector);
  }

  if (node instanceof HTMLElement) {
      if (node.matches(selector)) {
          return node;
      } else {
          return closestParent(node.parentNode as Element, selector);
      }
  }

  return closestParent(node.parentNode as Element, selector);

}

function isValidDropTarget(source: HTMLElement, target: HTMLElement): boolean {
  console.log(
    "Is valid",
    source.tagName,
    target.tagName,
    source.dataset.style,
    target.dataset.style
  );
  if (closestParent(target, ".results")) {
    return false;
  }
  let valid = sameStyle(
    source.dataset?.style || "",
    target.dataset?.style || ""
  );
  return (
    closestParent(target, "SCRATCH-PAD-ELEMENT") !== undefined ||
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

  element1.classList.remove('drop-target');
  element2.classList.remove('drop-target');

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

  // Go up to the nearest tanda and re-render it
  new Array(element1, element2).forEach((element: HTMLElement) => {
    let tanda = element;
    if (tanda.tagName !== "TANDA-ELEMENT") {
      tanda = closestParent(tanda, "tanda-element")!;
    }
    if (tanda) (tanda as TandaElement).render();
  });
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

  let target: HTMLElement;
  target = closestParent((event.target as HTMLElement), draggingElement.tagName)!;
  if (!target) {
    console.log("No target yet - ", event.target);
    if (closestParent(event.target, ".scratchpad-tab-content")) {
      // If dragging from the playlist to the scratch-pad...
      if (closestParent(draggingElement, "#playlistContainer")) {
        // Create a dummy object to swap back into the playlist
        const swap = document.createElement(draggingElement.tagName);
        if (draggingElement.tagName === "TANDA-ELEMENT") {
          swap.dataset.style = draggingElement.dataset.style;
          let html = "";
          for (const child of draggingElement.children) {
            html += createPlaceHolder(child.tagName, swap.dataset.style!);
          }
          swap.innerHTML = html;
        } else {
          swap.dataset.title = "place holder";
          swap.dataset.style = draggingElement.dataset.style;
        }
        event.target.appendChild(swap);
        swapElements(draggingElement, swap);
      } else {
        console.log("Nearest", closestParent(draggingElement, ".results"));
        if (closestParent(draggingElement, ".results")) {
          event.target.appendChild(draggingElement.cloneNode(true));
        }
      }
      event.target.classList.remove('drop-target');
    }


    eventBus.emit("changed-playlist");
    return; // early
  }

  console.log("Found drop zone", target, "dragging", draggingElement);
  console.log("Valid?", isValidDropTarget(draggingElement, target));

  if (target) {
    if (draggingElement && isValidDropTarget(draggingElement, target)) {
      console.log("drop", target.id);
      // is this a drop from the search results straight into the playlist
      if (
        closestParent(draggingElement, ".results")
      ) {
        // Yes - therefore put the target into the scratchpad and leave the source alone
        let targetParent = target.parentElement!;
        targetParent.insertBefore(draggingElement.cloneNode(true), target);
        const scratchpad = document.querySelector("#scratchPad");
        scratchpad?.appendChild(target);

        console.log('Drop target parent', targetParent)
        if (targetParent.tagName === 'TANDA-ELEMENT') {
          (targetParent as unknown as TandaElement).render();
        }
      } else {
        swapElements(draggingElement, target);
      }
    }
  }
  eventBus.emit("changed-playlist");

}

export function dragEndHandler(event: any) {
  const target = event.target as HTMLElement;
  if (target.matches("[draggable]")) {
    // console.log("dragend", target.dataset.id);
  }
}
