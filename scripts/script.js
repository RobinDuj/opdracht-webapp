window.addEventListener('load', function(){
    console.log("Loaded.");
    
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
    console.log(`Text: ${text} (${record.lang})`);
    document.getElementById('nfc-data').innerText = `Text: ${text} (${record.lang})`;
}

async function writeNFC() {
    const textToWrite = document.getElementById('nfc-input').value;
    
    if ("NDEFReader" in window) {
        const ndef = new NDEFReader();
        try {
          await ndef.write(textToWrite);
          consoleLog("NDEF message written!");
        } catch(error) {
          consoleLog(error);
        }
      } else {
        consoleLog("Web NFC is not supported.");
      }
}