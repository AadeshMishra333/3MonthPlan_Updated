/**
 * ================================================
 * DIVYA CHETNA - Google Apps Script Backend
 * ================================================
 * 
 * SETUP INSTRUCTIONS:
 * 1. Google Sheets खोलें → Extensions → Apps Script
 * 2. यह पूरा code paste करें
 * 3. Deploy → New Deployment → Web App
 *    - Execute as: Me
 *    - Who has access: Anyone
 * 4. Deploy करें और URL copy करें
 * 5. js/main.js में SHEET_CONFIG.webAppUrl में paste करें
 * 
 * ================================================
 */

// Sheet names
const SHEETS = {
  REGISTRATIONS: 'Registrations',
  VOLUNTEERS: 'Volunteers',
  CONTACTS: 'ContactMessages'
};

// Registration columns
const REG_HEADERS = [
  'Timestamp', 'UID', 'Name', 'Phone', 'Email', 'Age', 
  'City', 'State', 'Days', 'Seva', 'Message', 'Status'
];

// Volunteer columns
const VOL_HEADERS = [
  'Timestamp', 'Name', 'Phone', 'Email', 'Occupation',
  'SevaType', 'Availability', 'Skills', 'Status'
];

// Contact columns
const CONTACT_HEADERS = [
  'Timestamp', 'Name', 'Phone', 'Email', 'Subject', 'Message', 'Status'
];

function doPost(e) {
  try {
    const data = JSON.parse(e.postData.contents);
    const sheetName = data.sheet;
    
    let result;
    
    switch(sheetName) {
      case SHEETS.REGISTRATIONS:
        result = saveRegistration(data);
        break;
      case SHEETS.VOLUNTEERS:
        result = saveVolunteer(data);
        break;
      case SHEETS.CONTACTS:
        result = saveContact(data);
        break;
      default:
        result = { success: false, error: 'Unknown sheet: ' + sheetName };
    }
    
    return ContentService
      .createTextOutput(JSON.stringify(result))
      .setMimeType(ContentService.MimeType.JSON);
      
  } catch(err) {
    return ContentService
      .createTextOutput(JSON.stringify({ success: false, error: err.toString() }))
      .setMimeType(ContentService.MimeType.JSON);
  }
}

function doGet(e) {
  // For testing — returns sheet summary
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const summary = {
    registrations: getSheetCount(SHEETS.REGISTRATIONS),
    volunteers: getSheetCount(SHEETS.VOLUNTEERS),
    contacts: getSheetCount(SHEETS.CONTACTS),
    status: 'active'
  };
  return ContentService
    .createTextOutput(JSON.stringify(summary))
    .setMimeType(ContentService.MimeType.JSON);
}

function getOrCreateSheet(name, headers) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  let sheet = ss.getSheetByName(name);
  
  if (!sheet) {
    sheet = ss.insertSheet(name);
    // Add headers
    sheet.getRange(1, 1, 1, headers.length).setValues([headers]);
    // Style headers
    const headerRange = sheet.getRange(1, 1, 1, headers.length);
    headerRange.setBackground('#4A0810');
    headerRange.setFontColor('#D4AF37');
    headerRange.setFontWeight('bold');
    headerRange.setFontSize(11);
    sheet.setFrozenRows(1);
    // Auto-resize
    for (let i = 1; i <= headers.length; i++) {
      sheet.setColumnWidth(i, 150);
    }
  }
  
  return sheet;
}

function getSheetCount(name) {
  const ss = SpreadsheetApp.getActiveSpreadsheet();
  const sheet = ss.getSheetByName(name);
  return sheet ? Math.max(0, sheet.getLastRow() - 1) : 0;
}

