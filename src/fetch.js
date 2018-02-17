function getTx() {

  var sheet = SpreadsheetApp.getActiveSpreadsheet().getSheetByName("Data");
  var url = 'http://api.etherscan.io/api?module=account&action=txlist&address=0x49E81AA0cFE7eeA9738430212DC6677acF2f01a1&sort=asc';
  var json = UrlFetchApp.fetch(url).getContentText();
  var data = JSON.parse(json);

  var rows = [],
      array;

  for (i = 0; i < data.length; i++) {
    array = data[i];
    rows.push([array.timeStamp, array.from, array.to, array.value]);
  }
  Logger.log(rows)

  askRange = sheet.getRange(3, 1, rows.length, 3);
  askRange.setValues(rows);

}
