package com.raksh.alert.ui.map

import android.Manifest
import android.annotation.SuppressLint
import android.content.pm.PackageManager
import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.core.content.ContextCompat
import androidx.hilt.navigation.compose.hiltViewModel
import com.google.android.gms.location.LocationServices
import com.google.android.gms.maps.model.CameraPosition
import com.google.android.gms.maps.model.LatLng
import com.google.maps.android.compose.GoogleMap
import com.google.maps.android.compose.MapProperties
import com.google.maps.android.compose.MapUiSettings
import com.google.maps.android.compose.Marker
import com.google.maps.android.compose.rememberCameraPositionState
import com.google.maps.android.compose.rememberMarkerState
import com.raksh.alert.data.model.Alert
import com.raksh.alert.data.model.Resource
import com.raksh.alert.ui.components.SeverityBadge
import com.raksh.alert.ui.theme.Emerald500
import com.raksh.alert.ui.theme.EmergencyRed
import com.raksh.alert.ui.theme.Slate100
import com.raksh.alert.ui.theme.Slate400
import com.raksh.alert.ui.theme.Slate800
import com.raksh.alert.ui.theme.Slate900
import com.raksh.alert.ui.theme.Slate950
import com.raksh.alert.utils.Result

@SuppressLint("MissingPermission")
@Composable
fun MapScreen(
    viewModel: MapViewModel = hiltViewModel()
) {
    val context = LocalContext.current
    val nearbyAlertsState by viewModel.nearbyAlerts.collectAsState()
    val nearbyResourcesState by viewModel.nearbyResources.collectAsState()

    var selectedAlert by remember { mutableStateOf<Alert?>(null) }
    var selectedResource by remember { mutableStateOf<Resource?>(null) }

    // Start with a default location (e.g. Bangalore)
    var currentLatLng by remember { mutableStateOf(LatLng(12.9716, 77.5946)) }
    val cameraPositionState = rememberCameraPositionState {
        position = CameraPosition.fromLatLngZoom(currentLatLng, 12f)
    }

    val hasLocationPermission = ContextCompat.checkSelfPermission(
        context,
        Manifest.permission.ACCESS_FINE_LOCATION
    ) == PackageManager.PERMISSION_GRANTED

    LaunchedEffect(Unit) {
        val fusedLocationClient = LocationServices.getFusedLocationProviderClient(context)
        if (hasLocationPermission) {
            fusedLocationClient.lastLocation.addOnSuccessListener { location ->
                if (location != null) {
                    val userLatLng = LatLng(location.latitude, location.longitude)
                    currentLatLng = userLatLng
                    cameraPositionState.position = CameraPosition.fromLatLngZoom(userLatLng, 12f)
                    viewModel.loadMapData(location.latitude, location.longitude)
                } else {
                    viewModel.loadMapData(currentLatLng.latitude, currentLatLng.longitude)
                }
            }
        } else {
            viewModel.loadMapData(currentLatLng.latitude, currentLatLng.longitude)
        }
    }

    val mapUiSettings = remember {
        MapUiSettings(
            myLocationButtonEnabled = hasLocationPermission,
            zoomControlsEnabled = false,
            mapToolbarEnabled = true
        )
    }

    val mapProperties = remember {
        MapProperties(
            isMyLocationEnabled = hasLocationPermission
        )
    }

    Box(modifier = Modifier.fillMaxSize()) {
        GoogleMap(
            modifier = Modifier.fillMaxSize(),
            cameraPositionState = cameraPositionState,
            properties = mapProperties,
            uiSettings = mapUiSettings,
            onMapClick = {
                selectedAlert = null
                selectedResource = null
            }
        ) {
            // Render active alerts markers
            if (nearbyAlertsState is Result.Success) {
                val alerts = (nearbyAlertsState as Result.Success<List<Alert>>).data
                alerts.forEach { alert ->
                    Marker(
                        state = rememberMarkerState(position = LatLng(alert.lat, alert.lng)),
                        title = alert.title,
                        snippet = alert.type,
                        onClick = {
                            selectedAlert = alert
                            selectedResource = null
                            false
                        }
                    )
                }
            }

            // Render nearby resources markers
            if (nearbyResourcesState is Result.Success) {
                val resources = (nearbyResourcesState as Result.Success<List<Resource>>).data
                resources.forEach { resource ->
                    Marker(
                        state = rememberMarkerState(position = LatLng(resource.lat, resource.lng)),
                        title = resource.name,
                        snippet = "Resource - ${resource.type}",
                        onClick = {
                            selectedResource = resource
                            selectedAlert = null
                            false
                        }
                    )
                }
            }
        }

        // Overlay Detail Cards
        Box(
            modifier = Modifier
                .align(Alignment.BottomCenter)
                .fillMaxWidth()
                .padding(16.dp)
        ) {
            if (selectedAlert != null) {
                AlertDetailCard(alert = selectedAlert!!)
            } else if (selectedResource != null) {
                ResourceDetailCard(resource = selectedResource!!)
            }
        }

        // Map status/loading indicators
        val isLoading = nearbyAlertsState is Result.Loading || nearbyResourcesState is Result.Loading
        if (isLoading) {
            Box(
                modifier = Modifier
                    .align(Alignment.TopCenter)
                    .padding(top = 16.dp)
                    .background(Slate950.copy(alpha = 0.8f), RoundedCornerShape(100.dp))
                    .padding(horizontal = 16.dp, vertical = 8.dp),
                contentAlignment = Alignment.Center
            ) {
                Column(horizontalAlignment = Alignment.CenterHorizontally) {
                    CircularProgressIndicator(
                        color = EmergencyRed,
                        modifier = Modifier.size(20.dp),
                        strokeWidth = 2.dp
                    )
                }
            }
        }
    }
}

