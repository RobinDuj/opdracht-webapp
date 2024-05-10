window.addEventListener('load', function(){
    // Functie om een pushmelding te verzenden
    function sendPushNotification() {
        const myHeaders = new Headers();
        myHeaders.append("Content-Type", "application/json");
        const options = {
            method: "POST",
            headers: myHeaders,
            body: JSON.stringify({message: "Vergeet niet om regelmatig je data up te daten!"})
        };

        fetch("/api/trigger-push-message/", options)
            .then(response => {
                console.log("Push notification sent successfully!");
            })
            .catch(error => {
                console.error("Error sending push notification:", error);
            });
    }

    // Verzend een pushmelding om de 5 minuten
    setInterval(sendPushNotification, 1 * 60 * 1000);
});