package com.example.simanishi.fuufuu;

import android.content.Context;
import android.util.Log;
import android.webkit.JavascriptInterface;
import android.widget.Toast;

import com.physicaloid.lib.Physicaloid;

/**
 * Created by simanishi on 2015/06/05.
 */
public class MyJavaScriptInterface {
    private Context context;
    Physicaloid mPysicaloid;

    public MyJavaScriptInterface(Context context) {
        this.context = context;
    }

    @JavascriptInterface
    public void showToast(String value) {
        Log.d("VALUE", value);
        if(value.length()>0) {
            byte[] buf = value.getBytes();
            mPysicaloid.write(buf, buf.length);
        }
        Toast.makeText(context, "censor value : " + String.valueOf(value), Toast.LENGTH_SHORT).show();
    }
}