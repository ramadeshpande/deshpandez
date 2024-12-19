//index.js code for integrating Google Calendar

const express = require('express');
const { google } = require('googleapis');

const app = express();

const SCOPES = 'https://www.googleapis.com/auth/calendar';
const GOOGLE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\nMIIEvAIBADANBgkqhkiG9w0BAQEFAASCBKYwggSiAgEAAoIBAQCSuzo6noSksls0\niHL/mm4NhsyOW5MPmZJr9gYyQaVIKQEPtha8HtBSKjs1sRtVbDyWZobvLrz72Q5F\nYZvrvfnOnP6MGa69NCe3mdvhoQWQRh56vYufFd/WTQax4XpTunSwVMja3ionYGN6\nrItnPuaMnZKqNmAkyccnnPtx40Qj/SCHZOSTsdSMd7NVKTi+df1oz9Lb1A0i0543\nzqbAQah+bBhDU3zzvbJiccC5OTjRj2UHEV0ZIBdmthqFQEyIMV/43KKIpASuni3g\nTeKspE8+6v2I7MMKnPzZKIcajkPFfZkhBLLhZ2jpnfjO/trlUttJBZvi1L7ZElAo\nmlUhg6NjAgMBAAECggEAN2VtNe1b6awWh+5N8Fc23m96cfJ7woN5xr2zGC01f9lP\nN8XIrow5nROpl/s99RGwjB24KrvsCG8plqMj0Sw/kDQwW+dkU7VJm2UAoR4AMjhu\n0GsYN97zy334HZchblPyMxJHZG5E3unilNForfmO5B6nXRC7Wpg9UqTPP2+MbcNT\n/nkNRFlN/d+gPb6OFcf9Q+E7HbltWzxsA3mEkbSaCmnvED5alEY9B0WqswM1wl7t\nrA2zgfrPbI4D8v92NMqU87y9dYPTJ6dcmU2aYWUqCZf6s/gH/2Nxuv/v+XnTI/9r\nvXfFAH3Y9CQ88d1tNX2vuUEOABDof/O/VWLPwymDmQKBgQDM9Hto5sLvMwn4wFcw\nGOsiMfBJZuv/MDNUf11y4h+vcMbBfK/Ez4n8H2tyhxK0+XyL8XrU8zQWFWO8sOlP\nx/ZMcNJIUNk4jN2s8e3GXmX7NlxDIRgR+8fdC2Z6BIiOXk2fZoNVK2q9mTL6lk2t\ngxCfvmF3CvIPQ+JFQS9X8+C5mwKBgQC3RoXZLF8DUk3FszcxptxfC+i621jvSgfz\n7YO8787ciw09TQQ2lzdjFJj5Ol8qM1Vm37hMFu/QTVwQ/uVqg9mycOnzOb1UXtp8\nhuhbg0o08cor2eDulatr0L3DQkwe+JEAz9mnVZmTU2KrGJaIurfBzfAEkjPJahd2\nG8vCR9td2QKBgGbh6vkzrXLpif3mf13ThGT78ITIN3s4NOwbq0s6G3G0CPGjp5AC\nJl/7XbJ1/3v9KPoO0/wFwYW8Yv6bR+MWm5qvn79RZlkuzTA9mYBUbpj2JsZD3JNa\ncm+Rg3WIxQvCZvC3QwID82cNeju0K3YILtYheUeKpQvopbLiD+P0tkA1AoGAbpAs\nzwbliqtsH4guE9YFu5EDpTYOQMz4Xz856hEBSirYodKEaCpxT2RtpGyCXIL7UkRE\neiKcKZ2BnP8oh0ljWzKi8Ag1H2DZjaYVJp/ddHMo86tM9qFz+GbFE7Y7FbP+Re8d\n7sTFEQuMyoraxUFe+Zuy4A8TDr7hyG6cTWfr/oECgYAvAVUJ6WxIK1roHpua+B4G\nLhBVianguKOuqn7t0l8meDUh+/bAbnOY0J4SukoLUvt6Ewbj0OMUangbLHhcaWBu\nRTHJdLoaPGmRCFV74qnJIIJAWkG/95cKCgtlZcq7RA2ECJNmiO98JUaVY5N8Sqwa\nawnczrmiBtJjnAZ0xPDYLA==\n-----END PRIVATE KEY-----\n"
const GOOGLE_CLIENT_EMAIL = "calendar-key@starry-aegis-445203-n2.iam.gserviceaccount.com"
const GOOGLE_PROJECT_NUMBER = "767376931502"
const GOOGLE_CALENDAR_ID = "c_105be4b52070317582db683fd572112a4ee970ee772dc32acb1ee60b3e84c151@group.calendar.google.com"


const jwtClient = new google.auth.JWT(
  GOOGLE_CLIENT_EMAIL,
  null,
  GOOGLE_PRIVATE_KEY,
  SCOPES
);

const calendar = google.calendar({
  version: 'v3',
  project: GOOGLE_PROJECT_NUMBER,
  auth: jwtClient
});

app.get('/', (req, res) => {
  calendar.events.list({
    calendarId: GOOGLE_CALENDAR_ID,
    timeMin: (new Date()).toISOString(),
    maxResults: 10,
    singleEvents: true,
    orderBy: 'startTime',
  }, (error, result) => {
    if (error) {
      res.send(JSON.stringify({ error: error }));
    } else {
      if (result.data.items.length) {
        res.send(JSON.stringify({ events: result.data.items }));
      } else {
        res.send(JSON.stringify({ message: 'No upcoming events found.' }));
      }
    }
  });
});

app.get("/createEvent",(req,res)=>{
  var event = {
    'summary': 'My first event!',
    'location': 'Hyderabad,India',
    'description': 'First event with nodeJS!',
    'start': {
      'dateTime': '2022-01-12T09:00:00-07:00',
      'timeZone': 'Asia/Dhaka',
    },
    'end': {
      'dateTime': '2022-01-14T17:00:00-07:00',
      'timeZone': 'Asia/Dhaka',
    },
    'attendees': [],
    'reminders': {
      'useDefault': false,
      'overrides': [
        {'method': 'email', 'minutes': 24 * 60},
        {'method': 'popup', 'minutes': 10},
      ],
    },
  };
  
  const auth = new google.auth.GoogleAuth({
    scopes: SCOPES,
    keyFile: './ggl-service-file.json' // Path to your service account key file
  });
  auth.getClient().then(a=>{
    calendar.events.insert({
      auth: jwtClient, // Use the already authenticated jwtClient
      calendarId: GOOGLE_CALENDAR_ID,
      resource: event,
    }, function(err, event) {
      if (err) {
        console.error('There was an error contacting the Calendar service: ', err);
        res.status(500).send('Error creating the event.');
        return;
      }
      console.log('Event created: %s', event.data.htmlLink);
      res.jsonp('Event successfully created!');
    });
  })
})

app.listen(3000, () => console.log(`App listening on port 3000!`));
