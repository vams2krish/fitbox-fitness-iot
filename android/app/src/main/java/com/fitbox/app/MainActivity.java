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
    private PermissionRequest cameraRequest;
    private String legacyState;
    private boolean migrating;
    private ValueCallback<Uri[]> fileChooser;

    @Override public void onCreate(Bundle state) {
        super.onCreate(state);
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
            }
        });
        web.setWebChromeClient(new WebChromeClient() {
            @Override public boolean onShowFileChooser(WebView view, ValueCallback<Uri[]> callback, FileChooserParams params) {
                if (fileChooser != null) fileChooser.onReceiveValue(null);
                fileChooser = callback;
                Intent pick = new Intent(Intent.ACTION_OPEN_DOCUMENT);
                pick.addCategory(Intent.CATEGORY_OPENABLE);
                pick.setType("video/*");
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
        if (android.os.Build.VERSION.SDK_INT >= 33) getOnBackInvokedDispatcher().registerOnBackInvokedCallback(
            android.window.OnBackInvokedDispatcher.PRIORITY_DEFAULT,
            () -> web.evaluateJavascript("window.fitboxBack && window.fitboxBack()", null));
        migrating = !getPreferences(0).getBoolean("https-migrated", false);
        if (!migrating) web.getSettings().setAllowFileAccess(false);
        web.loadUrl(migrating ? "file:///android_asset/migrate.html" : LOCAL_URL);
    }
    private static WebResourceResponse missing() { return new WebResourceResponse("text/plain", "UTF-8", 404, "Not Found", java.util.Collections.emptyMap(), new ByteArrayInputStream(new byte[0])); }
    @Override public void onRequestPermissionsResult(int code, String[] permissions, int[] results) {
        super.onRequestPermissionsResult(code, permissions, results);
        if (code == 41 && cameraRequest != null) {
            if (results.length > 0 && results[0] == PackageManager.PERMISSION_GRANTED) cameraRequest.grant(new String[]{PermissionRequest.RESOURCE_VIDEO_CAPTURE}); else cameraRequest.deny();
            cameraRequest = null;
        }
    }
    @Override protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (requestCode == 42 && fileChooser != null) {
            Uri selected = resultCode == RESULT_OK && data != null ? data.getData() : null;
            String type = selected == null ? null : getContentResolver().getType(selected);
            fileChooser.onReceiveValue(selected != null && type != null && type.startsWith("video/") ? new Uri[]{selected} : null);
            fileChooser = null;
        }
    }
    @Override public void onBackPressed() { web.evaluateJavascript("window.fitboxBack && window.fitboxBack()", null); }
    @Override protected void onPause() { web.evaluateJavascript("window.fitboxPause && window.fitboxPause()", null); super.onPause(); }
    @Override protected void onDestroy() { if(cameraRequest != null) cameraRequest.deny(); web.destroy(); super.onDestroy(); }
}
