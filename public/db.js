let db;

//Creates a new DB request for a "budget" database.
const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function(event) {
    //Creates the "Pending" object store and sets the autoIncrement to "true"
    const db = event.target.result;
    db.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = function(event) {
    db = event.target.result;

    //Checks if the app is online before reading from the DB:
    if (navigator.onLine) {
        checkDatabase();
    }
};

request.onerror = function(event) {
    console.log("Error found: " + event.target.errorCode);
};

//saveRecord needs to be defined, otherwise, error is thrown when trying to run:
function saveRecord(record) {
    //With readwrite access, the transaction is created on the pending DB
    const transaction = db.transaction(["pending"], "readwrite");
    //Pending object store is accessed
    const store = transaction.objectStore("pending");
    //Record is added to store with add method
    store.add(record);
}

function checkDatabase() {
    //Transaction is opened on the pending DB
    const transaction = db.transaction(["pending"], "readwrite");
    //Accesses pending object store
    const store = transaction.objectStore("pending");
    //Obtains all records from store and sets to variables
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
                //Opens transaction on pending DB if successful
                const transaction = db.transaction(["pending"], "readwrite");
                //Accesses pending object store
                const store = transaction.objectStore("pending");
                //Clears all items in store
                store.clear();
            });
        }
    };
}

//Listens for when the app comes back online
window.addEventListener("online", checkDatabase);