function saveRegistration(data) {
  const sheet = getOrCreateSheet(SHEETS.REGISTRATIONS, REG_HEADERS);
  
  // Check for duplicate phone
  if (data.phone) {
    const existing = sheet.getDataRange().getValues();
    for (let i = 1; i < existing.length; i++) {
      if (existing[i][3] === data.phone) {
        return { 
          success: false, 
          duplicate: true,
          existingUID: existing[i][1],
          message: 'इस नंबर से पहले ही पंजीकरण हो चुका है। UID: ' + existing[i][1]
        };
      }
    }
  }
  
  const uid = data.uid || generateUID(data.phone);
  const row = [
    new Date().toLocaleString('en-IN'),
    uid,
    data.name || '',
    data.phone || '',
    data.email || '',
    data.age || '',
    data.city || '',
    data.state || '',
    data.days || '',
    data.seva || '',
    data.message || '',
    'Registered'
  ];
  
  sheet.appendRow(row);
  
  // Send confirmation WhatsApp/email (optional)
  // sendConfirmation(data.phone, data.name, uid);
  
  return { success: true, uid: uid, message: 'पंजीकरण सफल!' };
}

function saveVolunteer(data) {
  const sheet = getOrCreateSheet(SHEETS.VOLUNTEERS, VOL_HEADERS);
  
  const row = [
    new Date().toLocaleString('en-IN'),
    data.name || '',
    data.phone || '',
    data.email || '',
    data.occupation || '',
    data.sevaType || '',
    data.availability || '',
    data.skills || '',
    'Pending'
  ];
  
  sheet.appendRow(row);
  return { success: true, message: 'सेवा पंजीकरण सफल!' };
}

function saveContact(data) {
  const sheet = getOrCreateSheet(SHEETS.CONTACTS, CONTACT_HEADERS);
  
  const row = [
    new Date().toLocaleString('en-IN'),
    data.name || '',
    data.phone || '',
    data.email || '',
    data.subject || '',
    data.message || '',
    'New'
  ];
  
  sheet.appendRow(row);
  return { success: true, message: 'संदेश सफलतापूर्वक भेजा गया!' };
}

function generateUID(phone) {
  const last4 = phone ? phone.slice(-4) : '0000';
  const seq = Math.floor(Math.random() * 9000) + 1000;
  return `DCR-${last4}-${seq}`;
}

// ================================================
// UTILITY: Send WhatsApp via Twilio (optional)
// ================================================
function sendWhatsAppConfirmation(phone, name, uid) {
  // Configure Twilio credentials if needed
  const TWILIO_SID = 'YOUR_TWILIO_SID';
  const TWILIO_TOKEN = 'YOUR_TWILIO_TOKEN';
  const TWILIO_WA = 'whatsapp:+14155238886';
  
  const message = `🙏 जय श्री राम!\n\nनमस्ते ${name} जी,\n\nआपका पंजीकरण सफल हुआ!\n\n🎫 टिकट ID: ${uid}\n📅 दिनांक: 1-7 सितंबर 2025\n📍 पैलेस ग्राउंड, गेट 9, बेंगलुरु\n\nआयोजन स्थल पर यह ID दिखाएं।\n\n॥ जय श्री राम ॥`;
  
  // Uncomment to enable:
  /*
  const url = `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_SID}/Messages.json`;
  const payload = {
    From: TWILIO_WA,
    To: `whatsapp:+91${phone}`,
    Body: message
  };
  const options = {
    method: 'post',
    headers: { Authorization: 'Basic ' + Utilities.base64Encode(`${TWILIO_SID}:${TWILIO_TOKEN}`) },
    payload: payload
  };
  UrlFetchApp.fetch(url, options);
  */
}

// ================================================
// UTILITY: Export registrations to PDF (manual)
// ================================================
function exportRegistrations() {
  const sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName(SHEETS.REGISTRATIONS);
  if (!sheet) { SpreadsheetApp.getUi().alert('No registrations yet!'); return; }
  SpreadsheetApp.getUi().alert(`कुल पंजीकरण: ${sheet.getLastRow() - 1}`);
}
