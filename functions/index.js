const functions = require("firebase-functions");

// The Firebase Admin SDK to access Firestore.
const admin = require('firebase-admin');
admin.initializeApp();

// Create and Deploy Your First Cloud Functions
// https://firebase.google.com/docs/functions/write-firebase-functions

exports.lookupRsvp = functions.https.onRequest(async (request, response) => {
    functions.logger.info("LookupRSVP logs!", {query: request.query});
    const name = request.query.name;
    const splits = name.split(" ");
    if (splits.length !== 2) {
        response.json({success: false, message: "We were not able to find an invite under that name. If that seems wrong, please contact Heather and Nick to make sure they know how to spell your name."})
    } else {
        const names = [];
        const firestore = admin.firestore();
        await firestore.collection('rsvp3').listDocuments().then(documentRefs => {
            return firestore.getAll(...documentRefs); 
         }).then(documentSnapshots => {
            for (let documentSnapshot of documentSnapshots) {
               if (documentSnapshot.exists) {
                   const d = documentSnapshot._fieldsProto;
                   if ((d.guest1First && d.guest1First.stringValue === splits[0] && d.guest1Last && d.guest1Last.stringValue === splits[1]) || 
                        (d.guest2First && d.guest2First.stringValue === splits[0] && d.guest2Last && d.guest2Last.stringValue === splits[1])) {
                            if (d.guest1First && d.guest1Last) {
                                names.push(`${d.guest1First.stringValue} ${d.guest1Last.stringValue}`);
                            }
                            if (d.guest2First && d.guest2Last) {
                                names.push(`${d.guest2First.stringValue} ${d.guest2Last.stringValue}`);
                            }
                   }
               } else {
                    functions.logger.info(`Found missing document: ${documentSnapshot.id}`);
               }
            }
         });
         if (names.length) {
            response.json({success: true, names: names});
         } else {
            response.json({success: false, message: "We were not able to find an invite under that name. If that seems wrong, please contact Heather and Nick to make sure they know how to spell your name."})
         }
    }
});
