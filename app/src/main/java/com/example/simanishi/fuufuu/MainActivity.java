package com.example.simanishi.fuufuu;

import android.content.BroadcastReceiver;
import android.content.Context;
import android.content.IntentFilter;
import android.hardware.Camera;
import android.media.AudioManager;
import android.net.Uri;
import android.os.Build;
import android.os.Handler;
import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.util.Log;
import android.view.KeyEvent;
import android.view.SurfaceHolder;
import android.view.SurfaceView;
import android.view.View;
import android.webkit.ConsoleMessage;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.FrameLayout;
import android.widget.TextView;
import android.widget.Toast;
import com.physicaloid.lib.Physicaloid;
import com.physicaloid.lib.usb.driver.uart.ReadLisener;
import java.io.IOException;
import java.io.UnsupportedEncodingException;
import java.lang.reflect.Array;
import java.util.ArrayList;

//wind sensor
import com.weatherflow.windmeter.sensor_sdk.entities.HeadsetState;
import com.weatherflow.windmeter.sensor_sdk.sdk.AnemometerObservation;
import com.weatherflow.windmeter.sensor_sdk.sdk.HeadphonesReceiver;
import com.weatherflow.windmeter.sensor_sdk.sdk.IHeadphonesStateListener;
import com.weatherflow.windmeter.sensor_sdk.sdk.WFConfig;
import com.weatherflow.windmeter.sensor_sdk.sdk.WFSensor;

public class MainActivity extends AppCompatActivity implements IHeadphonesStateListener, WFSensor.OnValueChangedListener {

    TextView textView;
    WebView webView;
    Physicaloid mPhysicaloid;
    String mCensorVal;
    Handler mHandler;
    //final String URL = "http://simanishi.angry.jp/fuufuuv2/test2.html";
    final String URL = "file:///android_asset/index.html";
    ArrayList windArray = new ArrayList();
    int count = 0;

    //camera
//    private Camera mCam = null;
//    private CameraPreview mCamPreview = null;

    //wind sensor
    private final static String HEADSET_ACTION = "android.intent.action.HEADSET_PLUG";
    private BroadcastReceiver mHeadphonesReceiver;
    private TextView mSpeed;
    private Button mStart, mStop;

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);


        // カメラインスタンスの取得
        /*try {
            mCam = Camera.open(Camera.CameraInfo.CAMERA_FACING_FRONT);
        } catch (Exception e) {
            // エラー
            this.finish();
        }

        // FrameLayout に CameraPreview クラスを設定
        FrameLayout preview = (FrameLayout)findViewById(R.id.cameraView);
        mCamPreview = new CameraPreview(this, mCam);
        preview.addView(mCamPreview);*/

        mSpeed = (TextView) findViewById(R.id.speed);

        mHeadphonesReceiver = new HeadphonesReceiver(this);
        setVolumeControlStream(AudioManager.STREAM_MUSIC);

        mStart = (Button) findViewById(R.id.start);
        mStart.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                WFSensor.getInstance(MainActivity.this).setOnValueChangedListener(MainActivity.this);
            }
        });

        mStop = (Button) findViewById(R.id.stop);
        mStop.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                windToArrayStop();
            }
        });


        // XML resource
        //textView = (TextView) findViewById(R.id.textView);
        //Button nToW_Btn = (Button) findViewById(R.id.nToW_Btn);
        final Button pStartBtn = (Button) findViewById(R.id.physicaloidStart);
        mPhysicaloid = new Physicaloid(getApplicationContext());
        mHandler = new Handler();

        // WebView
        webView = (WebView) findViewById(R.id.webView);
        webView.getSettings().setJavaScriptEnabled(true);
        if(Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT) {
            WebView.setWebContentsDebuggingEnabled(true);
        }
        webView.addJavascriptInterface(new MyJavaScriptInterface(this), "Native");
        webView.loadUrl(URL);
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                if (!Uri.parse(url).getScheme().equals("native")) {
                    return false;
                }
                Toast.makeText(MainActivity.this, "Url requested: " + url, Toast.LENGTH_SHORT).show();
                return true;
            }
            public boolean onConsoleMessage(ConsoleMessage cm) {
                Log.d("MyApplication", cm.message() + " -- From line "
                        + cm.lineNumber() + " of "
                        + cm.sourceId() );
                return true;
            }
        });
