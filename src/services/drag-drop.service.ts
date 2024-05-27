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

function isValidDropTarget(source: HTMLElement, target: HTMLElement): boolean {
  console.log(
    "Is valid",
    source.tagName,
    target.tagName,
    source.dataset.style,
    target.dataset.style
  );
  if (target.closest(".results")) {
    return false;
  }
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

  // Go up to the nearest tanda and re-render it
  [element1, element2].forEach((element: HTMLElement) => {
    let tanda = element;
    if (!(tanda.tagName === "TANDA-ELEMENT")) {
      tanda = tanda.closest("tanda-element")!;
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
  target = (event.target as HTMLElement).closest(draggingElement.tagName)!;
  if (!target) {
    console.log("No target yet - ", event.target);
    if (event.target.tagName === "SCRATCH-PAD-ELEMENT") {
      if (draggingElement.closest("#playlistContainer")) {
        // Create a dummy object to swap it with
        const swap = document.createElement(draggingElement.tagName);
        if (draggingElement.tagName === "TANDA-ELEMENT") {
          swap.dataset.style = draggingElement.dataset.style;
          let html = "";
          for (let i = 0; i < draggingElement.children.length; i++) {
            let child = draggingElement.children[i];
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
        console.log("Nearest", draggingElement.closest(".results"));
        if (draggingElement.closest(".results")) {
          event.target.appendChild(draggingElement.cloneNode(true));
        }
      }
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
        target.closest("#playlistContainer") &&
        draggingElement.closest(".results")
      ) {
        // Yes - therefore put the target into the scratchpad and leave the source alone
        let targetParent = target.parentElement!;
        targetParent.insertBefore(draggingElement.cloneNode(true), target);
        const scratchpad = document.querySelector("#scratchPad");
        scratchpad?.appendChild(target);
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
