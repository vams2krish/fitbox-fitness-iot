package com.fitbox.app;

import android.Manifest;
import android.app.Activity;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.JavascriptInterface;
import android.webkit.PermissionRequest;
import android.webkit.WebChromeClient;
import android.webkit.WebResourceRequest;
import android.webkit.WebResourceResponse;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.webkit.ValueCallback;
import android.widget.FrameLayout;
import androidx.webkit.WebViewAssetLoader;
import java.io.ByteArrayInputStream;
import org.json.JSONObject;

public class MainActivity extends Activity {
    private static final String HOST = "fitbox-fitness-iot.vercel.app";
    private static final String LOCAL_URL = "https://" + HOST + "/app-assets/index.html";
    private WebView web;
    private android.speech.tts.TextToSpeech tts;
    private String pendingExport;
    private android.telephony.PhoneStateListener callListener;
    private PermissionRequest cameraRequest;
    private String legacyState;
    private boolean migrating;
    private ValueCallback<Uri[]> fileChooser;

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
        tts = new android.speech.tts.TextToSpeech(this, status -> { if (status == android.speech.tts.TextToSpeech.SUCCESS) { tts.setLanguage(java.util.Locale.US); tts.setAudioAttributes(new android.media.AudioAttributes.Builder().setUsage(android.media.AudioAttributes.USAGE_ASSISTANCE_NAVIGATION_GUIDANCE).setContentType(android.media.AudioAttributes.CONTENT_TYPE_SPEECH).build()); java.util.Set<android.speech.tts.Voice> voices = tts.getVoices(); if (voices != null) for (android.speech.tts.Voice voice : voices) if (!voice.isNetworkConnectionRequired() && voice.getLocale().getLanguage().equals("en")) { tts.setVoice(voice); break; } } });
        web = new WebView(this);
        web.setBackgroundColor(0xFFFFFFFF);
        web.getSettings().setJavaScriptEnabled(true);
        web.getSettings().setDomStorageEnabled(true);
        web.getSettings().setAllowFileAccess(true);
        web.getSettings().setAllowContentAccess(true);
        web.getSettings().setAllowFileAccessFromFileURLs(false);
        web.getSettings().setAllowUniversalAccessFromFileURLs(false);
        web.getSettings().setMediaPlaybackRequiresUserGesture(true);
        web.addJavascriptInterface(new Object() {
            @JavascriptInterface public void enableCallProtection() { runOnUiThread(() -> { if(checkSelfPermission(Manifest.permission.READ_PHONE_STATE)==PackageManager.PERMISSION_GRANTED)registerCallProtection();else requestPermissions(new String[]{Manifest.permission.READ_PHONE_STATE},44); }); }
            @JavascriptInterface public boolean notificationsAllowed() { return NudgeScheduler.allowed(MainActivity.this); }
            @JavascriptInterface public void scheduleNudges(String json) { runOnUiThread(() -> NudgeScheduler.schedule(MainActivity.this,json)); }
            @JavascriptInterface public void cancelNudges() { runOnUiThread(() -> NudgeScheduler.cancel(MainActivity.this)); }
            @JavascriptInterface public void testNudge() { runOnUiThread(() -> NudgeScheduler.test(MainActivity.this)); }
            @JavascriptInterface public void openNotificationSettings() { runOnUiThread(() -> { Intent intent=new Intent(android.provider.Settings.ACTION_APP_NOTIFICATION_SETTINGS).putExtra(android.provider.Settings.EXTRA_APP_PACKAGE,getPackageName());startActivity(intent); }); }
            @JavascriptInterface public void requestNotificationPermission() { runOnUiThread(() -> { if(android.os.Build.VERSION.SDK_INT>=33&&checkSelfPermission(Manifest.permission.POST_NOTIFICATIONS)!=PackageManager.PERMISSION_GRANTED)requestPermissions(new String[]{Manifest.permission.POST_NOTIFICATIONS},45);else web.evaluateJavascript("window.fitboxNotificationPermission && window.fitboxNotificationPermission()",null); }); }
            @JavascriptInterface public boolean callProtectionEnabled() { return checkSelfPermission(Manifest.permission.READ_PHONE_STATE)==PackageManager.PERMISSION_GRANTED; }
            @JavascriptInterface public void openBluetoothSettings() { runOnUiThread(() -> { try { startActivity(new Intent(android.provider.Settings.ACTION_BLUETOOTH_SETTINGS)); } catch (android.content.ActivityNotFoundException e) { startActivity(new Intent(android.provider.Settings.ACTION_SETTINGS)); } }); }
            @JavascriptInterface public void speak(String text) { if (text == null || text.length() > 1000) return; runOnUiThread(() -> { if (tts != null && hasWindowFocus() && tts.getVoice() != null && !tts.getVoice().isNetworkConnectionRequired()) tts.speak(text, android.speech.tts.TextToSpeech.QUEUE_FLUSH, null, "fitbox-cue"); }); }
            @JavascriptInterface public void stopSpeech() { runOnUiThread(() -> { if (tts != null) tts.stop(); }); }
            @JavascriptInterface public void saveTextFile(String name, String data, String type) { if (data == null || data.length() > 5000000 || name == null || !name.matches("[A-Za-z0-9_.-]{1,120}")) return; runOnUiThread(() -> { pendingExport = data; Intent create = new Intent(Intent.ACTION_CREATE_DOCUMENT); create.addCategory(Intent.CATEGORY_OPENABLE); create.setType("text/plain"); create.putExtra(Intent.EXTRA_TITLE, name); try { startActivityForResult(create, 43); } catch (android.content.ActivityNotFoundException e) { pendingExport = null; } }); }
            @JavascriptInterface public void prepareSupport(String json) { if (json == null || json.length() > 12000000) return; runOnUiThread(() -> { try { JSONObject payload = new JSONObject(json); Intent send = new Intent(Intent.ACTION_SEND_MULTIPLE); send.setType("image/*"); send.putExtra(Intent.EXTRA_EMAIL, new String[]{"adam.vamshikrishna@gmail.com"}); send.putExtra(Intent.EXTRA_SUBJECT, payload.optString("subject").substring(0, Math.min(150,payload.optString("subject").length()))); send.putExtra(Intent.EXTRA_TEXT,payload.optString("text")); java.util.ArrayList<Uri> uris = new java.util.ArrayList<>(); org.json.JSONArray files = payload.optJSONArray("files"); java.io.File folder = new java.io.File(getCacheDir(),"support"); folder.mkdirs(); if (files != null) for (int i=0;i<Math.min(files.length(),4);i++) { JSONObject f=files.getJSONObject(i); String type=f.optString("type"); if (!type.equals("image/png") && !type.equals("image/jpeg") && !type.equals("image/webp")) continue; byte[] data=android.util.Base64.decode(f.optString("data"),android.util.Base64.DEFAULT); if(data.length>2097152)continue; java.io.File file=new java.io.File(folder,"FitBox-screenshot-"+i+(type.equals("image/png")?".png":type.equals("image/webp")?".webp":".jpg")); try(java.io.FileOutputStream out=new java.io.FileOutputStream(file)){out.write(data);} uris.add(androidx.core.content.FileProvider.getUriForFile(MainActivity.this,getPackageName()+".files",file)); } send.putParcelableArrayListExtra(Intent.EXTRA_STREAM,uris); send.addFlags(Intent.FLAG_GRANT_READ_URI_PERMISSION); startActivity(Intent.createChooser(send,"Send FitBox support email")); } catch(Exception ignored) { } }); }
            @JavascriptInterface public void exitApp() { runOnUiThread(() -> finish()); }
            @JavascriptInterface public void shareData(String json) {
                if (json == null || json.length() > 5000000) return;
                try { new JSONObject(json); } catch (org.json.JSONException e) { return; }
                runOnUiThread(() -> {
                    Intent send = new Intent(Intent.ACTION_SEND);
                    send.setType("application/json");
                    send.putExtra(Intent.EXTRA_TEXT, json);
                    send.putExtra(Intent.EXTRA_SUBJECT, "FitBox data export");
                    startActivity(Intent.createChooser(send, "Export FitBox data"));
                });
            }
        }, "FitBoxAndroid");
        WebViewAssetLoader loader = new WebViewAssetLoader.Builder().setDomain(HOST)
            .addPathHandler("/app-assets/", path -> {
                if (path.contains("..")) return missing();
                String mime = path.endsWith(".mjs") || path.endsWith(".js") ? "text/javascript"
                    : path.endsWith(".wasm") ? "application/wasm"
                    : path.endsWith(".html") ? "text/html"
                    : path.endsWith(".css") ? "text/css"
                    : path.endsWith(".json") ? "application/json"
                    : path.endsWith(".svg") ? "image/svg+xml"
                    : path.endsWith(".png") ? "image/png" : "application/octet-stream";
                try { return new WebResourceResponse(mime, null, getAssets().open(path)); }
                catch (java.io.IOException e) { return missing(); }
            }).build();
        web.setWebViewClient(new WebViewClient() {
            @Override public WebResourceResponse shouldInterceptRequest(WebView view, WebResourceRequest request) { return loader.shouldInterceptRequest(request.getUrl()); }
            @Override public boolean shouldOverrideUrlLoading(WebView view, WebResourceRequest request) {
                Uri uri = request.getUrl();
                if ("https".equals(uri.getScheme()) && HOST.equals(uri.getHost())
                    && uri.getPath() != null && uri.getPath().startsWith("/app-assets/")) return false;
                if (migrating && "file:///android_asset/migrate.html".equals(uri.toString())) return false;
                if ("https".equals(uri.getScheme())) startActivity(new Intent(Intent.ACTION_VIEW, uri));
                return true;
            }
            @Override public void onPageFinished(WebView view, String url) {
                if (migrating && url.startsWith("file:///android_asset/migrate.html")) {
                    web.evaluateJavascript("localStorage.getItem('fitbox.v1')", result -> {
                        try { Object value = new org.json.JSONTokener(result).nextValue(); if (value instanceof String) legacyState = (String)value; }
                        catch (org.json.JSONException ignored) { }
                        migrating = false;
                        web.getSettings().setAllowFileAccess(false);
                        web.loadUrl(LOCAL_URL);
                    });
                } else if (url.equals(LOCAL_URL) && !getPreferences(0).getBoolean("https-migrated", false)) {
                    getPreferences(0).edit().putBoolean("https-migrated", true).apply();
                    if (legacyState != null) web.evaluateJavascript("if(!localStorage.getItem('fitbox.v1'))localStorage.setItem('fitbox.v1'," + JSONObject.quote(legacyState) + ");location.reload();", null);
                    legacyState = null;
                }
                if(url.equals(LOCAL_URL))openNotificationRoute();
            }
        });
        web.setWebChromeClient(new WebChromeClient() {
            @Override public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (fileChooser != null) fileChooser.onReceiveValue(null);
                fileChooser = callback;
                Intent pick = new Intent(Intent.ACTION_OPEN_DOCUMENT);
                pick.addCategory(Intent.CATEGORY_OPENABLE);
                pick.setType("*/*");
                pick.putExtra(Intent.EXTRA_MIME_TYPES, new String[]{"video/*","image/*"});
                pick.putExtra(Intent.EXTRA_LOCAL_ONLY,true);
                try { startActivityForResult(pick, 42); }
                catch (android.content.ActivityNotFoundException e) { fileChooser.onReceiveValue(null); fileChooser = null; }
                return true;
            }
            @Override public void onPermissionRequest(PermissionRequest request) {
                runOnUiThread(() -> {
                    if (!"https".equals(request.getOrigin().getScheme()) || !HOST.equals(request.getOrigin().getHost())) { request.deny(); return; }
                    boolean video = java.util.Arrays.asList(request.getResources()).contains(PermissionRequest.RESOURCE_VIDEO_CAPTURE);
                    if (!video) { request.deny(); return; }
                    if (checkSelfPermission(Manifest.permission.CAMERA) == PackageManager.PERMISSION_GRANTED) request.grant(new String[]{PermissionRequest.RESOURCE_VIDEO_CAPTURE});
                    else {
                        if (cameraRequest != null) cameraRequest.deny();
                        cameraRequest = request;
                        requestPermissions(new String[]{Manifest.permission.CAMERA}, 41);
                    }
                });
            }
            @Override public void onPermissionRequestCanceled(PermissionRequest request) { if (cameraRequest == request) cameraRequest = null; }
        });
        FrameLayout container = new FrameLayout(this);
        container.setBackgroundColor(0xFFFFFFFF);
        container.addView(web, new FrameLayout.LayoutParams(-1, -1));
        if (android.os.Build.VERSION.SDK_INT >= 35) container.setOnApplyWindowInsetsListener((view, insets) -> {
            android.graphics.Insets bars = insets.getInsets(android.view.WindowInsets.Type.systemBars());
            view.setPadding(bars.left, bars.top, bars.right, bars.bottom);
            return insets;
        });
        setContentView(container);
        if(checkSelfPermission(Manifest.permission.READ_PHONE_STATE)==PackageManager.PERMISSION_GRANTED)registerCallProtection();
        if (android.os.Build.VERSION.SDK_INT >= 33) getOnBackInvokedDispatcher().registerOnBackInvokedCallback(
            android.window.OnBackInvokedDispatcher.PRIORITY_DEFAULT,
            () -> web.evaluateJavascript("window.fitboxBack && window.fitboxBack()", null));
        migrating = !getPreferences(0).getBoolean("https-migrated", false);
        if (!migrating) web.getSettings().setAllowFileAccess(false);
        web.loadUrl(migrating ? "file:///android_asset/migrate.html" : LOCAL_URL);
    }
    private void registerCallProtection() { if(callListener!=null)return;try{android.telephony.TelephonyManager manager=(android.telephony.TelephonyManager)getSystemService(TELEPHONY_SERVICE);if(manager==null)return;callListener=new android.telephony.PhoneStateListener(){@Override public void onCallStateChanged(int state,String unused){if(state!=android.telephony.TelephonyManager.CALL_STATE_IDLE&&web!=null){web.post(()->web.evaluateJavascript("window.fitboxPause && window.fitboxPause()",null));if(tts!=null)tts.stop();}}};manager.listen(callListener,android.telephony.PhoneStateListener.LISTEN_CALL_STATE);}catch(SecurityException e){callListener=null;} }
    private static WebResourceResponse missing() { return new WebResourceResponse("text/plain", "UTF-8", 404, "Not Found", java.util.Collections.emptyMap(), new ByteArrayInputStream(new byte[0])); }
    @Override public void onRequestPermissionsResult(int code, String[] permissions, int[] results) {
        super.onRequestPermissionsResult(code, permissions, results);
        if(code==45&&web!=null)web.evaluateJavascript("window.fitboxNotificationPermission && window.fitboxNotificationPermission()",null);
        if(code==44&&results.length>0&&results[0]==PackageManager.PERMISSION_GRANTED)registerCallProtection();
        if (code == 41 && cameraRequest != null) {
            if (results.length > 0 && results[0] == PackageManager.PERMISSION_GRANTED) cameraRequest.grant(new String[]{PermissionRequest.RESOURCE_VIDEO_CAPTURE}); else cameraRequest.deny();
            cameraRequest = null;
        }
    }
    @Override protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == 43) { if (resultCode == RESULT_OK && data != null && pendingExport != null) { try(java.io.OutputStream out=getContentResolver().openOutputStream(data.getData())) { if(out!=null)out.write(pendingExport.getBytes(java.nio.charset.StandardCharsets.UTF_8)); } catch(java.io.IOException ignored) { } } pendingExport=null; }
        if (requestCode == 42 && fileChooser != null) {
            Uri selected = resultCode == RESULT_OK && data != null ? data.getData() : null;
            String type = selected == null ? null : getContentResolver().getType(selected);
            fileChooser.onReceiveValue(selected != null && type != null && (type.startsWith("video/") || type.startsWith("image/")) ? new Uri[]{selected} : null);
            fileChooser = null;
        }
    }
    private void openNotificationRoute() { String route=getIntent().getStringExtra("fitbox-route");if(route!=null&&web!=null&&LOCAL_URL.equals(web.getUrl())&&java.util.Arrays.asList("home","program","coach","billing").contains(route)){getIntent().removeExtra("fitbox-route");web.evaluateJavascript("window.fitboxOpenNotification && window.fitboxOpenNotification("+JSONObject.quote(route)+")",null);} }
    @Override protected void onNewIntent(Intent intent) { super.onNewIntent(intent);setIntent(intent);openNotificationRoute(); }
    @Override public void onBackPressed() { web.evaluateJavascript("window.fitboxBack && window.fitboxBack()", null); }
    @Override protected void onPause() { if(web!=null){web.evaluateJavascript("window.fitboxPause && window.fitboxPause()", null);web.onPause();}if(tts!=null)tts.stop();super.onPause(); }
    @Override protected void onResume() { super.onResume();if(web!=null)web.onResume();if(checkSelfPermission(Manifest.permission.READ_PHONE_STATE)==PackageManager.PERMISSION_GRANTED)registerCallProtection(); }
    @Override public void onWindowFocusChanged(boolean focus) { super.onWindowFocusChanged(focus);if(!focus&&web!=null){web.evaluateJavascript("window.fitboxPause && window.fitboxPause()",null);if(tts!=null)tts.stop();} }
    @Override protected void onDestroy() { if(cameraRequest != null) cameraRequest.deny(); if(callListener!=null){android.telephony.TelephonyManager manager=(android.telephony.TelephonyManager)getSystemService(TELEPHONY_SERVICE);if(manager!=null)manager.listen(callListener,android.telephony.PhoneStateListener.LISTEN_NONE);}if(tts!=null){tts.stop();tts.shutdown();}web.destroy(); super.onDestroy(); }
}
