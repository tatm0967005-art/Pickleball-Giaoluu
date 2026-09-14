/**
 * BACKEND CHO TRANG ĐĂNG KÝ PICKLEBALL — SABECO VÀ NHỮNG NGƯỜI BẠN
 *
 * CÁCH DÙNG (xem chi tiết trong README.md):
 * 1. Tạo 1 Google Sheet mới (trống).
 * 2. Menu Tiện ích mở rộng (Extensions) → Apps Script.
 * 3. Xóa hết code mẫu, dán toàn bộ nội dung file này vào.
 * 4. Bấm Deploy → New deployment → chọn loại "Web app".
 *      - Execute as: Me
 *      - Who has access: Anyone
 * 5. Copy URL Web App được cấp, dán vào biến API_URL trong index.html.
 */

function defaultConfig_() {
  return {
    eventTitle: "SABECO và những người bạn",
    eventEdition: "Lần 3",
    eventSubtitle: "Giải giao lưu Pickleball nội bộ",
    sessions: [
      { id: "s1", label: "Ngày 04/10/2026" },
      { id: "s2", label: "Ngày 18/10/2026" }
    ],
    eventPurpose: "Sẽ xác nhận sau",
    eventFormat: "Sẽ xác nhận sau",
    eventAudience: "Sẽ xác nhận sau",
    registrationOpen: true,
    adminPassword: "sabeco2026"
  };
}

function getSS_() {
  return SpreadsheetApp.getActiveSpreadsheet();
}

function getConfigSheet_() {
  var ss = getSS_();
  var sh = ss.getSheetByName('Config');
  if (!sh) {
    sh = ss.insertSheet('Config');
    sh.getRange(1, 1).setValue(JSON.stringify(defaultConfig_()));
  }
  return sh;
}

function getRegSheet_() {
  var ss = getSS_();
  var sh = ss.getSheetByName('Registrations');
  if (!sh) {
    sh = ss.insertSheet('Registrations');
    sh.appendRow(['id', 'hoTen', 'donVi', 'gioiTinh', 'namSinh', 'sessions', 'status', 'createdAt']);
  }
  return sh;
}

function readConfig_() {
  var sh = getConfigSheet_();
  var raw = sh.getRange(1, 1).getValue();
  try {
    var cfg = JSON.parse(raw);
    if (!cfg || !cfg.sessions) return defaultConfig_();
    return cfg;
  } catch (e) {
    return defaultConfig_();
  }
}

function writeConfig_(cfg) {
  getConfigSheet_().getRange(1, 1).setValue(JSON.stringify(cfg));
}

function readRegistrations_() {
  var sh = getRegSheet_();
  var lastRow = sh.getLastRow();
  if (lastRow < 2) return [];
  var values = sh.getRange(2, 1, lastRow - 1, 8).getValues();
  var out = [];
  for (var i = 0; i < values.length; i++) {
    var r = values[i];
    if (!r[0]) continue;
    out.push({
      id: r[0],
      hoTen: r[1],
      donVi: r[2],
      gioiTinh: r[3],
      namSinh: r[4],
      sessions: r[5] ? String(r[5]).split(',').filter(function (x) { return x; }) : [],
      status: r[6] || 'pending',
      createdAt: r[7] instanceof Date ? r[7].toISOString() : String(r[7])
    });
  }
  return out;
}

function appendRegistration_(rec) {
  getRegSheet_().appendRow([
    rec.id, rec.hoTen, rec.donVi, rec.gioiTinh, rec.namSinh,
    rec.sessions.join(','), rec.status, rec.createdAt
  ]);
}

function findRowById_(sh, id) {
  var lastRow = sh.getLastRow();
  if (lastRow < 2) return -1;
  var ids = sh.getRange(2, 1, lastRow - 1, 1).getValues();
  for (var i = 0; i < ids.length; i++) {
    if (String(ids[i][0]) === String(id)) return i + 2;
  }
  return -1;
}

function updateStatus_(id, status) {
  var sh = getRegSheet_();
  var row = findRowById_(sh, id);
  if (row > 0) sh.getRange(row, 7).setValue(status);
  return row > 0;
}

function deleteRegistration_(id) {
  var sh = getRegSheet_();
  var row = findRowById_(sh, id);
  if (row > 0) sh.deleteRow(row);
  return row > 0;
}

function jsonOut_(obj) {
  return ContentService.createTextOutput(JSON.stringify(obj))
    .setMimeType(ContentService.MimeType.JSON);
}

function doGet(e) {
  var cfg = readConfig_();
  var action = (e && e.parameter && e.parameter.action) || 'list';
  if (action === 'config') {
    return jsonOut_({ config: cfg });
  }
  return jsonOut_({ config: cfg, registrations: readRegistrations_() });
}

function doPost(e) {
  var body = {};
  try {
    body = JSON.parse(e.postData.contents);
  } catch (err) {
    return jsonOut_({ ok: false, error: 'bad_request' });
  }

  var action = body.action;
  var cfg = readConfig_();

  function isAuthed() {
    return body.password && body.password === cfg.adminPassword;
  }

  if (action === 'register') {
    if (!cfg.registrationOpen) {
      return jsonOut_({ ok: false, error: 'registration_closed' });
    }
    var rec = {
      id: 'r' + new Date().getTime() + Math.random().toString(36).slice(2, 8),
      hoTen: body.hoTen, donVi: body.donVi, gioiTinh: body.gioiTinh,
      namSinh: body.namSinh, sessions: body.sessions || [],
      status: 'pending', createdAt: new Date().toISOString()
    };
    appendRegistration_(rec);
    return jsonOut_({ ok: true, id: rec.id });
  }

  if (action === 'login') {
    return jsonOut_({ ok: body.password === cfg.adminPassword });
  }

  if (action === 'approve' || action === 'reject' || action === 'pending') {
    if (!isAuthed()) return jsonOut_({ ok: false, error: 'unauthorized' });
    var status = action === 'approve' ? 'approved' : (action === 'reject' ? 'rejected' : 'pending');
    var done = updateStatus_(body.id, status);
    return jsonOut_({ ok: done });
  }

  if (action === 'delete') {
    if (!isAuthed()) return jsonOut_({ ok: false, error: 'unauthorized' });
    var deleted = deleteRegistration_(body.id);
    return jsonOut_({ ok: deleted });
  }

  if (action === 'saveConfig') {
    if (!isAuthed()) return jsonOut_({ ok: false, error: 'unauthorized' });
    writeConfig_(body.config);
    return jsonOut_({ ok: true });
  }

  return jsonOut_({ ok: false, error: 'unknown_action' });
}
