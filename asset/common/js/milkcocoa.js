$(function() {
          var dataArray = [];
          var windPowerArray = [];
          //1.ミルクココアインスタンスを作成
          var milkcocoa = new MilkCocoa("maxiac8gg9b.mlkcca.com");

          //2."message"データストアを作成
          var ds = milkcocoa.dataStore("windData");
          //idナンバー
          var primaryId;

          //入力の風のカウンター
          var max = 50;

          //デモ用のタイマー
          var windInterval;
          // title入力用の変数
          var setTitleStr = '';
          // 検索用の配列
          var sortDataArr = [];

          // ds.stream().sort('desc').next(function(err, data) {
          //   console.log(data[0].id);
          // });

          // ds.get('iaky2cm6z6z5w6a',function(err, data) {
          //     console.log(data);
          // });

          // ds.stream().sort("desc").size(999).next(function(err, datas) {
          // // console.log('data.lengths'+ datas.length);
          // // console.log(datas[49]);
          // primaryId = datas.length;
          // console.log("primaryId", primaryId);

          // //milkcocoaからデータを取得->配列を個々のstringに変換し、1つづつ出力
          // function getData(){
          //   datas.forEach(function(data) {
          //       console.log(data.value);
          //       // console.log(data.value.title);
          //       dataArray.push(data.value);
          //       // console.log(data);
          //       // console.log(data.id+ ": " + data.value.content);     
          //      });
          //       var id = 316;//test id:316を取得
          //       // 配列に格納してデータを一づつ出力　->Naitive
          //       outNative(dataArray[id]);
          //   }

          //     $("#outPutBtn").click(function() {
          //       onPushMeClicked();
          //     });

          //     function onPushMeClicked() {
          //         getData();
          //         return false;
          //     }
          // });

                      
          //ネイティブからmilkcocoaに送信
          // function addTextNode(windPower) {
          //     $(".nTOw").text(windPower);
          //     //windPowerを配列に
          //     //配列が50個になったら，milkcocoaに送信
          //     windPowerArray.push(windPower);
          //     if(windPowerArray.length == max){
          //       post("androidTestWind", windPowerArray);
          //       // 配列を初期化
          //       windPowerArray = [];
          //     }
          // }
          ///////////////////////////
          // 送信テスト
          // $("#test").click(function() {
          //     for(var i = 0; i < max-5; i++){
          //       addTextNode(i);
          //     }
          // }); 

          //入力ボタンのクリック
          $("#inPutBtn").click(function() {
                console.log("input");
                startWind();
          });
          //入力　停止ボタンのクリック
          $("#stopBtn").click(function() {
                console.log("stop");
                stopWind();
                getAllDate();
          });

          //titleを決定ボタンのクリック
          $("#titlePostBtn").click(function() {
                console.log("titlePostBtn");
                setTitle();
          });

          //検索ボタンのクリック
          $("#searchPutBtn").click(function() {
                console.log("searchPutBtn");
                var searchStr = $('#searchText').val();
                getSortData(searchStr);
          });

          //すべてを表示ボタンのクリック
          $("#showAllPutBtn").click(function() {
                // console.log("showAllPutBtn");
                // var message = { id: '1' , name: '加藤貴司' };
                // renderMessage(message);
                getAllDate();
          });

          //非表示ボタンのクリック
          $("#hidePutBtn").click(function() {
                // console.log("hidePutBtn");
                resetHTML();
          });

          //milkcocoaデータストアにプッシュ　引数1タイトル、引数2コンテンツ（風量）
          function post(titleStr, wind) {
              var titleStr = titleStr || 'androidTest';
              var name = '名無しさん';
              //5."message"データストアにメッセージをプッシュする
              console.log('milkcocoa push')
              var wind = wind;
              if (wind && wind !== "") {
                  primaryId++;
                  console.log("primaryId", primaryId);
                  ds.push({
                      id:primaryId,
                      title: titleStr,
                      name: name,
                      wind: wind,
                      date: new Date().getTime()
                  }, function (e) {});
              }
          }
          
        //html表示メッセージの最後の行
        var last_message = "dummy";

        //HTMLにデータを表示
        function renderMessage(message) {
            var message_html = '<p class="post-text">' + escapeHTML(message.wind) + '</p>';
            var date_html = '';
            var button_html = '<button class="windOutPutBtn" id = "windId' + message.id +'">OutPut</button>';
            if(message.date) {
                date_html = '<p class="post-date">'+'id: ' +escapeHTML(message.id) + ' ' + escapeHTML(message.title)+' : '+escapeHTML( new Date(message.date).toLocaleString())+'</p>';
            }
            $("#"+last_message).before('<div id="'+message.id+'" class="post">'+ button_html + message_html + date_html +'</div>');
            //$("#"+last_message).before('<div id="'+message.id+'" class="post">'+ escapeHTML(message.name) +'</div>');
            last_message = message.id;
            
            /////出力
            $('#windId' + message.id).click(function () {
                var power = message;
                // console.log('click', message.content, typeof windPower);
                // もしpowerの中身が配列じゃなかったらエラー処理（空だったら
                if(typeof power === 'object'){
                  console.log(power.wind);
                  outNative(power.wind);
                }else{
                  console.log('値がありまへん');
                  return;
                }
            });
        }

        //.content内のhtmlを消去
        function resetHTML(){
            $(".post").remove();
            //html表示メッセージの最後の行を初期化
            last_message = "dummy";
            console.log('reset');
        }
        // すべてのデータ取得
        getAllDate();
        function getAllDate(){
            resetHTML();
            //3.データストアからメッセージを取ってくる
            dsStream(renderMessage); 
        }

        //3.データストアからメッセージを取ってくる
        function dsStream(callback){
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
        function getSortData(sortStr){
            //HTMLをリセット
            resetHTML();
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
                        renderMessage(sortDataArr[sortArrNum].value);
                        sortArrNum++ ;
                    }
                    console.log(data.value.title);
                    // sortStrの文字とdata.value.titleを比較し，もしマッチしたらsortDataArrに格納
                });
                if(sortDataArr.length == 0){
                    console.log('そんなのないみたい。');
                    alert('そんなのないみたい。')
                }
            });
        }

        /////////
        //センサー値の入力
        function getCensorVal(){
          var windPower = Math.floor( Math.random() * 100 );
          console.log(windPower);
          // windPower.innerHTML = randNum;
          $("#windPower").text(windPower);
          $(".nTOw").text(windPower);
            //windPowerを配列に
            //配列が50個になったら，milkcocoaに送信
            windPowerArray.push(windPower);
            if(windPowerArray.length == max){
              stopWind();
            }
        }

        ///title set
        function setTitle(){
            setTitleStr = '';
            setTitleStr = $('#titleVal').val();
            $("#titleName").text(setTitleStr);
            $('#titleVal').val("");
        }

        //デモ用
        function startWind(){
          windInterval = setInterval(getCensorVal,100);
        }

        function stopWind(){
          // milkcocoaに送信
          post(setTitleStr, windPowerArray);
          clearInterval(windInterval);
          // 送信用のwind配列を初期化
          windPowerArray = [];
          console.log('stop');
        }
          //////////今西さんのデータ
          // addTextNode('CLOSE');
  });

//インジェクション対策
function escapeHTML(val) {
    return $('<div>').text(val).html();
}

//配列を一つづつ取り出しネイティブに出力
function outNative(array){
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
function isArray(obj) {
    return Object.prototype.toString.call(obj) === '[object Array]';
}



