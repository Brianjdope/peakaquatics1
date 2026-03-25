/**
 * One-time Google OAuth setup. Run: node setup-google-auth.js
 * This saves a token.json file used by compile-calendar.js.
 */
require('dotenv').config();
const { google } = require('googleapis');
const fs = require('fs');
const readline = require('readline');
const path = require('path');

const TOKEN_PATH = path.join(__dirname, 'token.json');
const SCOPES = ['https://www.googleapis.com/auth/calendar.readonly'];

async function main() {
  const { GOOGLE_CLIENT_ID, GOOGLE_CLIENT_SECRET } = process.env;

  if (!GOOGLE_CLIENT_ID || !GOOGLE_CLIENT_SECRET) {
    console.error('ERROR: Set GOOGLE_CLIENT_ID and GOOGLE_CLIENT_SECRET in scripts/.env');
    process.exit(1);
  }

  const oAuth2Client = new google.auth.OAuth2(
    GOOGLE_CLIENT_ID,
    GOOGLE_CLIENT_SECRET,
    'urn:ietf:wg:oauth:2.0:oob'
  );

  const authUrl = oAuth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: SCOPES,
  });

  console.log('\nOpen this URL in your browser and authorize access:\n');
  console.log(authUrl);
  console.log();

  const rl = readline.createInterface({ input: process.stdin, output: process.stdout });
  rl.question('Paste the authorization code here: ', async (code) => {
    rl.close();
    try {
      const { tokens } = await oAuth2Client.getToken(code.trim());
      fs.writeFileSync(TOKEN_PATH, JSON.stringify(tokens, null, 2));
      console.log(`\nToken saved to ${TOKEN_PATH}`);
      console.log('You can now run: npm run compile');
    } catch (err) {
      console.error('Error retrieving token:', err.message);
      process.exit(1);
    }
  });
}

main();
