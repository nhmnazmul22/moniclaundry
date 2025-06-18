package com.moniclaundry.pos;

import android.Manifest;
import android.annotation.SuppressLint;
import android.content.Intent;
import android.content.pm.PackageManager;
import android.location.Location;
import android.net.Uri;
import android.os.Bundle;
import android.webkit.GeolocationPermissions;
import android.webkit.JavascriptInterface;
import android.webkit.ValueCallback;
import android.webkit.WebChromeClient;
import android.webkit.WebSettings;
import android.webkit.WebView;
import android.webkit.WebViewClient;
import android.widget.Toast;

import androidx.annotation.NonNull;
import androidx.appcompat.app.AppCompatActivity;
import androidx.core.app.ActivityCompat;
import androidx.core.content.ContextCompat;

import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationServices;

public class MainActivity extends AppCompatActivity {

    private static final int PERMISSION_REQUEST_CODE = 1001;
    private static final int FILE_CHOOSER_REQUEST_CODE = 1002;
    
    private WebView webView;
    private ValueCallback<Uri[]> fileUploadCallback;
    private FusedLocationProviderClient fusedLocationClient;
    private String userRole = "";

    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        setContentView(R.layout.activity_main);

        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this);
        
        initWebView();
        requestPermissions();
    }

    @SuppressLint("SetJavaScriptEnabled")
    private void initWebView() {
        webView = findViewById(R.id.webview);
        
        WebSettings webSettings = webView.getSettings();
        webSettings.setJavaScriptEnabled(true);
        webSettings.setDomStorageEnabled(true);
        webSettings.setAllowFileAccess(true);
        webSettings.setAllowContentAccess(true);
        webSettings.setGeolocationEnabled(true);
        webSettings.setMediaPlaybackRequiresUserGesture(false);
        
        // Add JavaScript interface
        webView.addJavascriptInterface(new WebAppInterface(), "AndroidInterface");
        
        webView.setWebViewClient(new WebViewClient() {
            @Override
            public boolean shouldOverrideUrlLoading(WebView view, String url) {
                if (url.startsWith("tel:")) {
                    Intent intent = new Intent(Intent.ACTION_CALL);
                    intent.setData(Uri.parse(url));
                    if (ContextCompat.checkSelfPermission(MainActivity.this, 
                            Manifest.permission.CALL_PHONE) == PackageManager.PERMISSION_GRANTED) {
                        startActivity(intent);
                    }
                    return true;
                }
                return false;
            }
            
            @Override
            public void onPageFinished(WebView view, String url) {
                super.onPageFinished(view, url);
                // Inject CSS for mobile optimization
                webView.loadUrl("javascript:(function() {" +
                    "var meta = document.createElement('meta');" +
                    "meta.name = 'viewport';" +
                    "meta.content = 'width=device-width, initial-scale=1.0, maximum-scale=1.0, user-scalable=no';" +
                    "document.getElementsByTagName('head')[0].appendChild(meta);" +
                    "})()");
            }
        });
        
        webView.setWebChromeClient(new WebChromeClient() {
            @Override
            public void onGeolocationPermissionsShowPrompt(String origin, 
                    GeolocationPermissions.Callback callback) {
                callback.invoke(origin, true, false);
            }
            
            @Override
            public boolean onShowFileChooser(WebView webView, ValueCallback<Uri[]> filePathCallback,
                    FileChooserParams fileChooserParams) {
                fileUploadCallback = filePathCallback;
                
                Intent intent = new Intent(Intent.ACTION_GET_CONTENT);
                intent.addCategory(Intent.CATEGORY_OPENABLE);
                intent.setType("image/*");
                
                startActivityForResult(Intent.createChooser(intent, "Select Image"), 
                    FILE_CHOOSER_REQUEST_CODE);
                return true;
            }
        });
        
        // Load the web app
        String webAppUrl = BuildConfig.WEB_APP_URL;
        if (webAppUrl == null || webAppUrl.isEmpty()) {
            webAppUrl = "https://your-app-url.vercel.app"; // Fallback URL
        }
        
        webView.loadUrl(webAppUrl);
    }
    
    private void requestPermissions() {
        String[] permissions = {
            Manifest.permission.ACCESS_FINE_LOCATION,
            Manifest.permission.ACCESS_COARSE_LOCATION,
            Manifest.permission.CAMERA,
            Manifest.permission.WRITE_EXTERNAL_STORAGE,
            Manifest.permission.CALL_PHONE
        };
        
        ActivityCompat.requestPermissions(this, permissions, PERMISSION_REQUEST_CODE);
    }
    
    @Override
    public void onRequestPermissionsResult(int requestCode, @NonNull String[] permissions, 
            @NonNull int[] grantResults) {
        super.onRequestPermissionsResult(requestCode, permissions, grantResults);
        
        if (requestCode == PERMISSION_REQUEST_CODE) {
            boolean allPermissionsGranted = true;
            for (int result : grantResults) {
                if (result != PackageManager.PERMISSION_GRANTED) {
                    allPermissionsGranted = false;
                    break;
                }
            }
            
            if (!allPermissionsGranted) {
                Toast.makeText(this, "Some permissions are required for full functionality", 
                    Toast.LENGTH_LONG).show();
            }
        }
    }
    
    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        
        if (requestCode == FILE_CHOOSER_REQUEST_CODE) {
            if (fileUploadCallback != null) {
                Uri[] results = null;
                if (resultCode == RESULT_OK && data != null) {
                    String dataString = data.getDataString();
                    if (dataString != null) {
                        results = new Uri[]{Uri.parse(dataString)};
                    }
                }
                fileUploadCallback.onReceiveValue(results);
                fileUploadCallback = null;
            }
        }
    }
    
    @Override
    public void onBackPressed() {
        if (webView.canGoBack()) {
            webView.goBack();
        } else {
            super.onBackPressed();
        }
    }
    
    // JavaScript Interface for Android-specific functions
    public class WebAppInterface {
        
        @JavascriptInterface
        public void showToast(String message) {
            runOnUiThread(() -> Toast.makeText(MainActivity.this, message, Toast.LENGTH_SHORT).show());
        }
        
        @JavascriptInterface
        public void setUserRole(String role) {
            userRole = role;
            if ("kurir".equals(role)) {
                // Start location service for kurir
                startLocationService();
            }
        }
        
        @JavascriptInterface
        public void getCurrentLocation(String callbackFunction) {
            if (ContextCompat.checkSelfPermission(MainActivity.this, 
                    Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED) {
                
                fusedLocationClient.getLastLocation()
                    .addOnSuccessListener(location -> {
                        if (location != null) {
                            String jsCode = String.format("%s({latitude: %f, longitude: %f, accuracy: %f})", 
                                callbackFunction, location.getLatitude(), location.getLongitude(), 
                                location.getAccuracy());
                            
                            runOnUiThread(() -> webView.evaluateJavascript(jsCode, null));
                        }
                    });
            }
        }
        
        @JavascriptInterface
        public void makePhoneCall(String phoneNumber) {
            Intent intent = new Intent(Intent.ACTION_CALL);
            intent.setData(Uri.parse("tel:" + phoneNumber));
            
            if (ContextCompat.checkSelfPermission(MainActivity.this, 
                    Manifest.permission.CALL_PHONE) == PackageManager.PERMISSION_GRANTED) {
                startActivity(intent);
            }
        }
        
        @JavascriptInterface
        public void openWhatsApp(String phoneNumber, String message) {
            try {
                Intent intent = new Intent(Intent.ACTION_VIEW);
                String url = "https://api.whatsapp.com/send?phone=" + phoneNumber + "&text=" + 
                    Uri.encode(message);
                intent.setData(Uri.parse(url));
                startActivity(intent);
            } catch (Exception e) {
                showToast("WhatsApp not installed");
            }
        }
        
        @JavascriptInterface
        public void vibrate(int duration) {
            android.os.Vibrator vibrator = (android.os.Vibrator) 
                getSystemService(android.content.Context.VIBRATOR_SERVICE);
            if (vibrator != null) {
                vibrator.vibrate(duration);
            }
        }
        
        @JavascriptInterface
        public String getDeviceInfo() {
            return android.os.Build.MODEL + " - Android " + android.os.Build.VERSION.RELEASE;
        }
    }
    
    private void startLocationService() {
        Intent serviceIntent = new Intent(this, LocationService.class);
        startService(serviceIntent);
    }
}
