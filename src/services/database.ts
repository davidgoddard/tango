// database.ts

import { Track, BaseRecord, Playlist, TableNames } from "../data-types";
import { convert } from "./utils";

export type IndexedDBRecord = BaseRecord | Track | Playlist;

export class IndexedDBManager {
  private readonly dbName = "Tanda Player Database";
  private readonly dbVersion = 1; // Increment this for upgrades
  private db: IDBDatabase | null = null;
  private docVectors: Map<string, Map<string, number>> = new Map();
  private trigramIndex: Map<string, Set<string>> = new Map();

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

        if (!db.objectStoreNames.contains("records")) {
          objectStore = db.createObjectStore("records", {
            keyPath: "id",
          });
        } else {
          objectStore = (event.target as IDBRequest).transaction?.objectStore(
            "records"
          ) as IDBObjectStore;
        }

        if (!db.objectStoreNames.contains("trigrams")) {
          objectStore = db.createObjectStore("trigrams", {
            keyPath: "trigram",
          });
        } else {
          objectStore = (event.target as IDBRequest).transaction?.objectStore(
            "trigrams"
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

  async cacheIndexData(): Promise<void> {
    const transaction = this.db?.transaction(["records"], "readonly");
    const recordsStore = transaction?.objectStore("records");

    const recordsRequest = recordsStore?.getAll();
    recordsRequest!.onsuccess = () => {
      const records = recordsRequest!.result;
      records.forEach((record: any) => {
        this.docVectors.set(record.id, new Map(Object.entries(record.vector)));
      });
    };

    return new Promise((resolve, reject) => {
      transaction!.oncomplete = () => resolve();
      transaction!.onerror = (event: Event) =>
        reject((event.target as IDBRequest).error);
    });
  }

  private addToMemoryIndex(id: string, content: string): void {
    const tokens = this.tokenize(content);
    const tf: Map<string, number> = new Map();

    tokens.forEach((token) => {
      const trigrams = this.generateTrigrams("__" + token + "__");
      trigrams.forEach((trigram) => {
        if (!tf.has(trigram)) {
          tf.set(trigram, 0);
        }
        tf.set(trigram, tf.get(trigram)! + 1 / token.length);

        // Update trigram index
        if (!this.trigramIndex.has(trigram)) {
          this.trigramIndex.set(trigram, new Set());
        }
        this.trigramIndex.get(trigram)!.add(id);
      });
    });

    // Normalize the TF vector
    const length = Math.sqrt(
      Array.from(tf.values()).reduce((sum, val) => sum + val * val, 0)
    );
    const normalizedTf = new Map<string, number>();
    tf.forEach((value, key) => {
      normalizedTf.set(key, value / length);
    });

    this.docVectors.set(id, normalizedTf);
  }

  public async index(data: any): Promise<void> {
    const content = [
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

    this.addToMemoryIndex(`${data.type}-${data.id}-${data.name}`, convert(content));
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

  async commitChanges(): Promise<void> {
    const transaction = this.db?.transaction(
      ["records", "trigrams"],
      "readwrite"
    );
    const recordsStore = transaction?.objectStore("records");
    const trigramsStore = transaction?.objectStore("trigrams");

    // Commit records
    this.docVectors.forEach((vector, id) => {
      recordsStore?.put({ id, vector: Object.fromEntries(vector) });
    });

    // Commit trigrams
    this.trigramIndex.forEach((recordIds, trigram) => {
      trigramsStore?.put({ trigram, recordIds: Array.from(recordIds) });
    });

    return new Promise((resolve, reject) => {
      transaction!.oncomplete = () => resolve();
      transaction!.onerror = (event: Event) =>
        reject((event.target as IDBRequest).error);
    });
  }

  private calculateCosineSimilarity(
    vectorA: Map<string, number>,
    vectorB: Map<string, number>
  ): number {
    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    vectorA.forEach((value, key) => {
      dotProduct += value * (vectorB.get(key) || 0);
      normA += value * value;
    });

    vectorB.forEach((value) => {
      normB += value * value;
    });

    if (normA === 0 || normB === 0) return 0;
    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  public async search(query: string): Promise<{ id: string; score: number }[]> {
    const tokens = this.tokenize(query.toLowerCase());
    const tf: Map<string, number> = new Map();

    tokens.forEach((token) => {
      const trigrams = this.generateTrigrams("__" + token + "__");
      trigrams.forEach((trigram) => {
        if (!tf.has(trigram)) {
          tf.set(trigram, 0);
        }
        tf.set(trigram, tf.get(trigram)! + 1 / token.length);
      });
    });

    // Normalize the query TF vector
    const length = Math.sqrt(
      Array.from(tf.values()).reduce((sum, val) => sum + val * val, 0)
    );
    const normalizedTf = new Map<string, number>();
    tf.forEach((value, key) => {
      normalizedTf.set(key, value / length);
    });

    const results: { id: string; score: number }[] = [];

    this.docVectors.forEach((docVector, id) => {
      const score = this.calculateCosineSimilarity(normalizedTf, docVector);
      if (score > 0) {
        results.push({ id, score });
      }
    });

    results.sort((a, b) => b.score - a.score);
    return results;
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
