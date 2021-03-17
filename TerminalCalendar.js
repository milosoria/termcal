// Requires
const { google } = require("googleapis");
const credentials = require("./credentials.json");
const token = require("./token.json");
const fs = require("fs");
const readline = require("readline");
// Example command line: $1 'Meeting' $2 19-2-2021 $3 16:40 $4 16:50 $5 2
// We first define our arguments and inputs for the event creation
const [day, month, year] = process.argv[3].split("-"); // DATE
const [shour, sminutes] = process.argv[4].split(":"); // START HOUR
const [ehour, eminutes] = process.argv[5].split(":"); // END HOUR
// Finally, args will contain the name of the event, the date, the start hour and end hour and the number of days for the email reminder
const args = {
	date: [
		new Date(year, parseInt(month) - 1, day, shour, sminutes),
		new Date(year, parseInt(month) - 1, day, ehour, eminutes),
	],
	importance: parseInt(process.argv[6]),
	name: process.argv[2],
};
// With the args we define our event object
const event = {
	calendarId: "primary",
	requestBody: {
		summary: args.name,
		location: "",
		description: "",
		start: {
			dateTime: args.date[0], //"2015-05-28T09:00:00-07:00",
			timeZone: "America/Santiago",
		},
		end: {
			dateTime: args.date[1], //"2015-05-28T17:00:00-07:00",
			timeZone: "America/Santiago",
		},
		recurrence: ["RRULE:FREQ=DAILY;COUNT=1"],
		attendees: [],
		reminders: {
			useDefault: false,
			overrides: [
				{ method: "email", minutes: args.importance * 24 * 60 },
				{ method: "popup", minutes: 60 },
			],
		},
	},
};
//Get access token func, in case the api_key expires or it's not available
function getAccessToken(oAuth2Client, callback) {
	const authUrl = oAuth2Client.generateAuthUrl({
		access_type: "offline",
		scope: ["https://www.googleapis.com/auth/calendar.events"],
	});
	console.log("Authorize this app by visiting this url:", authUrl);
	const rl = readline.createInterface({
		input: process.stdin,
		output: process.stdout,
	});
	rl.question("Enter the code from that page here: ", (code) => {
		rl.close();
		oAuth2Client.getToken(code, (err, token) => {
			if (err) return console.error("Error retrieving access token", err);
			oAuth2Client.setCredentials(token);
			// Store the token to disk for later program executions
			fs.writeFile("token.json", JSON.stringify(token), (err) => {
				if (err) return console.error(err);
				console.log("Token stored to", "token.json");
			});
			callback(oAuth2Client);
		});
	});
}
// Get o2auth func
function auth() {
	const oAuth2Client = new google.auth.OAuth2(
		credentials.client_id,
		credentials.client_secret,
		credentials.redirect_uris[0]
	);
	oAuth2Client.setCredentials(token);
	return oAuth2Client;
}
// Main flow func: calendar event insertion
async function main(auth, event) {
	const calendar = google.calendar({ version: "v3", auth });
	const res = await calendar.events.insert(event);
	console.log(`Response 🧞 ${res.data}`);
}
// Function call
try {
	const Oauth = auth();
	//getAccessToken(Oauth);
	main(Oauth)
} catch (e) {
	console.log(`Error 😡 found: ${e}`);
}