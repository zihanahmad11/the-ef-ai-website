const SHEET_NAME = 'Leads';

function doPost(e) {
  try {
    const payload = JSON.parse(e.postData.contents || '{}');
    const props = PropertiesService.getScriptProperties();
    if (!payload.sharedSecret || payload.sharedSecret !== props.getProperty('SHARED_SECRET')) {
      return output({ ok: false, message: 'Unauthorized' });
    }
    const spreadsheetId = props.getProperty('SPREADSHEET_ID');
    if (!spreadsheetId) throw new Error('SPREADSHEET_ID is not configured.');
    const lock = LockService.getScriptLock();
    lock.waitLock(10000);
    try {
      const file = SpreadsheetApp.openById(spreadsheetId);
      let sheet = file.getSheetByName(SHEET_NAME);
      if (!sheet) sheet = file.insertSheet(SHEET_NAME);
      if (sheet.getLastRow() === 0) {
        sheet.appendRow(['Reference','Submitted at','Full name','Work email','Phone / WhatsApp','Business name','Primary automation need','Monthly enquiry volume','Project details','Source page','UTM source','UTM medium','UTM campaign','Status']);
        sheet.setFrozenRows(1);
      }
      const reference = safe(payload.reference);
      const existing = sheet.getRange('A:A').createTextFinder(reference).matchEntireCell(true).findNext();
      if (!existing) sheet.appendRow([reference,safe(payload.createdAt),safe(payload.fullName),safe(payload.workEmail),safe(payload.phone),safe(payload.businessName),safe(payload.automationNeed),safe(payload.monthlyVolume),safe(payload.projectDetails),safe(payload.sourcePage),safe(payload.utmSource),safe(payload.utmMedium),safe(payload.utmCampaign),'New']);
    } finally { lock.releaseLock(); }
    sendConfirmation(payload);
    return output({ ok: true });
  } catch (error) {
    console.error(error);
    return output({ ok: false, message: 'Unable to process submission.' });
  }
}

function sendConfirmation(lead) {
  const firstName = safe(lead.fullName).split(/\s+/)[0] || 'there';
  const subject = `We received your AI strategy audit request — ${safe(lead.reference)}`;
  const text = `Hi ${firstName},\n\nThank you for contacting The EF Ai. We’ve received your information and will review where AI automation could create the most value in your customer journey.\n\nOur team will contact you within one business day.\n\nYour reference is: ${safe(lead.reference)}\n\nThe EF Ai\nIntelligent customer conversations, always on.\nhttps://theefai.com`;
  const html = `<div style="font-family:Arial,sans-serif;color:#211b2e;line-height:1.65;max-width:600px"><h2 style="color:#7d2cff">We received your strategy audit request</h2><p>Hi ${htmlEscape(firstName)},</p><p>Thank you for contacting <strong>The EF Ai</strong>. We’ve received your information and will review where AI automation could create the most value in your customer journey.</p><p>Our team will contact you within one business day.</p><p style="padding:12px 14px;background:#f4f1fb;border-radius:8px"><strong>Your reference:</strong> ${htmlEscape(lead.reference)}</p><p>The EF Ai<br><span style="color:#6e687a">Intelligent customer conversations, always on.</span></p><p><a href="https://theefai.com" style="color:#d51b92">theefai.com</a></p></div>`;
  MailApp.sendEmail({to:safe(lead.workEmail),subject,body:text,htmlBody:html,name:'The EF Ai',replyTo:'theefai.agent@gmail.com'});
}

function safe(value) {
  const text = String(value == null ? '' : value).trim();
  return /^[=+\-@]/.test(text) ? `'${text}` : text;
}

function htmlEscape(value) {
  return String(value == null ? '' : value).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
}

function output(data) {
  return ContentService.createTextOutput(JSON.stringify(data)).setMimeType(ContentService.MimeType.JSON);
}
