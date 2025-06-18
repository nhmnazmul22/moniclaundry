package com.moniclaundry.pos;

import android.app.Notification;
import android.app.NotificationChannel;
import android.app.NotificationManager;
import android.app.Service;
import android.content.Intent;
import android.location.Location;
import android.os.Build;
import android.os.IBinder;
import android.os.Looper;

import androidx.core.app.NotificationCompat;

import com.google.android.gms.location.FusedLocationProviderClient;
import com.google.android.gms.location.LocationCallback;
import com.google.android.gms.location.LocationRequest;
import com.google.android.gms.location.LocationResult;
import com.google.android.gms.location.LocationServices;

public class LocationService extends Service {
    
    private static final String CHANNEL_ID = "LocationServiceChannel";
    private static final int NOTIFICATION_ID = 1;
    
    private FusedLocationProviderClient fusedLocationClient;
    private LocationCallback locationCallback;
    
    @Override
    public void onCreate() {
        super.onCreate();
        
        fusedLocationClient = LocationServices.getFusedLocationProviderClient(this);
        
        locationCallback = new LocationCallback() {
            @Override
            public void onLocationResult(LocationResult locationResult) {
                if (locationResult == null) {
                    return;
                }
                
                for (Location location : locationResult.getLocations()) {
                    // Send location to web app or server
                    sendLocationUpdate(location);
                }
            }
        };
        
        createNotificationChannel();
        startForeground(NOTIFICATION_ID, createNotification());
        startLocationUpdates();
    }
    
    private void startLocationUpdates() {
        LocationRequest locationRequest = LocationRequest.create();
        locationRequest.setInterval(30000); // 30 seconds
        locationRequest.setFastestInterval(15000); // 15 seconds
        locationRequest.setPriority(LocationRequest.PRIORITY_HIGH_ACCURACY);
        
        try {
            fusedLocationClient.requestLocationUpdates(locationRequest, locationCallback, 
                Looper.getMainLooper());
        } catch (SecurityException e) {
            e.printStackTrace();
        }
    }
    
    private void sendLocationUpdate(Location location) {
        // Here you would typically send the location to your server
        // For now, we'll just log it
        android.util.Log.d("LocationService", 
            "Location: " + location.getLatitude() + ", " + location.getLongitude());
    }
    
    private void createNotificationChannel() {
        if (Build.VERSION.SDK_INT >= Build.VERSION_CODES.O) {
            NotificationChannel serviceChannel = new NotificationChannel(
                CHANNEL_ID,
                "Location Service Channel",
                NotificationManager.IMPORTANCE_DEFAULT
            );
            
            NotificationManager manager = getSystemService(NotificationManager.class);
            manager.createNotificationChannel(serviceChannel);
        }
    }
    
    private Notification createNotification() {
        return new NotificationCompat.Builder(this, CHANNEL_ID)
            .setContentTitle("Monic Laundry - Kurir Mode")
            .setContentText("Tracking location for deliveries")
            .setSmallIcon(R.drawable.ic_location)
            .build();
    }
    
    @Override
    public IBinder onBind(Intent intent) {
        return null;
    }
    
    @Override
    public void onDestroy() {
        super.onDestroy();
        fusedLocationClient.removeLocationUpdates(locationCallback);
    }
}
