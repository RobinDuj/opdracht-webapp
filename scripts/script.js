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
        TelefoonNummer: parts[2],
        GeboorteDatum: parts[3],
        MoederTaal: parts[4],
        Nationaliteit: parts[5],
        Hoogte: parts[6],
        Gewicht: parts[7],
        Bloedgroep: parts[8],
        Allergieen: parts[9],
        AndereInfo: parts[10]
    };

    console.log("Voornaam:", info.VoorNaam);
    console.log("Achternaam:", info.AchterNaam);
    console.log("Telefoonnummer:", info.TelefoonNummer);
    console.log("Geboortedatum:", info.GeboorteDatum);
    console.log("Moedertaal:", info.MoederTaal);
    console.log("Nationaliteit:", info.Nationaliteit);
    console.log("Hoogte:", info.Hoogte, "CM");
    console.log("Gewicht:", info.Gewicht, "KG");
    console.log("Bloedgroep:", info.Bloedgroep);
    console.log("Allergieen:", info.Allergieen);
    console.log("Andereinfo:", info.AndereInfo);

    document.getElementById('nfc-data').innerHTML = `
        <p>Voornaam: ${info.VoorNaam}</p>
        <p>Naam: ${info.AchterNaam}</p>
        <p>Telefoonnummer: ${info.TelefoonNummer}</p>
        <p>Geboortedatum: ${info.GeboorteDatum}</p>
        <p>Moedertaal: ${info.MoederTaal}</p>
        <p>Nationaliteit: ${info.Nationaliteit}</p>
        <p>Hoogte: ${info.Hoogte}CM</p>
        <p>Gewicht: ${info.Gewicht}KG</p>
        <p>Bloedgroep: ${info.Bloedgroep}</p>
        <p>Allergieen: ${info.Allergieen}</p>
        <p>Andere info: ${info.AndereInfo}</p>
    `;
}

async function combineData() {
    const form = document.getElementById('nfc-form');
    const formData = new FormData(form);
    
    const firstName = formData.get('firstname');
    const lastName = formData.get('lastname');
    const phoneNumber = formData.get('phonenumber');
    const dateOfBirth = formData.get('geboortedatum');
    const motherTongue = formData.get('moedertaal');
    const nationality = formData.get('nationaliteit');
    const height = formData.get('hoogte');
    const weight = formData.get('gewicht');
    const bloodGroup = formData.get('bloedgroep');
    const allergies = formData.get('allergieen');
    const otherInfo = formData.get('andereinfo');


    if (!firstName || !lastName) {
        alert("Geef je voornaam en achternaam op!");
        return;
    }

    const combinedData = `${firstName};${lastName};${phoneNumber};${dateOfBirth};${motherTongue};${nationality};${height};${weight};${bloodGroup};${allergies};${otherInfo}`.trim();
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