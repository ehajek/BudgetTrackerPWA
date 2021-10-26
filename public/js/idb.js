let db;

const request = indexedDB.open('budget', 1,);

request.onupgradeneeded = function (event) {
    const db = event.target.result;
    db.createObjectStore('budget_track', { autoIncrement: true });
};

request.onsuccess = function (event) {
    db = event.target.result;
    if (navigator.onLine) {
        uploadTransaction();
    }
};

request.onerror = function (event) {
    console.log(event.target.errorCode);
};

function saveRecord(record) {
    const transaction = db.transaction(["budget_track"], "readwrite");
    const transactionObjectStore = transaction.objectStore('budget_track');
    transactionObjectStore.add(record);
}

async function uploadTransaction() {
    console.log("upload Trans Working");
    const transaction = db.transaction(["budget_track"], "readwrite");
    const transactionObjectStore = transaction.objectStore('budget_track');

    const getAll = transactionObjectStore.getAll();

    getAll.onsuccess = function () {
        if (getAll.result.length > 0) {
            fetch('/api/transaction/bulk', {
                method: 'POST',
                body: JSON.stringify(getAll.result),
                headers: {
                    Accept: 'application/json, text/plain, */*',
                    'Content-Type': 'application/json'
                }
            })
            .then(response => response.json())
            .then(serverResponse => {
              if (serverResponse.message) {
                throw new Error(serverResponse);
              }
    
              const transaction = db.transaction(['budget_track'], 'readwrite');
              const budgetObjectStore = transaction.objectStore('budget_track');
              // clear all items in your store
              budgetObjectStore.clear();
              let errorEl = document.querySelector(".form .error");
              alert("Back Online, Uploading Transactions");
              document.location.replace('/');
            })
            .catch(err => {
              // set reference to redirect back here
              console.log(err);
            });
        }
      };
    }
// listen for app coming back online
window.addEventListener('online', uploadTransaction);
