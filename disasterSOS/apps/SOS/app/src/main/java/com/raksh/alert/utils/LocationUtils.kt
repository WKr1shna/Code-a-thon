package com.raksh.alert.utils

import android.content.Context
import android.content.pm.PackageManager
import android.location.Geocoder
import androidx.core.content.ContextCompat
import java.util.Locale

object LocationUtils {
    fun hasLocationPermission(context: Context): Boolean {
        return ContextCompat.checkSelfPermission(context, android.Manifest.permission.ACCESS_FINE_LOCATION) == PackageManager.PERMISSION_GRANTED ||
               ContextCompat.checkSelfPermission(context, android.Manifest.permission.ACCESS_COARSE_LOCATION) == PackageManager.PERMISSION_GRANTED
    }

    fun getDistrictAndState(context: Context, lat: Double, lng: Double): Pair<String, String> {
        return try {
            val geocoder = Geocoder(context, Locale.getDefault())
            val addresses = geocoder.getFromLocation(lat, lng, 1)
            if (!addresses.isNullOrEmpty()) {
                val address = addresses[0]
                val district = address.subAdminArea ?: address.locality ?: "Unknown District"
                val state = address.adminArea ?: "Unknown State"
                Pair(district, state)
            } else {
                Pair("Unknown District", "Unknown State")
            }
        } catch (e: Exception) {
            Pair("Unknown District", "Unknown State")
        }
    }
}
