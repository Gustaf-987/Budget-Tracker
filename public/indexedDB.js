let db;
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function(event) {
    const db = event.target.result;
    db.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = function(event) {
    db = event.target.result;

    // check if app is online before reading from db
    if (navigator.onLine) {
        checkDatabase();
    }
};

request.onerror = function(event) {
    console.log("There was an error! " + event.target.errorCode);
};

function saveRecord(record) {
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending");

    store.add(record);
}

function checkDatabase() {
    const transaction = db.transaction(["pending"], "readwrite");
    const store = transaction.objectStore("pending");
    const getAll = store.getAll();

    getAll.onsuccess = function() {
        if (getAll.result.length > 0) {
            fetch("/api/transaction/bulk", {
                    method: "POST",
                    body: JSON.stringify(getAll.result),
                    headers: {
                        Accept: "application/json, text/plain, */*",
                        "Content-Type": "application/json"
                    }
                })
                .then(response => response.json())
                .then(() => {
                    // delete records if successful
                    const transaction = db.transaction(["pending"], "readwrite");
                    const store = transaction.objectStore("pending");
                    store.clear();
                });
        }
    };
}

// listen for app coming back online
window.addEventListener("online", checkDatabase);

// export function checkForIndexedDb() {
//     if (!window.indexedDB) {
//         console.log("Your browser doesn't support a stable version of IndexedDB.");
//         return false;
//     }
//     return true;
// }

// export function useIndexedDb(databaseName, storeName, method, object) {
//     return new Promise((resolve, reject) => {
//         const request = window.indexedDB.open(databaseName, 1);
//         let db,
//             tx,
//             store;

//         request.onupgradeneeded = function(e) {
//             const db = request.result;
//             db.createObjectStore(storeName, { keyPath: "_id" });
//         };

//         request.onerror = function(e) {
//             console.log("There was an error");
//         };

//         request.onsuccess = function(e) {
//             db = request.result;
//             tx = db.transaction(storeName, "readwrite");
//             store = tx.objectStore(storeName);

//             db.onerror = function(e) {
//                 console.log("error");
//             };
//             if (method === "put") {
//                 store.put(object);
//             } else if (method === "get") {
//                 const all = store.getAll();
//                 all.onsuccess = function() {
//                     resolve(all.result);
//                 };
//             } else if (method === "delete") {
//                 store.delete(object._id);
//             }
//             tx.oncomplete = function() {
//                 db.close();
//             };
//         };
//     });
// }