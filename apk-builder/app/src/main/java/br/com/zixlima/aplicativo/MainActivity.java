package br.com.zixlima.aplicativo;
import android.app.Activity;
import android.os.Bundle;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
public class MainActivity extends Activity {
  private WebView webView;
  @Override public void onCreate(Bundle state) {
    super.onCreate(state);
    webView = new WebView(this);
    webView.setWebViewClient(new WebViewClient());
    WebSettings config = webView.getSettings();
    config.setJavaScriptEnabled(true);
    config.setDomStorageEnabled(true);
    config.setAllowFileAccess(false);
    config.setAllowContentAccess(false);
    config.setAllowFileAccessFromFileURLs(false);
    config.setAllowUniversalAccessFromFileURLs(false);
    setContentView(webView);
    webView.loadUrl("file:///android_asset/index.html");
  }
  @Override public void onBackPressed() { if (webView.canGoBack()) webView.goBack(); else super.onBackPressed(); }
  @Override public void onDestroy() { webView.destroy(); super.onDestroy(); }
}
