//　FooFoo module
function FooFooClass() {}

FooFooClass.prototype = (function() {

  // milkcocoa instance
  var milkcocoa = new MilkCocoa("maxiac8gg9b.mlkcca.com"),
             ds = milkcocoa.dataStore("windData");
  var dataArray = [],
      windPowerArray = [],
      //idナンバー
      primaryId = 0,
      //入力の風のカウンター
      max = 10,
      //デモ用のタイマー
      windInterval,
      // title入力用の変数
      setTitleStr = '',
      // 検用の配列
      sortDataArr = [],
      last_message = "dummy";

  // "message"データストアにメッセージをプッシュする
  function _post(titleStr, wind) {
    var titleStr = titleStr || 'androidTest';
    var name = '名無しさん';
    console.log('milkcocoa push')
    var wind = wind;
    if (wind && wind !== "") {
      primaryId++;
      console.log("primaryId", primaryId);
      ds.push({
        id: primaryId,
        title: titleStr,
        name: name,
        wind: wind,
        date: new Date().getTime()
      }, function (e) {});
    }
  }

  // HTMLにデータを表示
  function _renderMessage(message) {
    var message_html = '<p class="post-text">' + _escapeHTML(message.wind) + '</p>';
    var date_html = '';
    var button_html = '<button class="windOutPutBtn" id = "windId' + message.id +'">OutPut</button>';
    if(message.date) {
      date_html = '<p class="post-date">'+'id: ' + _escapeHTML(message.id) + ' ' + _escapeHTML(message.title)+' : '+ _escapeHTML( new Date(message.date).toLocaleString())+'</p>';
    }
    $("#"+last_message).before('<div id="'+message.id+'" class="post">'+ button_html + message_html + date_html +'</div>');
    //$("#"+last_message).before('<div id="'+message.id+'" class="post">'+ _escapeHTML(message.name) +'</div>');
    last_message = message.id;

    /////出力
    $('#windId' + message.id).click(function () {
      var power = message;
      // console.log('click', message.content, typeof windPower);
      // もしpowerの中身が配列じゃなかったらエラー処理（空だったら
      if(typeof power === 'object'){
        console.log(power.wind);
        _outNative(power.wind);
      }else{
        console.log('値がありまへん');
        return;
      }
    });
  }

  // .content内のhtmlを消去
  function _resetHTML() {
    $(".post").remove();
    //html表示メッセージの最後の行を初期化
    last_message = "dummy";
    console.log('reset');
  }

  // すべてのデータ取得
  function _getAllDate() {
    _resetHTML();
    //3.データストアからメッセージを取ってくる
    _dsStream(_renderMessage);
  }

  // データストアからメッセージを取ってくる
  function _dsStream(callback) {
    ds.stream().sort("desc").size(999).next(function(err, datas) {
      // console.log('data.lengths'+ datas.length);
      primaryId = datas.length
      datas.forEach(function(data) {
        callback(data.value);
        // console.log(data.value.title);
        // console.log(data);
        // console.log(data.value);
        // console.log(data.value.content);
      });
    });
  }

  // 検索機能
  function _getSortData(sortStr) {
    //HTMLをリセット
    _resetHTML();
    sortDataArr = [];
    var sortArrNum = 0;
    //"message"データストアからtitleを検索した文字でメッセージを取ってくる
    ds.stream().sort("desc").size(999).next(function(err, datas) {
      datas.forEach(function(data) {
        ////////////////
        // 正規表現によりsortStrが含まれているかを判定
        var re = new RegExp(sortStr, "i");
        if(data.value.title.match(re)){
          sortDataArr.push(data);
          _renderMessage(sortDataArr[sortArrNum].value);
          sortArrNum++ ;
        }
        console.log(data.value.title);
        // sortStrの文字とdata.value.titleを比較し，もしマッチしたらsortDataArrに格納
      });
      if(sortDataArr.length == 0){
        console.log('そんなのないみたい。');
        alert('そんなのないみたい。');
      }
    });
  }

  //センサー値の入力
  function _getCensorVal() {
    var windPower = Math.floor( Math.random() * 100 );
    console.log(windPower);
    // windPower.innerHTML = randNum;
    $("#windPower").text(windPower);
    $(".nTOw").text(windPower);
      //windPowerを配列に
      //配列が50個になったら，milkcocoaに送信
      windPowerArray.push(windPower);
      if(windPowerArray.length == max){
        _stopWind();
      }
  }

  ///title set
  function _setTitle() {
      setTitleStr = '';
      setTitleStr = $('#titleVal').val();
      $("#titleName").text(setTitleStr);
      $('#titleVal').val("");
  }

  //デモ用
  function _startWind() {
    windInterval = setInterval(_getCensorVal,100);
  }

  function _stopWind() {
    // milkcocoaに送信
    _post(setTitleStr, windPowerArray);
    clearInterval(windInterval);
    // 送信用のwind配列を初期化
    windPowerArray = [];
    console.log('stop');
  }

  //インジェクション対策
  function _escapeHTML(val) {
    return $('<div>').text(val).html();
  }

  //配列を一つづつ取り出しネイティブに出力
  function _outNative(array) {
    var str = String(array);
    var resArray = str.split(",");
    // console.log(resArray);
    //配列を一つづつ出力
    for(var i = 0; i < resArray.length; i++){
      // console.log("resArray"+ resArray[i]);
      Native.showToast(resArray[i]);
    }
  }

  // 配列かどうか判定
  function _isArray(obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
  }

  //return API
  return {
    post:  _post,
    renderMessage: _renderMessage,
    resetHTML: _resetHTML,
    getAllDate: _getAllDate,
    dsStream: _dsStream,
    getSortData: _getSortData,
    setTitle: _setTitle,
    startWind: _startWind,
    stopWind: _stopWind,
    escapeHTML: _escapeHTML,
    outNative: _outNative,
    isArray: _isArray
  }

}());


$(function() {

  var f = new FooFooClass();

  //入力ボタンのクリック
  $("#inPutBtn").click(function() {
        f.startWind();
  });
  //入力　停止ボタンのクリック
  $("#stopBtn").click(function() {
        f.stopWind();
        f.getAllDate();
  });

  //titleを決定ボタンのクリック
  $("#titlePostBtn").click(function() {
        f.setTitle();
  });

  //検索ボタンのクリック
  $("#searchPutBtn").click(function() {
        var searchStr = $('#searchText').val();
        f.getSortData(searchStr);
  });

  //すべてを表示ボタンのクリック
  $("#showAllPutBtn").click(function() {
        f.getAllDate();
  });

  //非表示ボタンのクリック
  $("#hidePutBtn").click(function() {
        f.resetHTML();
  });


  //////////今西さんのデータ
  ///
  ///
  // addTextNode('CLOSE');
});

function addTextNode() {
    alert();
    $("h1").append("test");
    //windPowerを配列に
    //配列が50個になったら，milkcocoaに送信
    // windPowerArray.push(windPower);
    // if(windPowerArray.length == max){
    //   _stopWind();
    // }
}
