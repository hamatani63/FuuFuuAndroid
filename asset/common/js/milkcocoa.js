//　FooFoo module
function FooFooClass() {}

FooFooClass.prototype = (function() {

  // milkcocoa instance
  var milkcocoa = new MilkCocoa("maxiac8gg9b.mlkcca.com"),
             ds = milkcocoa.dataStore("windData");
  var dataArray = [],
      windPowerArray = [],
      //idナンバー
      primaryId,
      //入力の風のカウンター
      max = 50,
      //デモ用のタイマー
      windInterval,
      // title入力用の変数
      setTitleStr = '',
      // name入力用の変数
      setNameStr = '',
      // 検索用の配列
      sortDataArr = [],
      last_message = "dummy";
  
// milkcocoa定義関数pushの発火イベント監視　
  function _keepWatch(callback){
    ds.on("push", function(e) {
      callback(e.value);
      //複数接続の場合の値の変化に対応するため、変更された段階でprimaryIdを取得
      _dsStream();
    });
  }
 

  // "message"データストアにメッセージをプッシュする
  function _post(titleStr, wind, name) {
    var titleStr = titleStr || 'My dear';
    var name = name || '名無しさん';
    // console.log(name);
    console.log('milkcocoa push');
    var wind = wind;
    if (wind && wind !== "") {
      ////milkcocoa定義関数push（データストアへ挿入）
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
      date_html = '<p class="post-date">'+'id: ' + _escapeHTML(message.id) + ', ' + _escapeHTML(message.name) + ' ' +　'「' +  _escapeHTML(message.title)+　'」' +' : '+ _escapeHTML( new Date(message.date).toLocaleString())+'</p>';
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
    var callback = callback || function(){ return };//引数なし
    ds.stream().sort("desc").size(999).next(function(err, datas) {
          console.log('primaryId登録'+ datas.length);
          primaryId = datas.length;
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
              //Stringへキャスト
              var nameStr = String(data.value.name);
              var titleStr = String(data.value.title);
              //titleかnameに文字が含まれていたら
              if(titleStr.match(re) || nameStr.match(re)){
                  console.log(typeof data.value.title);
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
      //配列がmax個になったら，milkcocoaに送信
      windPowerArray.push(windPower);
      //配列がmax個になったら、stop
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
    //your nameをセット
    setNameStr = '';
    //現在のprimaryIdを取得
      _dsStream();
    //入力値が空であった場合はデータストアに送信しない
    if(windPowerArray.length>0){
      // milkcocoaに送信
      _post(setTitleStr, windPowerArray, setNameStr);
    }else{
      alert('入力値がありません');
    }
    
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
    keepWatch: _keepWatch,
    post:  _post,
    renderMessage: _renderMessage,
    resetHTML: _resetHTML,
    getAllDate: _getAllDate,
    dsStream: _dsStream,
    getSortData: _getSortData,
    getSortData: _getSortData,
    setTitle: _setTitle,
    startWind: _startWind,
    stopWind: _stopWind,
    escapeHTML: _escapeHTML,
    outNative: _outNative,
    isArray: _isArray
  };

}());


$(function() {

  var f = new FooFooClass();

  //入力ボタンのクリック
  $("#inPutBtn").click(function() {
        console.log("input");
        f.startWind();
  });
  //入力　停止ボタンのクリック
  $("#stopBtn").click(function() {
        console.log("stop");
        f.stopWind();
        f.getAllDate();
  });

  //titleを決定ボタンのクリック
  $("#titlePostBtn").click(function() {
        console.log("titlePostBtn");
        f.setTitle();
  });

  //検索ボタンのクリック
  $("#searchPutBtn").click(function() {
        console.log("searchPutBtn");
        var searchStr = $('#searchText').val();
        f.getSortData(searchStr);
  });

  //すべてを表示ボタンのクリック
  $("#showAllPutBtn").click(function() {
        // console.log("showAllPutBtn");
        // var message = { id: '1' , name: '加藤貴司' };
        // _renderMessage(message);
        f.getAllDate();
  });

  //非表示ボタンのクリック
  $("#hidePutBtn").click(function() {
        // console.log("hidePutBtn");
        f.resetHTML();
  });

  //初回起動時にデータ取得
  f.getAllDate();
  //初回起動時にmilkcocoa定義関数push(データストアに挿入)の発火イベント監視 → pushが発火時にrenderMessageのコールバック関数
  f.keepWatch(f.renderMessage);
    //////////今西さんのデータ
    // addTextNode('CLOSE');
});