//        webView = (WebView) findViewById(R.id.webView);
//        webView.getSettings().setJavaScriptEnabled(true);
//        webView.addJavascriptInterface(new MyJavaScriptInterface(this), "Native");
//        webView.loadUrl("http://simanishi.angry.jp/fuufuuv2/index.html");
//        webView.setWebViewClient(new WebViewClient() {
//            @Override
//            public boolean shouldOverrideUrlLoading(WebView view, String url) {
//                if (!Uri.parse(url).getScheme().equals("native")) {
//                    return false;
//                }
//                Toast.makeText(MainActivity.this, "Url requested: " + url, Toast.LENGTH_SHORT).show();
//                return true;
//            }
//        });


        Button serialWriteBtn = (Button) findViewById(R.id.serialWrite);
        serialWriteBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                String value = "111";
                byte[] buf = value.getBytes();
                mPhysicaloid.write(buf, buf.length);
                Log.d("SERIAL", "serial");
            }
        });

        // Physicaloid OPEN
        pStartBtn.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View v) {
                if (!mPhysicaloid.isOpened()) {
                    if (mPhysicaloid.open()) {
                        pStartBtn.setText("CLOSE");


                        // センサーのリスナー登録
                        mPhysicaloid.addReadListener(new ReadLisener() {

                            @Override
                            // Androidでシリアル文字を受信したらコールバックが発生
                            public void onRead(int size) {
                                byte[] buf = new byte[size];
                                mPhysicaloid.read(buf, size);
                                try {
                                    mCensorVal = new String(buf, "UTF-8");
                                } catch (UnsupportedEncodingException e) {
                                    return;
                                }
                                Integer num = decodePacket(buf);
                                mCensorVal = String.valueOf(num);
                                //WebViewに値を渡す
                                mHandler.post(new Runnable() {
                                    @Override
                                    public void run() {
                                        evaluateJs(webView, "addTextNode('" + mCensorVal.toString() + "')");
                                    }
                                });
                            }
                        });
                    } else {
                        textView.setText("CAN NOT OPEN");
                    }
                } else {
                    mPhysicaloid.close();
                    pStartBtn.setText("OPEN");
                    evaluateJs(webView, "addTextNode('CLOSE')");
                }
            }
        });

        mSpeed = (TextView) findViewById(R.id.speed);

        mHeadphonesReceiver = new HeadphonesReceiver(this);
        setVolumeControlStream(AudioManager.STREAM_MUSIC);

        mStart = (Button) findViewById(R.id.start);
        mStart.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                WFSensor.getInstance(MainActivity.this).setOnValueChangedListener(MainActivity.this);
            }
        });

        mStop = (Button) findViewById(R.id.stop);
        mStop.setOnClickListener(new View.OnClickListener() {
            @Override
            public void onClick(View view) {
                windSensorStop();
            }
        });
    }



    // s と \r の間の数値を抜き出す
    private int decodePacket(byte[] buf) {
        boolean existStx = false;
        int result = 0;

        for(int i=0; i<buf.length; i++) {
            if(!existStx) {
                if(buf[i] == 's') { // 最初のsを検索
                    existStx = true;
                }
            } else {
                if(buf[i] == '\r') { // 最後の ¥r までresultに取り込む
                    return result;
                } else {
                    if('0' <= buf[i] && buf[i] <= '9') { // 数値情報をシフトさせながらresultに保存する
                        result = result*10 + (buf[i]-'0'); // 文字 '0' 分を引くことでASCIIコードから数値に変換
                    } else {
                        return -1;
                    }
                }
            }
        }

        return -1;
    }

    @Override
    protected void onDestroy() {
        super.onDestroy();
        mPhysicaloid.close();
    }

    private void evaluateJs(WebView webView, String script) {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.KITKAT)
            webView.evaluateJavascript(script, null);
        else
            webView.loadUrl("javascript:" + script);
    }

    private class MyJavaScriptInterface {
        private Context context;

        public MyJavaScriptInterface(Context context) {
            this.context = context;
        }

        @JavascriptInterface
        public void sendToNative(String value) {

            byte[] bb = value.getBytes();
            mPhysicaloid.write(bb, bb.length);

        }
    }

    private class CameraPreview extends SurfaceView implements SurfaceHolder.Callback {

        private Camera mCam;

        /**
         * コンストラクタ
         */
        public CameraPreview(Context context, Camera cam) {
            super(context);

            mCam = cam;

            // サーフェスホルダーの取得とコールバック通知先の設定
            SurfaceHolder holder = getHolder();
            holder.addCallback(this);
            holder.setType(SurfaceHolder.SURFACE_TYPE_PUSH_BUFFERS);
        }

        /**
         * SurfaceView 生成
         */
        public void surfaceCreated(SurfaceHolder holder) {
            try {
                // カメラインスタンスに、画像表示先を設定
                mCam.setPreviewDisplay(holder);
                // プレビュー開始
                mCam.startPreview();
            } catch (IOException e) {
                //
            }
        }

        /**
         * SurfaceView 破棄
         */
        public void surfaceDestroyed(SurfaceHolder holder) {
        }

        /**
         * SurfaceHolder が変化したときのイベント
         */
        public void surfaceChanged(SurfaceHolder holder, int format, int width, int height) {
            // 画面回転に対応する場合は、ここでプレビューを停止し、
            // 回転による処理を実施、再度プレビューを開始する。
        }
    }

    @Override
    public boolean onKeyDown(int keyCode, KeyEvent event) {
        switch (keyCode) {
            case KeyEvent.KEYCODE_VOLUME_UP:
                return true;
            case KeyEvent.KEYCODE_VOLUME_DOWN:
                return true;
            default:
                return false;
        }
    }

    @Override
    public void onStart() {
        super.onStart();
        registerReceiver(mHeadphonesReceiver, new IntentFilter(HEADSET_ACTION));
        WFConfig.getAnoConfig(this);
    }

    @Override
    protected void onResume() {
        super.onResume();
        WFSensor.getInstance(this).onResume();
    }

    @Override
    protected void onPause() {
        super.onPause();
        WFSensor.getInstance(this).onPause();
    }

    @Override
    public void onStop() {
        super.onStop();
        HeadsetState state = new HeadsetState();
        state.setPluggedIn(false);
        onHeadphonesStateChanged(state);
        unregisterReceiver(mHeadphonesReceiver);
    }

    @Override
    public void onHeadphonesStateChanged(HeadsetState headsetState) {
        WFSensor.getInstance(this).onHeadphonesStateChanged(headsetState);
    }

    private void windToArrayStop() {
        if (windArray.size() > 0) {
            windArray.clear();
            Log.v("ARRAY_CHECK", String.valueOf(windArray.size()));
            windSensorStop();
        }
        Log.v("ARRAY_CHECK", "止めて配列初期化したよ");
    }

    private void windSensorStop() {
        WFSensor.getInstance(MainActivity.this).setOnValueChangedListener(null);
        mSpeed.setText("Stop now");
    }

    @Override
    public void onValueChanged(final AnemometerObservation anemometerObservation) {
        runOnUiThread(new Runnable() {
            @Override
            public void run() {

                int wind = 0;

                final int MAX_WINDARRAY = 10;

                if (anemometerObservation.getWindSpeed() > 0.0) {
                    if (anemometerObservation.getWindSpeed() > 4.0) {
                        wind = 254;
                    } else {
                        wind = (int) (anemometerObservation.getWindSpeed() * 254) / 4;
                    }
                    windArray.add(wind);

                    if (windArray.size() == MAX_WINDARRAY) {
                        windToArrayStop();
                        Log.v("ARRAY_CHECK", "10個になったよ");
                        count = 0;
                        return;
                    }
                    //windArray.add(wind);
                    evaluateJs(webView, "addTextNode('" + wind + "')");
                    count ++;
                }

                mSpeed.setText("" + wind);
            }
        });
    }

    @Override
    public void onError(String s) {
        Toast.makeText(this, "Error", Toast.LENGTH_SHORT).show();
    }
}