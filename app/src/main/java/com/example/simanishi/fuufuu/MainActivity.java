package com.example.simanishi.fuufuu;

import android.content.Context;
import android.content.Intent;
import android.net.Uri;
import android.os.Build;
import android.os.Handler;
import android.support.v7.app.ActionBarActivity;
import android.os.Bundle;
import android.support.v7.app.AppCompatActivity;
import android.support.v7.widget.Toolbar;
import android.util.Log;
import android.view.Menu;
import android.view.MenuItem;
import android.view.View;
import android.view.Window;
import android.view.WindowManager;
import android.webkit.JavascriptInterface;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Button;
import android.widget.TextView;
import android.widget.Toast;

import com.physicaloid.lib.Physicaloid;
import com.physicaloid.lib.usb.driver.uart.ReadLisener;

import org.w3c.dom.Text;

import java.io.UnsupportedEncodingException;


public class MainActivity extends AppCompatActivity {

    TextView textView;
    WebView webView;
    Physicaloid mPhysicaloid;
    String mCensorVal;
    Handler mHandler;
    final String URL = "http://www.geocities.jp/lucky_ponies/android/";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        // XML resource
        //textView = (TextView) findViewById(R.id.textView);
        //Button nToW_Btn = (Button) findViewById(R.id.nToW_Btn);
        final Button pStartBtn = (Button) findViewById(R.id.physicaloidStart);
        mPhysicaloid = new Physicaloid(getApplicationContext());
        mHandler = new Handler();

        // WebView
        webView = (WebView) findViewById(R.id.webView);
        webView.getSettings().setJavaScriptEnabled(true);
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
        });

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
                        evaluateJs(webView, "addTextNode('OPEN')");
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
        public void showToast(String value) {
            Log.d("VALUE", String.valueOf(value.length()));
            if(value.length() > 0) {
                byte[] buf = value.getBytes();
                mPhysicaloid.write(buf, buf.length);
                Log.d("VALUE BUF", String.valueOf(buf.length));
            }
            Toast.makeText(context, "censor value : " + String.valueOf(value), Toast.LENGTH_SHORT).show();
        }
    }

}