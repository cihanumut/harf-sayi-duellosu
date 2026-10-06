package com.harfsayiduellosu.app;

import android.content.Context;
import android.content.SharedPreferences;
import android.os.Bundle;
import androidx.core.view.WindowCompat;
import androidx.core.view.WindowInsetsCompat;
import androidx.core.view.WindowInsetsControllerCompat;
import com.getcapacitor.BridgeActivity;
import java.io.File;

public class MainActivity extends BridgeActivity {
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        // WebView (dolayısıyla Service Worker) oluşturulmadan önce, uygulama
        // güncellenmişse eski Service Worker/Cache Storage kaydını temizle.
        clearStaleServiceWorkerIfAppUpdated();
        super.onCreate(savedInstanceState);
        WindowCompat.setDecorFitsSystemWindows(getWindow(), false);
        hideSystemUI();
    }

    // Android bir APK/AAB güncellemesinde uygulama verisini silmez; bu yüzden
    // WebView içindeki eski Service Worker, yeni sürüm kurulsa bile eski
    // arayüzü önbellekten göstermeye devam edebiliyordu (bkz. sw.js'in
    // skipWaiting/clientsClaim ile kendini güncellemesi tarayıcının 24 saatlik
    // güncelleme kontrolü kısıtına takılıyordu). versionCode değiştiyse
    // sadece "Service Worker" depolama klasörünü (Cache Storage dahil) silerek
    // yeni sürümün ilk açılışta hemen görünmesini sağlıyoruz. "Local Storage"
    // klasörüne dokunulmuyor, yani coin/joker gibi oyuncu verileri korunuyor.
    private void clearStaleServiceWorkerIfAppUpdated() {
        SharedPreferences prefs = getSharedPreferences("app_build", Context.MODE_PRIVATE);
        int lastVersionCode = prefs.getInt("versionCode", -1);
        int currentVersionCode = BuildConfig.VERSION_CODE;
        if (lastVersionCode == currentVersionCode) return;

        try {
            File webviewDir = new File(getApplicationInfo().dataDir, "app_webview");
            deleteRecursive(new File(webviewDir, "Service Worker"));
            deleteRecursive(new File(webviewDir, "Default/Service Worker"));
        } catch (Exception ignored) {
            // Klasör yapısı WebView sürümüne göre değişebilir; başarısız olursa
            // normal SW öz-güncelleme akışı (main.jsx) devreye girer.
        }

        prefs.edit().putInt("versionCode", currentVersionCode).apply();
    }

    private void deleteRecursive(File file) {
        if (file == null || !file.exists()) return;
        File[] children = file.listFiles();
        if (children != null) {
            for (File child : children) deleteRecursive(child);
        }
        file.delete();
    }

    @Override
    public void onWindowFocusChanged(boolean hasFocus) {
        super.onWindowFocusChanged(hasFocus);
        if (hasFocus) {
            hideSystemUI();
        }
    }

    private void hideSystemUI() {
        WindowInsetsControllerCompat controller =
            WindowCompat.getInsetsController(getWindow(), getWindow().getDecorView());
        if (controller != null) {
            controller.hide(WindowInsetsCompat.Type.systemBars());
            controller.setSystemBarsBehavior(
                WindowInsetsControllerCompat.BEHAVIOR_SHOW_TRANSIENT_BARS_BY_SWIPE
            );
        }
    }
}
