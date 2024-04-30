// db.js
class IndexedDBManager {
    constructor() {
        this.dbName = 'MyAppDatabase';
        this.dbVersion = 2; // Increment this for upgrades
        this.db = null;
        console.log(`Created Database object`)
    }

    async init() {
        return new Promise((resolve, reject) => {
            if (!window.indexedDB) {
                console.error("IndexedDB is not supported by this browser.");
                reject("IndexedDB is not supported by this browser.");
            }

            const request = indexedDB.open(this.dbName, this.dbVersion);

            request.onerror = (event) => {
                console.error("Database error: " + event.target.errorCode);
                reject(event.target.errorCode);
            };

            request.onupgradeneeded = (event) => {
                const db = event.target.result;
                // Create tables if they don't exist
                const tables = ['system', 'track', 'cortina', 'tanda', 'scratchpad', 'playlist'];
                tables.forEach(table => {
                    let objectStore;
                    if (!db.objectStoreNames.contains(table)) {
                        objectStore = db.createObjectStore(table, { keyPath: 'id', autoIncrement: true });
                    } else {
                        objectStore = request.transaction.objectStore(table);
                    }
                    if (table === 'track') {
                        // Create an index on the 'name' property if it doesn't already exist
                        if (!objectStore.indexNames.contains('relativeFileName')) {
                            objectStore.createIndex('relativeFileName', 'relativeFileName', { unique: true });
                        }
                    }
                });
            };

            request.onsuccess = (event) => {
                this.db = event.target.result;
                resolve(this);
            };
        });
    }


    async updateData(table, id, updates) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([table], 'readwrite');
            const store = transaction.objectStore(table);

            // Retrieve the current data first
            const getRequest = store.get(id);
            getRequest.onsuccess = () => {
                const data = getRequest.result;
                if (data) {
                    // Apply updates to the retrieved data
                    Object.assign(data, updates);

                    // Put the updated data back into the store
                    const putRequest = store.put(data);
                    putRequest.onsuccess = () => {
                        resolve(putRequest.result);
                    };
                    putRequest.onerror = (event) => {
                        console.error("Error updating data: ", event.target.error);
                        reject(event.target.error);
                    };
                } else {
                    reject(new Error('Record not found'));
                }
            };
            getRequest.onerror = (event) => {
                console.error("Error retrieving data to update: ", event.target.error);
                reject(event.target.error);
            };
        });
    }



    async addData(table, data) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([table], 'readwrite');
            const store = transaction.objectStore(table);
            const request = store.add(data);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = (event) => {
                console.error("Error adding data: ", event.target.error);
                reject(event.target.error);
            };
        });
    }

    async getDataById(table, id) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([table]);
            const store = transaction.objectStore(table);
            const request = store.get(id);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = (event) => {
                console.error("Error fetching data: ", event.target.error);
                reject(event.target.error);
            };
        });
    }

    async getDataByName(table, name) {
        return new Promise((resolve, reject) => {
            const transaction = this.db.transaction([table]);
            const store = transaction.objectStore(table);
            console.log(`Table ${table} name ${name}`)
            const index = store.index('relativeFileName');
            const request = index.get(name);

            request.onsuccess = () => {
                resolve(request.result);
            };

            request.onerror = (event) => {
                console.error("Error fetching data by name: ", event.target.error);
                reject(event.target.error);
            };
        });
    }

    processEntriesInBatches(table, filterFunction) {
        return new Promise((resolve, reject) => {

            const results = [];
            const transaction = this.db.transaction([table], "readonly");
            const store = transaction.objectStore(table);
            const cursorRequest = store.openCursor();
            let count = 0;
            const batchSize = 500; // Process 500 items at a time

            cursorRequest.onsuccess = function (event) {
                const cursor = event.target.result;
                if (cursor) {
                    // Process the current entry
                    if (filterFunction(cursor.value)) {
                        results.push(cursor.value)
                    }
                    count++;
                    // Break after processing a batch to allow UI updates
                    if (count % batchSize === 0) {
                        setTimeout(() => cursor.continue(), 0); // Resume processing after a break
                    } else {
                        cursor.continue();
                    }
                } else {
                    console.log("All entries processed");
                    resolve(results)
                }
            };

            cursorRequest.onerror = function (event) {
                console.error("Error during cursor processing: ", event.target.errorCode);
                reject(event.target)
            };

        })

    }

    async exportAllData() {
        const transaction = this.db.transaction(this.db.objectStoreNames, 'readonly');
        let data = {};
    
        for (let name of this.db.objectStoreNames) {
            const store = transaction.objectStore(name);
            const allRecords = await getAllRecords(store);
            data[name] = allRecords;
        }
    
        return JSON.stringify(data);  // Convert the data object to a JSON string
    
        function getAllRecords(store) {
            return new Promise((resolve, reject) => {
                const request = store.getAll();
                request.onerror = () => reject(request.error);
                request.onsuccess = () => resolve(request.result);
            });
        }
    }
    
}

export const DatabaseManager = await new IndexedDBManager().init();
console.log('Database initialized');
