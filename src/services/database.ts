// database.ts

import { Track, BaseRecord, Playlist, TableNames } from "../data-types";
import { convert } from "./utils";


export type IndexedDBRecord = BaseRecord | Track | Playlist;

export class IndexedDBManager {
  private readonly dbName = "Tanda Player Database";
  private readonly dbVersion = 1; // Increment this for upgrades
  private db: IDBDatabase | null = null;

  constructor() {
    console.log("Created Database object");
  }

  public async resetDatabase(): Promise<void> {
    console.log("Closing the database");

    if (this.db) {
      this.db.close();
    }

    console.log("Removing the database");
    const deleteRequest = indexedDB.deleteDatabase(this.dbName);

    deleteRequest.onsuccess = () => {
      console.log("Database deleted successfully");
    };

    deleteRequest.onerror = () => {
      console.error("Error deleting database");
    };

    await this.init();
  }

  public init(): Promise<IndexedDBManager> {
    return new Promise((resolve, reject) => {
      if (!window.indexedDB) {
        const errorMsg = "IndexedDB is not supported by this browser.";
        console.error(errorMsg);
        reject(errorMsg);
      }

      const request = indexedDB.open(this.dbName, this.dbVersion);

      request.onerror = (event: Event) => {
        console.error(
          "Database error: " + (event.target as IDBRequest).error?.message
        );
        reject((event.target as IDBRequest).error);
      };

      request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
        console.log("Upgrade needed");
        const db = (event.target as IDBRequest).result as IDBDatabase;
        const tables: TableNames[] = [
          "system",
          "track",
          "cortina",
          "tanda",
          "scratchpad",
          "playlist",
        ];

        tables.forEach((table) => {
          let objectStore: IDBObjectStore;

          if (!db.objectStoreNames.contains(table)) {
            objectStore = db.createObjectStore(table, {
              keyPath: "id",
              autoIncrement: true,
            });
          } else {
            objectStore = (event.target as IDBRequest).transaction?.objectStore(
              table
            ) as IDBObjectStore;
          }

          if (table === "track" || table === "cortina") {
            if (!objectStore.indexNames.contains("name")) {
              objectStore.createIndex("name", "name", { unique: true });
            }
          }

          if (table === "playlist") {
            if (!objectStore.indexNames.contains("name")) {
              objectStore.createIndex("name", "name", { unique: true });
            }
          }
        });

        // Handle special indexing tables
        
        let objectStore: IDBObjectStore;

        if (!db.objectStoreNames.contains('records')) {
          objectStore = db.createObjectStore('records', {
            keyPath: "id"
          });
        } else {
          objectStore = (event.target as IDBRequest).transaction?.objectStore(
            'records'
          ) as IDBObjectStore;
        }

        if (!db.objectStoreNames.contains('trigrams')) {
          objectStore = db.createObjectStore('trigrams', {
            keyPath: "trigram"
          });
        } else {
          objectStore = (event.target as IDBRequest).transaction?.objectStore(
            'trigrams'
          ) as IDBObjectStore;
        }


    };

      request.onsuccess = (event: Event) => {
        console.log("Success in opening database");
        this.db = (event.target as IDBRequest).result as IDBDatabase;
        resolve(this);
      };
    });
  }

  private index(data: any): void {
    const stringValues = [
      data.id,
      data.label,
      data.name,
      data.metadata?.tags?.artist,
      data.metadata?.tags?.title,
      data.metadata?.tags?.year,
      data.metadata?.tags?.notes,
    ]
      .filter((x) => x)
      .join(" ")
      .toLowerCase();

    this.addToIndex(
      convert(`${data.type}-${data.id}-${data.name}`),
      convert(stringValues)
    );
  }

  // Helper function to tokenize a string into words
  private tokenize(text: string): string[] {
    return text.split(/\s+/);
  }

  // Helper function to generate trigrams from a word
  private generateTrigrams(word: string): string[] {
    const trigrams: string[] = [];
    for (let i = 0; i <= word.length - 3; i++) {
      trigrams.push(word.substring(i, i + 3));
    }
    return trigrams;
  }

  private async addToIndex(id: string, text: string): Promise<void> {
    const tokens = this.tokenize(text);
    const trigrams = new Set<string>();

    tokens.forEach((token) => {
      this.generateTrigrams('__' + token + '__').forEach((trigram) => {
        trigrams.add(trigram);
      });
    });

    const transaction = this.db?.transaction(
      ["records", "trigrams"],
      "readwrite"
    );
    const recordsStore = transaction?.objectStore("records");
    const trigramsStore = transaction?.objectStore("trigrams");

    // Add or update the record
    const recordRequest = recordsStore?.put({ id, content: text });
    recordRequest!.onsuccess = async () => {
      // Update trigrams
      for (const trigram of trigrams) {
        const trigramRequest = trigramsStore?.get(trigram);
        trigramRequest!.onsuccess = () => {
          let recordIds = trigramRequest!.result?.recordIds || [];
          if (!recordIds.includes(id)) {
            recordIds.push(id);
          }
          trigramsStore?.put({ trigram, recordIds });
        };
      }
    };

    return new Promise((resolve, reject) => {
      transaction!.oncomplete = () => resolve();
      transaction!.onerror = (event: Event) =>
        reject((event.target as IDBRequest).error);
    });
  }

  public async search(query: string): Promise<{ id: string; score: number }[]> {
    const queryTokens = this.tokenize(convert(query.toLowerCase())).filter(x => x);
    console.log('Search tokens', queryTokens)
    if ( !queryTokens.length ) return []
    const queryTrigrams = new Set<string>();

    queryTokens.forEach((token) => {
      this.generateTrigrams('__' + token + '__').forEach((trigram) => {
        queryTrigrams.add(trigram);
      });
    });

    const transaction = this.db?.transaction(["trigrams"], "readonly");
    const trigramsStore = transaction?.objectStore("trigrams");

    const candidateScores: Map<string, number> = new Map<string, number>();

    return new Promise((resolve, reject) => {
      let remainingTrigrams = queryTrigrams.size;
      queryTrigrams.forEach((trigram) => {
        const request = trigramsStore?.get(trigram);
        request!.onsuccess = () => {
          const recordIds = request!.result?.recordIds || [];
          recordIds.forEach((id: string) => {
            if (!candidateScores.has(id)) {
              candidateScores.set(id, 0);
            }
            candidateScores.set(id, candidateScores.get(id)! + 1);
          });
          remainingTrigrams -= 1;
          if (remainingTrigrams === 0) {
            const results: { id: string; score: number }[] = [];
            candidateScores.forEach((score, id) => {
              results.push({ id, score });
            });
            results.sort((a, b) => b.score - a.score);
            resolve(results);
          }
        };
        request!.onerror = (event: Event) => {
          console.error(
            "Error fetching trigram data: ",
            (event.target as IDBRequest).error
          );
          reject((event.target as IDBRequest).error);
        };
      });
    });
  }

  public async updateData(
    table: TableNames,
    id: number,
    updates: Partial<IndexedDBRecord>
  ): Promise<number> {
    return new Promise((resolve, reject) => {
      const transaction = this.db?.transaction([table], "readwrite");
      const store = transaction?.objectStore(table);

      const getRequest = store?.get(id);

      getRequest!.onsuccess = () => {
        const data = getRequest!.result;

        if (data) {
          Object.assign(data, updates);

          const putRequest = store!.put(data);

          putRequest.onsuccess = () => {
            if (["track", "cortina", "tanda"].includes(table)) {
              this.index(data);
            }
            resolve(putRequest.result as number);
          };

          putRequest.onerror = (event: Event) => {
            console.error(
              "Error updating data: ",
              (event.target as IDBRequest).error
            );
            reject((event.target as IDBRequest).error);
          };
        } else {
          reject(new Error("Record not found"));
        }
      };

      getRequest!.onerror = (event: Event) => {
        console.error(
          "Error retrieving data to update: ",
          (event.target as IDBRequest).error
        );
        reject((event.target as IDBRequest).error);
      };
    });
  }

  public async addData(
    table: TableNames,
    data: IndexedDBRecord
  ): Promise<number> {
    return new Promise((resolve, reject) => {
      const transaction = this.db?.transaction([table], "readwrite");
      const store = transaction?.objectStore(table);
      const request = store?.add(data);

      request!.onsuccess = () => {
        if (["track", "cortina", "tanda"].includes(table)) {
          this.index(data);
        }
        resolve(request!.result as number);
      };

      request!.onerror = (event: Event) => {
        console.error("Data causing error: ", table, data);
        console.error(
          "Error adding data: ",
          (event.target as IDBRequest).error
        );
        reject((event.target as IDBRequest).error);
      };
    });
  }

  public async getDataById(
    table: TableNames,
    id: number
  ): Promise<IndexedDBRecord | undefined> {
    return new Promise((resolve, reject) => {
      const transaction = this.db?.transaction([table]);
      const store = transaction?.objectStore(table);
      const request = store?.get(id);

      request!.onsuccess = () => {
        resolve(request!.result);
      };

      request!.onerror = (event: Event) => {
        console.error(
          "Error fetching data: ",
          (event.target as IDBRequest).error
        );
        reject((event.target as IDBRequest).error);
      };
    });
  }

  public async clearAllData(table: TableNames): Promise<void> {
    return new Promise((resolve, reject) => {
      const transaction = this.db?.transaction([table], "readwrite");
      const store = transaction?.objectStore(table);
      const request = store?.clear();

      request!.onsuccess = () => {
        resolve();
      };

      request!.onerror = (event: Event) => {
        console.error(
          "Error fetching data: ",
          (event.target as IDBRequest).error
        );
        reject((event.target as IDBRequest).error);
      };
    });
  }

  public async getDataByName(
    table: TableNames,
    name: string
  ): Promise<IndexedDBRecord | undefined> {
    return new Promise((resolve, reject) => {
      const transaction = this.db?.transaction([table]);
      const store = transaction?.objectStore(table);
      const index = store?.index("name");
      const request = index?.get(name);

      request!.onsuccess = () => {
        resolve(request!.result);
      };

      request!.onerror = (event: Event) => {
        console.error(
          "Error fetching data by name: ",
          (event.target as IDBRequest).error
        );
        reject((event.target as IDBRequest).error);
      };
    });
  }

  public async exportAllData(): Promise<string> {
    const transaction = this.db?.transaction(
      Array.from(this.db?.objectStoreNames || []),
      "readonly"
    );
    const data: Record<string, IndexedDBRecord[]> = {};

    const getAllRecords = (
      store: IDBObjectStore
    ): Promise<IndexedDBRecord[]> => {
      return new Promise((resolve, reject) => {
        const request = store.getAll();

        request.onerror = () => reject(request.error);
        request.onsuccess = () => resolve(request.result as IndexedDBRecord[]);
      });
    };

    for (const name of Array.from(this.db?.objectStoreNames || [])) {
      const store = transaction?.objectStore(name);
      data[name] = await getAllRecords(store!);
    }

    return JSON.stringify(data);
  }

  public async processEntriesInBatches(
    table: TableNames,
    filterFunction: (value: any, index: number, array: any[]) => boolean,
    batchSize = 500
  ): Promise<IndexedDBRecord[]> {
    return new Promise((resolve, reject) => {
      const results: IndexedDBRecord[] = [];
      const transaction = this.db?.transaction([table]);
      const store = transaction?.objectStore(table) as IDBObjectStore;
      let totalCount = 0;

      const getAllRequest = store.getAll();
      getAllRequest.onsuccess = function () {
        const allRecords = getAllRequest.result;
        totalCount = allRecords.length;
        let processedCount = 0;
        let startIndex = 0;

        const processNextBatch = () => {
          const endIndex = Math.min(startIndex + batchSize, totalCount);
          console.log("Another batch", startIndex, endIndex);
          const batch = allRecords.slice(startIndex, endIndex);
          const filteredBatch = batch.filter(filterFunction);
          results.push(...filteredBatch);
          processedCount += filteredBatch.length;
          startIndex += batchSize;

          if (startIndex < totalCount) {
            setTimeout(processNextBatch, 0); // Process next batch asynchronously
          } else {
            console.log("All entries processed");
            resolve(results);
          }
        };

        processNextBatch(); // Start processing the first batch
      };

      getAllRequest.onerror = function (event: any) {
        console.error("Error retrieving all records: ", event.target.errorCode);
        reject(event.target);
      };
    });
  }
}

// Singleton Pattern
let databaseManagerInstance: IndexedDBManager | null = null;
let initializationPromise: Promise<IndexedDBManager> | null = null;

const initializeDatabaseManager = async (): Promise<IndexedDBManager> => {
  if (!initializationPromise) {
    initializationPromise = new Promise(async (resolve) => {
      const manager = new IndexedDBManager();
      await manager.init();
      console.log("Database initialized");
      databaseManagerInstance = manager;
      resolve(manager);
    });
  }

  return initializationPromise;
};

export const DatabaseManager = async (): Promise<IndexedDBManager> => {
  return await initializeDatabaseManager();
};

console.log("Running database module");
