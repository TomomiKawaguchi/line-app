
// GMO APIのエンドポイントとAPIキーを設定
const gmoEndpoint = "https://api.coin.z.com/public";
const gmoApiPath = "/v1/ticker?symbol=BTC"; // 取得銘柄を変更したい場合はsymbolを変える

// LINENotifyのトークンを設定
const lineNotifyToken = "Dzt2AZG6AqlZFvU9jvM4VYd63DpO0MQQ0we3asnforn";

// スプレッドシートのIDとシート名を設定
const spreadsheetId = "1rLPPxJZqUNI1CUKvzpDOxL4tRNd-0O4mqxbogNumUfQ";
const sheetName = "シート1";

// レートを取得してスプレッドシートに書き込む
function fetchRateAndWriteToSheet() {
  // レート取得
  const response = parseJSON(gmoEndpoint + gmoApiPath);
  const rateAsk = response.data[0].ask;
  const rateBid = response.data[0].bid;

  // スプレッドシートのデータを取得
  const spreadsheet = SpreadsheetApp.openById(spreadsheetId);
  const sheet = spreadsheet.getSheetByName(sheetName);
  
  // レートとタイムスタンプをスプレッドシートに書き込む
  const now = new Date();  
  const newRow = [now, rateAsk, rateBid];
  sheet.appendRow(newRow);
  
  // LINE通知
  checkRateThreshold(rateAsk, "ask"); // 売却価格
  checkRateThreshold(rateBid, "bid"); // 購入価格

  // 不要なデータを削除
  const dataRange = sheet.getDataRange();
  const dataValues = dataRange.getValues();
  const oneDayAgo = new Date(now.getTime() - (24 * 60 * 60 * 1000));
  for (let i = dataValues.length - 1; i >= 0; i--) {
    const rowData = dataValues[i];
    const timestamp = rowData[0];

    // タイムスタンプが1日前より前の場合、行を削除
    if (timestamp < oneDayAgo) {
      sheet.deleteRow(i + 1);
    }
  }
}

// レートの変動をチェックして通知する
function checkRateThreshold(currentRate, rateMode) {
  const sheet = SpreadsheetApp.openById(spreadsheetId).getSheetByName(sheetName);
  
  let currentRow = sheet.getLastRow();
  let previousHourRow = currentRow - 6; // 1時間前のレート
  let previousDayRow = currentRow - 144; // 24時間前のレート
  let colNum = 2;
  let rateType = "売却";
  if (rateMode == "bid") {
    colNum = 3;
    rateType = "購入";
  }
  
  // 騰落率の算出
  const previousHourRate = sheet.getRange(previousHourRow, colNum).getValue();
  const previousDayRate = sheet.getRange(previousDayRow, colNum).getValue();
  const hourChangePercentage = ((currentRate - previousHourRate) / previousHourRate) * 100;
  const dayChangePercentage = ((currentRate - previousDayRate) / previousDayRate) * 100;
  
  // ここで一定の数値を超えるかチェックし、通知の条件を設定
  const threshold = 5; // 通知する基準となる騰落率の閾値
  const isHourThresholdExceeded = Math.abs(hourChangePercentage) > threshold;
  const isDayThresholdExceeded = Math.abs(dayChangePercentage) > threshold;
  const isSend = isHourThresholdExceeded || isDayThresholdExceeded
  
  if (isSend) {
  // LINE Notifyで送信するメッセージ作成
    let sendMessage = "\nビットコイン" + rateType + "価格が急変しました\n\n";
    sendMessage += "騰落率（1時間）：" + Math.round(hourChangePercentage*100)/100 + "％\n";
    sendMessage += "騰落率(24時間）：" + Math.round(dayChangePercentage*100)/100 + "％\n";
    sendMessage += "現在の" + rateType + "価格：" + currentRate.toString() + "円\n\n";
    sendMessage += "詳細へ\n";
    sendMessage += "https://coin.z.com/jp/corp/information/btc-market/";

    // LINE通知
    sendLineNotification(sendMessage); 
  }
}

// LINE Notifyで通知を送る
function sendLineNotification(message) {
  const url = "https://notify-api.line.me/api/notify";

  const options = {
    "method"  : "post", 
    "payload" : "message=" + message,
    "headers" : {"Authorization" : "Bearer "+ lineNotifyToken}
  };

  //  FetchメソッドでLINEにメッセージを送信
   UrlFetchApp.fetch(url, options);
}

// JSON解析
function parseJSON(URL){
  // JSONを参照
  const response = UrlFetchApp.fetch(URL).getContentText();
  const jsonStr = JSON.parse(response);
  
  return jsonStr;
}
