window.addEventListener('load', function(){
    console.log("Loaded.");

    // Service worker registeren.
    // if ('serviceWorker' in navigator) 
    // {
    //     navigator.serviceWorker.register('./service-worker.js')
    //     .then((registration) => {
    //         console.log('Registered: ');
    //         console.log(registration);
    //     })
    //     .catch((err) => console.log(err));
    // } 
    // else
    // {
    //     alert('No service worker support in this browser.');
    // }

    this.document.querySelector("#btnGrantPermission").addEventListener("click", 
    function(){
        console.log("Button clicked...");

        if(!("Notification" in window))
            console.log("Notifications not supported in this browser.");
        else
        {
            if(Notification.permission == "granted")
            {
                new Notification("Succesvol geschreven!");
                console.log("Permission granted before. Notification send.");
            }
            else
            {
                if(Notification.permission != "denied")
                {
                    Notification.requestPermission().then(permission => {
                        if(permission == "granted")
                        {
                            new Notification("Succesvol geschreven!");
                            console.log("Permission granted. Notification send.");
                        }
                    });
                }
                else
                    console.log("Permission denied before...");
            }
        }
    });
});

async function readNFC() {
    if (!("NDEFReader" in window)) {
        alert("Web NFC API is not supported in this browser.");
        return;
    }

    const reader = new NDEFReader();

    try {
        await reader.scan();
        reader.onreading = event => {
            const records = event.message.records;
            records.forEach(record => {
                if (record.recordType === "text") {
                    readTextRecord(record);
                }
            });
        };
    } catch (error) {
        console.error("Error reading NFC:", error);
        document.getElementById('nfc-data').innerText = "Error! Cannot read data from the NFC tag. Try a different one?";
    }
}

function readTextRecord(record) {
    console.assert(record.recordType === "text");
    const textDecoder = new TextDecoder(record.encoding);
    const text = textDecoder.decode(record.data);
    
    const parts = text.split(';').map(part => part.trim());
    
    const info = {
        VoorNaam: parts[0],
        AchterNaam: parts[1],
        TelefoonNummer: parts[2]
    };

    console.log("First Name:", info.VoorNaam);
    console.log("Last Name:", info.AchterNaam);
    console.log("Phone Number:", info.TelefoonNummer);

    document.getElementById('nfc-data').innerHTML = `
        <p>Voornaam: ${info.VoorNaam}</p>
        <p>Naam: ${info.AchterNaam}</p>
        <p>Telefoonnummer: ${info.TelefoonNummer}</p>
    `;
}

async function combineData() {
    const form = document.getElementById('nfc-form');
    const formData = new FormData(form);
    
    const firstName = formData.get('firstname');
    const lastName = formData.get('lastname');
    const phoneNumber = formData.get('phonenumber');

    if (!firstName || !lastName) {
        alert("Geef je voornaam en achternaam op!");
        return;
    }

    const combinedData = `${firstName};${lastName};${phoneNumber}`.trim();
    console.log("Gecombineerde data:", combinedData);
    return combinedData;
}

async function writeNFC() {
    const combinedData = await combineData();
    
    if (!combinedData) return;

    if ("NDEFReader" in window) {
        const ndef = new NDEFReader();
        try {
            await ndef.write(combinedData);
            console.log("Succesvol geschreven!");
            showNotification("Succesvol geschreven!");
        } catch(error) {
            console.log(error);
        }
    } else {
        console.log("Web NFC is not supported.");
    }
}

function showNotification(message) {
    if (!("Notification" in window)) {
        console.log("Notifications not supported in this browser.");
        return;
    }

    if (Notification.permission === "granted") {
        new Notification(message);
    } else if (Notification.permission !== "denied") {
        Notification.requestPermission().then(permission => {
            if (permission === "granted") {
                new Notification(message);
            }
        });
    }
}