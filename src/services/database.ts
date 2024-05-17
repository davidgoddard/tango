// database.ts

import { Track, BaseRecord, Playlist, TableNames } from '../data-types'


export type IndexedDBRecord = BaseRecord | Track | Playlist ;

export class IndexedDBManager {
    private readonly dbName = 'Tanda Player Database';
    private readonly dbVersion = 1; // Increment this for upgrades
    private db: IDBDatabase | null = null;

    constructor() {
        console.log('Created Database object');
    }

    public async resetDatabase(): Promise<void> {
        console.log('Closing the database');

        if (this.db) {
            this.db.close();
        }

        console.log('Removing the database');
        const deleteRequest = indexedDB.deleteDatabase(this.dbName);

        deleteRequest.onsuccess = () => {
            console.log('Database deleted successfully');
        };

        deleteRequest.onerror = () => {
            console.error('Error deleting database');
        };

        await this.init();
    }

    public init(): Promise<IndexedDBManager> {
        return new Promise((resolve, reject) => {
            if (!window.indexedDB) {
                const errorMsg = 'IndexedDB is not supported by this browser.';
                console.error(errorMsg);
                reject(errorMsg);
            }

            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = (event: Event) => {
                console.error('Database error: ' + (event.target as IDBRequest).error?.message);
                reject((event.target as IDBRequest).error);
            };

            request.onupgradeneeded = (event: IDBVersionChangeEvent) => {
                console.log('Upgrade needed');
                const db = (event.target as IDBRequest).result as IDBDatabase;
                const tables: TableNames[] = ['system', 'track', 'cortina', 'tanda', 'scratchpad', 'playlist'];

                tables.forEach((table) => {
                    let objectStore: IDBObjectStore;

                    if (!db.objectStoreNames.contains(table)) {
                        objectStore = db.createObjectStore(table, { keyPath: 'id', autoIncrement: true });
                    } else {
                        objectStore = (event.target as IDBRequest).transaction?.objectStore(table) as IDBObjectStore;
                    }

                    if (table === 'track' || table === 'cortina') {
                        if (!objectStore.indexNames.contains('name')) {
                            objectStore.createIndex('name', 'name', { unique: true });
                        }
                    }

                    if (table === 'playlist') {
                        if (!objectStore.indexNames.contains('name')) {
                            objectStore.createIndex('name', 'name', { unique: true });
                        }
                    }
                });
            };

            request.onsuccess = (event: Event) => {
                console.log('Success in opening database');
                this.db = (event.target as IDBRequest).result as IDBDatabase;
                resolve(this);
            };
        });
    }

    public async updateData(table: TableNames, id: number, updates: Partial<IndexedDBRecord>): Promise<number> {
        return new Promise((resolve, reject) => {
            const transaction = this.db?.transaction([table], 'readwrite');
            const store = transaction?.objectStore(table);

            const getRequest = store?.get(id);

            getRequest!.onsuccess = () => {
                const data = getRequest!.result;

                if (data) {
                    Object.assign(data, updates);

                    const putRequest = store!.put(data);

                    putRequest.onsuccess = () => {
                        resolve(putRequest.result as number);
                    };

                    putRequest.onerror = (event: Event) => {
                        console.error('Error updating data: ', (event.target as IDBRequest).error);
                        reject((event.target as IDBRequest).error);
                    };
                } else {
                    reject(new Error('Record not found'));
                }
            };

            getRequest!.onerror = (event: Event) => {
                console.error('Error retrieving data to update: ', (event.target as IDBRequest).error);
                reject((event.target as IDBRequest).error);
            };
        });
    }

    public async addData(table: TableNames, data: IndexedDBRecord): Promise<number> {
        return new Promise((resolve, reject) => {
            const transaction = this.db?.transaction([table], 'readwrite');
            const store = transaction?.objectStore(table);
            const request = store?.add(data);

            request!.onsuccess = () => {
                resolve(request!.result as number);
            };

            request!.onerror = (event: Event) => {
                console.error('Data causing error: ', table, data)
                console.error('Error adding data: ', (event.target as IDBRequest).error);
                reject((event.target as IDBRequest).error);
            };
        });
    }

    public async getDataById(table: TableNames, id: number): Promise<IndexedDBRecord | undefined> {
        return new Promise((resolve, reject) => {
            const transaction = this.db?.transaction([table]);
            const store = transaction?.objectStore(table);
            const request = store?.get(id);

            request!.onsuccess = () => {
                resolve(request!.result);
            };

            request!.onerror = (event: Event) => {
                console.error('Error fetching data: ', (event.target as IDBRequest).error);
                reject((event.target as IDBRequest).error);
            };
        });
    }

    public async clearAllData(table: TableNames): Promise<void> {
        return new Promise((resolve, reject) => {
            const transaction = this.db?.transaction([table], 'readwrite');
            const store = transaction?.objectStore(table);
            const request = store?.clear();

            request!.onsuccess = () => {
                resolve();
            };

            request!.onerror = (event: Event) => {
                console.error('Error fetching data: ', (event.target as IDBRequest).error);
                reject((event.target as IDBRequest).error);
            };
        });
    }

    public async getDataByName(table: TableNames, name: string): Promise<IndexedDBRecord | undefined> {
        return new Promise((resolve, reject) => {
            const transaction = this.db?.transaction([table]);
            const store = transaction?.objectStore(table);
            const index = store?.index('name');
            const request = index?.get(name);

            request!.onsuccess = () => {
                resolve(request!.result);
            };

            request!.onerror = (event: Event) => {
                console.error('Error fetching data by name: ', (event.target as IDBRequest).error);
                reject((event.target as IDBRequest).error);
            };
        });
    }

    public async exportAllData(): Promise<string> {
        const transaction = this.db?.transaction(Array.from(this.db?.objectStoreNames || []), 'readonly');
        const data: Record<string, IndexedDBRecord[]> = {};

        const getAllRecords = (store: IDBObjectStore): Promise<IndexedDBRecord[]> => {
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

    public async processEntriesInBatches(table: TableNames, filterFunction: (value: any, index: number, array: any[]) => boolean, batchSize = 500): Promise<IndexedDBRecord[]> {
        return new Promise((resolve, reject) => {
            const results:IndexedDBRecord[]  = [];
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
                    console.log('Another batch', startIndex, endIndex)
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

            getAllRequest.onerror = function (event:any) {
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
            console.log('Database initialized');
            databaseManagerInstance = manager;
            resolve(manager);
        });
    }

    return initializationPromise;
};

export const DatabaseManager = async (): Promise<IndexedDBManager> => {
    return await initializeDatabaseManager();
};

console.log('Running database module')