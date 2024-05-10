var express = require('express');
var app = express();
var Datastore = require('nedb');
var db = new Datastore();
var webpush = require('web-push');

// https://web-push-codelab.glitch.me
const vapidKeys = {
    publicKey: "BOlSKki71ihxD2V0ve2dfIu2CKwsOLhH-H3obGOOXgeBDaLFzktArO2YPHYwkWPp6vupHKHv76mtAuqbBZxsytg",
    privateKey: "ViHz-TvTZwFuiKo6zxXoUpR_fuQIK2Sz9q_LL0hqXC8"
};

webpush.setVapidDetails(
    'mailto:robin.dujardyn@student.vives.be',
    vapidKeys.publicKey,
    vapidKeys.privateKey
);

// De bestanden uit de 'public' map beschikbaar stellen.
app.use(express.static('public'));

app.use(express.json());

// Maak een 'route' aan om nieuwe gebruikersgegevens in op te slaan.
app.post("/api/save-subscription/", function(request, response){
    console.log("POST info arrived...");
    console.log(request.body);

    // Als de data niet ok is, keer terug met foutmelding.
    if(!request.body || !request.body.endpoint){
        // Info HTPP response status codes: https://developer.mozilla.org/en-US/docs/Web/HTTP/Status.
        response.status(400);
        response.setHeader('Content-type','application/json');
        response.send(JSON.stringify({
            error: {
                id: 'no endpoint',
                message: 'Subscription must have an endpoint.'
            }
        }));
    }
    else
    {
        // Als data wel ok is, sla op in lokale database (in memory)...
        saveSubscriptionToDatabase(request.body)
        .then(function(subscriptionId) {
            console.log("Saved _id: ", subscriptionId);
            response.setHeader('Content-Type', 'application/json');
            response.send(JSON.stringify({ data: { success: true } }));
        })
        .catch(function(err) {
            console.log(err);
            response.status(500);
            response.setHeader('Content-Type', 'application/json');
            response.send(JSON.stringify({
                error: {
                            id: 'unable-to-save-subscription',
                            message: 'The subscription was received but we were unable to save it to our database.'
                        }
            }));
        });
    }
});

app.post("/api/trigger-push-message/", function(request, response){
    console.log("Trigger push at backend received...");
    console.log(request.body);    

    // Antwoorden aan aanvrager.
    response.setHeader('Content-Type', 'application/json');
    response.send(JSON.stringify({ data: { success: true } }));

    // Alle abonnementen opvragen in de database en daarnaar een berichtje pushen.
    // Info over opvragen gegevens in een NeDB, zie: https://github.com/louischatriot/nedb/wiki/Finding-documents.
    db.find({}, function (err, subscriptions) {
        console.log(subscriptions);

        if(err)
            console.log("Error during searching in NeDB: ", err);
        else
        {            
            // Er is reeds een pagina die push berichtjes kan aanvragen/versturen... Maar het kan ook via Postman.
            // Moet onderstaande meer asynchroon? Met Promises?
            for (let i = 0; i < subscriptions.length; i++) 
                triggerPushMessage(subscriptions[i], request.body.message);
        }
    });
});

function saveSubscriptionToDatabase(subscription)
{
    return new Promise(function(resolve, reject) {
        // Item toevoegen aan de NeDB, zie: https://github.com/louischatriot/nedb/wiki/Inserting-documents
        db.insert(subscription, function(err, newDoc) {
            if (err)
                reject(err);
            else
                // Ter info het automatisch aangemaakte _id terug meegeven.
                resolve(newDoc._id);
        });
    });
}

function triggerPushMessage(subscription, dataToSend)
{
    // Zie: https://www.npmjs.com/package/web-push#sendnotificationpushsubscription-payload-options.
    // Deze functie return't een Promise die resulteert in een object of error.
    return webpush.sendNotification(subscription, dataToSend)
        .catch((err) => {
            if (err.statusCode === 404 || err.statusCode === 410) 
            {
                console.log('Subscription has expired or is no longer valid: ', err);

                // Het bewuste abonnement verwijderen. Nog verder testen.
                db.remove({_id: subscription._id},{}, function(){
                    console.log("Subscription removed with _id: ", subscription._id);
                });
            }
            else
            {
                throw err;
            }
        });
}

// Start de webserver en 'luister' op poort 3000.
app.listen(3000);

console.log("Express-server gestart op http://localhost:3000");