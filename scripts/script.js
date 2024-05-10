window.addEventListener('load', function(){
    console.log("Loaded.");

    //Service worker registeren.
    if ('serviceWorker' in navigator) 
        {
             navigator.serviceWorker.register('./service-worker.js')
             .then((registration) => {
                 console.log('Registered: ');
                 console.log(registration);
             })
             .catch((err) => console.log(err));
        } 
        else
        {
             alert('No service worker support in this browser.');
        }

    var today = new Date().toISOString().split('T')[0];
    var geboortedatumInput = document.getElementById('geboortedatum');
    geboortedatumInput.setAttribute('max', today);


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
    

    // Wanneer op de knop geklikt wordt, probeer notificaties te verwerken.
    document.querySelector('#btnGrantPermission')        
    .addEventListener('click', function() {

        // Controleren of notifications mogelijk zijn in de huidige browser.
        if (!("Notification" in window))
            console.log("Notifications are not supported in this browser.");
        else
        {
            // Bekijken of er reeds toestemming gegeven werd.
            if(Notification.permission == "granted")
            {
                console.log("Permission granted before.");
            }
            else
                if(Notification.permission !== "denied")
                {
                    // Als niet eerder geweigerd werd, vraag het aan...
                    Notification.requestPermission()
                    .then(permission => {
                        if(permission === "granted")
                        {
                            console.log("Permission granted.");
                        }
                    });
                }    
                else
                {
                    console.log("Permission denied befor. No notifications will be send.");
                }
        }
    });

    document.querySelector("#btnSubscribeToPushNotification")
    .addEventListener('click', function(){
        console.log("Clicked to subscribe.");

        // Registratieobject van de service worker ophalen. Daarop via de
        // push manager subscriben.
        navigator.serviceWorker.getRegistration()
        .then(registration => {
            // Zie: https://developer.mozilla.org/en-US/docs/Web/API/ServiceWorkerRegistration/pushManager
            // en https://developer.mozilla.org/en-US/docs/Web/API/PushManager/subscribe.
            registration.pushManager.subscribe(
                {
                    // userVisibleOnly moet op true staan. De false optie is (nog) niet geïmplementeerd.
                    userVisibleOnly: true,
                    applicationServerKey: "BOlSKki71ihxD2V0ve2dfIu2CKwsOLhH-H3obGOOXgeBDaLFzktArO2YPHYwkWPp6vupHKHv76mtAuqbBZxsytg"
                }
            )
            .then(subscription => {
                // In het subscription object zit het endpoint waarnaar je een bericht kan sturen.
                // Dat bericht wordt dat gepushed naar hier...
                // OPM: de browser kiest zelf de 'push service'... Daarom moet alle inhoud versleuteld zijn.

                console.log("Subscription: ");
                console.log(JSON.stringify(subscription));      // OPM: I.p.v. stringify, kan je ook zelf de data ophalen uit het subscription object.
                    
                    
                // Dit moet naar de server verzonden worden....(via fetch request).
                // Bekijk van bovenstaande object de property 'endpoint', 'keys', ...
                // Ga naar het eigen back-end end point waar de Express server luistert naar
                // POST info (api/save-subscription) en geef info mee.
                var options =   {
                                    method: "POST",
                                    headers: { "Content-type": "application/json"},
                                    body: JSON.stringify(subscription)
                                };
                fetch("api/save-subscription", options)
                .then(response => {
                    console.log("Response: ", response)
                    return response.json();
                })
                .then(response => {
                    console.log(response)
                })
                .catch(error => console.log("Error: ", error));                    
            })
            .catch(error => console.log(error));
        });
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