@Composable
fun AlertDetailCard(alert: Alert) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = Slate900,
            contentColor = Slate100
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = androidx.compose.foundation.layout.Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = alert.title,
                    color = Slate100,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.weight(1f)
                )
                SeverityBadge(severity = alert.severity)
            }
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = alert.description,
                color = Slate400,
                fontSize = 13.sp,
                lineHeight = 18.sp
            )
            Spacer(modifier = Modifier.height(12.dp))
            Text(
                text = "Location: ${alert.district}, ${alert.state}",
                color = Slate400,
                fontSize = 11.sp,
                fontWeight = FontWeight.Medium
            )
        }
    }
}

@Composable
fun ResourceDetailCard(resource: Resource) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = Slate900,
            contentColor = Slate100
        ),
        elevation = CardDefaults.cardElevation(defaultElevation = 8.dp)
    ) {
        Column(modifier = Modifier.padding(16.dp)) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = androidx.compose.foundation.layout.Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = resource.name,
                    color = Slate100,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    modifier = Modifier.weight(1f)
                )
                Box(
                    modifier = Modifier
                        .background(Emerald500.copy(alpha = 0.2f), RoundedCornerShape(100.dp))
                        .padding(horizontal = 10.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = resource.type.uppercase(),
                        color = Emerald500,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = "Address: ${resource.address}",
                color = Slate400,
                fontSize = 13.sp
            )
            Spacer(modifier = Modifier.height(12.dp))
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = androidx.compose.foundation.layout.Arrangement.SpaceBetween
            ) {
                Column {
                    Text(text = "AVAILABILITY", color = Slate400, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                    Text(
                        text = "${resource.availableCapacity} / ${resource.totalCapacity} Slots",
                        color = Slate100,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
                Column(horizontalAlignment = Alignment.End) {
                    Text(text = "CONTACT", color = Slate400, fontSize = 9.sp, fontWeight = FontWeight.Bold)
                    Text(
                        text = resource.contactPhone,
                        color = Slate100,
                        fontSize = 13.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }
        }
    }
}