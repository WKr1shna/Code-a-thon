package com.raksh.alert.ui.sos

import android.annotation.SuppressLint
import android.location.Location
import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
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
import androidx.compose.ui.text.style.TextAlign
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.google.android.gms.location.LocationServices
import com.raksh.alert.ui.components.SosButton
import com.raksh.alert.ui.theme.Slate950
import com.raksh.alert.ui.theme.Slate900
import com.raksh.alert.ui.theme.Slate800
import com.raksh.alert.ui.theme.Slate400
import com.raksh.alert.ui.theme.Slate100
import com.raksh.alert.ui.theme.EmergencyRed
import com.raksh.alert.ui.theme.SafeGreen
import com.raksh.alert.utils.Result

@OptIn(ExperimentalMaterial3Api::class)
@SuppressLint("MissingPermission")
@Composable
fun SosScreen(
    onBack: () -> Unit,
    viewModel: SosViewModel = hiltViewModel()
) {
    val context = LocalContext.current
    val fusedLocationClient = remember { LocationServices.getFusedLocationProviderClient(context) }
    var location by remember { mutableStateOf<Location?>(null) }
    
    // Acquire location coordinates on screen load
    LaunchedEffect(Unit) {
        try {
            fusedLocationClient.lastLocation.addOnSuccessListener { loc ->
                if (loc != null) {
                    location = loc
                }
            }
        } catch (e: SecurityException) {
            // Permission missing
        }
    }

    val sosResult by viewModel.sosResult.collectAsState()

    val emergencyTypes = listOf("Flood", "Earthquake", "Fire", "Cyclone", "Medical", "Accident")
    var typeExpanded by remember { mutableStateOf(false) }
    var selectedType by remember { mutableStateOf(emergencyTypes[0]) }

    val severities = listOf("Medium", "High", "Critical")
    var severityExpanded by remember { mutableStateOf(false) }
    var selectedSeverity by remember { mutableStateOf(severities[1]) } // default High

    var note by remember { mutableStateOf("") }

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Slate950)
            .verticalScroll(rememberScrollState())
            .padding(20.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Top
    ) {
        // Custom App Bar
        Row(
            modifier = Modifier.fillMaxWidth(),
            verticalAlignment = Alignment.CenterVertically
        ) {
            IconButton(
                onClick = onBack,
                modifier = Modifier
                    .background(Slate900, CircleShape)
                    .border(1.dp, Slate800, CircleShape)
            ) {
                Icon(
                    imageVector = Icons.Default.ArrowBack,
                    contentDescription = "Back",
                    tint = Slate100
                )
            }
            Spacer(modifier = Modifier.width(16.dp))
            Text(
                text = "EMERGENCY PANIC ROOM",
                color = Slate100,
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold
            )
        }

        Spacer(modifier = Modifier.height(28.dp))

        // Action Header
        Text(
            text = "Initiate Disaster Dispatch",
            color = Slate100,
            fontSize = 24.sp,
            fontWeight = FontWeight.ExtraBold,
            textAlign = TextAlign.Center
        )

        Spacer(modifier = Modifier.height(6.dp))

        Text(
            text = "Holding the SOS button sends your live coordinates to NDRF rescue servers immediately.",
            color = Slate400,
            fontSize = 13.sp,
            textAlign = TextAlign.Center,
            lineHeight = 18.sp
        )

        Spacer(modifier = Modifier.height(32.dp))

        // SOS button in the center
        SosButton(
            holdDurationMs = 2000L,
            onConfirm = {
                viewModel.sendEmergencySos(
                    type = selectedType.lowercase(),
                    severity = selectedSeverity.uppercase(),
                    lat = location?.latitude ?: 28.6139, // default Delhi coords
                    lng = location?.longitude ?: 77.2090,
                    district = "New Delhi",
                    state = "Delhi",
                    description = if (note.isNotBlank()) note else "EMERGENCY: SOS dispatch from Citizen app."
                )
            }
        )

        Spacer(modifier = Modifier.height(32.dp))

        // Location indicator
        Box(
            modifier = Modifier
                .fillMaxWidth()
                .background(Slate900, RoundedCornerShape(12.dp))
                .border(1.dp, Slate800, RoundedCornerShape(12.dp))
                .padding(14.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                verticalAlignment = Alignment.CenterVertically,
                horizontalArrangement = Arrangement.Center
            ) {
                Box(
                    modifier = Modifier
                        .size(8.dp)
                        .background(if (location != null) SafeGreen else Color.Gray, CircleShape)
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = if (location != null) {
                        "GPS Fixed: ${String.format("%.4f", location!!.latitude)}, ${String.format("%.4f", location!!.longitude)}"
                    } else {
                        "Acquiring high-accuracy GPS coordinates..."
                    },
                    color = Slate100,
                    fontSize = 13.sp,
                    fontWeight = FontWeight.Medium
                )
            }
        }

        Spacer(modifier = Modifier.height(20.dp))

        // Configuration exposed dropdowns
        ExposedDropdownMenuBox(
            expanded = typeExpanded,
            onExpandedChange = { typeExpanded = !typeExpanded },
            modifier = Modifier.fillMaxWidth()
        ) {
            OutlinedTextField(
                value = selectedType,
                onValueChange = {},
                readOnly = true,
                label = { Text("Emergency Category") },
                trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = typeExpanded) },
                modifier = Modifier.menuAnchor().fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = EmergencyRed,
                    unfocusedBorderColor = Slate800,
                    focusedLabelColor = EmergencyRed,
                    unfocusedLabelColor = Slate400,
                    focusedTextColor = Slate100,
                    unfocusedTextColor = Slate100,
                    focusedContainerColor = Slate900,
                    unfocusedContainerColor = Slate900
                ),
                shape = RoundedCornerShape(12.dp)
            )
            ExposedDropdownMenu(
                expanded = typeExpanded,
                onDismissRequest = { typeExpanded = false },
                modifier = Modifier.background(Slate900)
            ) {
                emergencyTypes.forEach { type ->
                    DropdownMenuItem(
                        text = { Text(type, color = Slate100) },
                        onClick = {
                            selectedType = type
                            typeExpanded = false
                        }
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        ExposedDropdownMenuBox(
            expanded = severityExpanded,
            onExpandedChange = { severityExpanded = !severityExpanded },
            modifier = Modifier.fillMaxWidth()
        ) {
            OutlinedTextField(
                value = selectedSeverity,
                onValueChange = {},
                readOnly = true,
                label = { Text("Severity Level") },
                trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = severityExpanded) },
                modifier = Modifier.menuAnchor().fillMaxWidth(),
                colors = OutlinedTextFieldDefaults.colors(
                    focusedBorderColor = EmergencyRed,
                    unfocusedBorderColor = Slate800,
                    focusedLabelColor = EmergencyRed,
                    unfocusedLabelColor = Slate400,
                    focusedTextColor = Slate100,
                    unfocusedTextColor = Slate100,
                    focusedContainerColor = Slate900,
                    unfocusedContainerColor = Slate900
                ),
                shape = RoundedCornerShape(12.dp)
            )
            ExposedDropdownMenu(
                expanded = severityExpanded,
                onDismissRequest = { severityExpanded = false },
                modifier = Modifier.background(Slate900)
            ) {
                severities.forEach { severity ->
                    DropdownMenuItem(
                        text = { Text(severity, color = Slate100) },
                        onClick = {
                            selectedSeverity = severity
                            severityExpanded = false
                        }
                    )
                }
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        OutlinedTextField(
            value = note,
            onValueChange = { note = it },
            label = { Text("Situation Description (Optional)") },
            placeholder = { Text("Provide details e.g. stuck on roof, water level rising...") },
            modifier = Modifier.fillMaxWidth(),
            colors = OutlinedTextFieldDefaults.colors(
                focusedBorderColor = EmergencyRed,
                unfocusedBorderColor = Slate800,
                focusedLabelColor = EmergencyRed,
                unfocusedLabelColor = Slate400,
                focusedTextColor = Slate100,
                unfocusedTextColor = Slate100,
                focusedContainerColor = Slate900,
                unfocusedContainerColor = Slate900
            ),
            shape = RoundedCornerShape(12.dp),
            maxLines = 3
        )

        Spacer(modifier = Modifier.height(24.dp))

        // State displays
        when (val result = sosResult) {
            is Result.Loading -> {
                CircularProgressIndicator(color = EmergencyRed)
            }
            is Result.Success -> {
                Text(
                    text = result.data ?: "Emergency alert dispatched successfully!",
                    color = SafeGreen,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold,
                    textAlign = TextAlign.Center
                )
            }
            is Result.Error -> {
                Text(
                    text = result.message ?: "Failed to dispatch SOS alert",
                    color = EmergencyRed,
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold,
                    textAlign = TextAlign.Center
                )
            }
            else -> {}
        }

        Spacer(modifier = Modifier.height(40.dp))
    }
}