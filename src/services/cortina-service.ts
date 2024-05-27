import { TandaElement } from "../components/tanda.element";
import { Tanda, Track } from "../data-types";
import { eventBus } from "../events/event-bus";
import { IndexedDBManager } from "./database";
import { renderTrackDetail } from "./utils";

export class CortinaPicker {
  private cortinaWindow = document.querySelector("#cortinaPicker");
  private cortinaList = document.querySelector("#cortinaList")! as HTMLElement;
  private folderSelect = document.querySelector(
    "#folderSelect"
  )! as HTMLSelectElement;
  private cortinas: Track[] = [];
  private folders?: Map<string, Track[]>;
  private lastSelection?: string | null;
  private targetTanda?: TandaElement;

  constructor(private dbManager: IndexedDBManager) {
    this.lastSelection = this.loadPreviousSelection();

    this.cortinaList.addEventListener("click", (event: any) => {
      console.log("selected cortina", event.target);
      this.cortinaWindow?.classList.add("hidden");
      const tanda = this.targetTanda;
      const cortina = tanda!.querySelector('cortina-element');
      if ( cortina ){
        tanda!.replaceChild(event.target.cloneNode(true), cortina)
        tanda!.render();
        eventBus.emit('changed-playlist')
      }
    });

    document.addEventListener("changeCortina", (event: any) => {
      console.log("Request to change cortina", event.detail);
      this.targetTanda = event.detail;
      this.cortinaWindow?.classList.remove("hidden");
      this.chooseCortina();
    });

    this.folderSelect.addEventListener("change", () => {
      const selectedFolder = this.folderSelect.value;
      this.lastSelection = selectedFolder;
      this.saveSelection(selectedFolder);
      this.renderList();
    });

    this.renderList();
  }

  loadPreviousSelection(): string | null {
    return localStorage.getItem("selectedFolder");
  }

  saveSelection(folder: string) {
    localStorage.setItem("selectedFolder", folder);
  }

  renderList() {
    const cortinas = this.folders?.get(this.lastSelection!) || [];
    this.cortinaList.innerHTML = "";
    let html = "";
    cortinas.forEach((cortina, index) => {
      html += renderTrackDetail(index, cortina, "cortina");
    });
    this.cortinaList.innerHTML = html;
  }

  async load() {
    this.cortinas = (await this.dbManager.processEntriesInBatches(
      "cortina",
      (cortina) => {
        return true;
      }
    )) as Track[];
    this.folders = this.parseFolders(this.cortinas);
    this.folderSelect.innerHTML = "";
    this.folderSelect.appendChild(new Option("Select a folder", ""));
    this.folders.forEach((_, folder) => {
      this.folderSelect.appendChild(new Option(folder, folder));
    });
  }

  parseFolders(cortinas: Track[]): Map<string, Track[]> {
    const folderMap = new Map<string, Track[]>();
    cortinas.forEach((cortina) => {
      const path = cortina.name;
      const folder = path
        .split("/")
        .slice(2, path.split("/").length - 1)
        .join("-");
      if (!folderMap.has(folder)) {
        folderMap.set(folder, []);
      }
      folderMap.get(folder)?.push(cortina);
    });
    return folderMap;
  }

  async chooseCortina() {}
}
