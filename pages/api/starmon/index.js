// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
// youtube guide https://www.youtube.com/watch?v=PFJNJQCU_lo

const { google } = require('googleapis');

export default async (req, res) => {
  const auth = new google.auth.GoogleAuth({
    keyFile: 'credentials/starmon.json',
    scopes: 'https://www.googleapis.com/auth/spreadsheets',
  });

  
  const client = await auth.getClient(); // Create clien instance for auth
  const googleSheets = google.sheets({ version: 'v4', auth: client }); // Instance of Google Sheets API
  const spreadsheetId = '1ut2I0cZ1cLiI4x3yG0-cEw1CALx0-_Rnm1dHOQeYPwM'; // ID

  // get metadata about spreadsheet
  const metaData = await googleSheets.spreadsheets.get({
    auth,
    spreadsheetId,
  });

  // Read rows from spreadsheet
  const getRows = await googleSheets.spreadsheets.values.get({
    auth,
    spreadsheetId,
    range: 'Starmon $SMON!A:F'
  });

  if (req.body) {
    try {
      // Write row(s) to spreadsheet
      const body = await JSON.parse(req.body);
      const rowEntry = [];
      const d = new Date();
      const dformat = [d.getMonth() + 1,
      d.getDate(),
      d.getFullYear()].join('/') + ' ' +
        [d.getHours(),
        d.getMinutes(),
        d.getSeconds()].join(':');
  
        console.log(dformat);
  
      // create rowEntry
      rowEntry.push(dformat);
      Object.values(body).map((value) => rowEntry.push(value));
  
  
      await googleSheets.spreadsheets.values.append({
        auth,
        spreadsheetId,
        range: 'Starmon $SMON!A:F',
        valueInputOption: 'USER_ENTERED',
        resource: {
          values: [rowEntry]
        }
      });
    } catch (error) {
      return res.status(500).json({ error });
    }
  }
  

  // res.status(200).json({ name: 'John Doe' })
  return res.status(200).json({
    status: 200,
    getRows: getRows.data,
  });
}
