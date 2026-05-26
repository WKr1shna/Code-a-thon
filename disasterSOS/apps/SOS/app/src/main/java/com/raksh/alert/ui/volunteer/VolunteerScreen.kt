package com.raksh.alert.ui.volunteer

import android.Manifest
import android.annotation.SuppressLint
import android.content.pm.PackageManager
import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.ArrowBack
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Checkbox
import androidx.compose.material3.CheckboxDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateListOf
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
import com.raksh.alert.data.remote.api.VolunteerTaskDto
import com.raksh.alert.ui.components.SeverityBadge
import com.raksh.alert.ui.theme.Emerald500
import com.raksh.alert.ui.theme.EmergencyRed
import com.raksh.alert.ui.theme.Slate100
import com.raksh.alert.ui.theme.Slate400
import com.raksh.alert.ui.theme.Slate700
import com.raksh.alert.ui.theme.Slate800
import com.raksh.alert.ui.theme.Slate900
import com.raksh.alert.ui.theme.Slate950
import com.raksh.alert.ui.theme.SurfaceWhite
import com.raksh.alert.utils.Result

@SuppressLint("MissingPermission")
@Composable
fun VolunteerScreen(
    onBack: () -> Unit,
    viewModel: VolunteerViewModel = hiltViewModel()
) {
    val context = LocalContext.current
    val registrationState by viewModel.registrationState.collectAsState()
    val tasksState by viewModel.tasksState.collectAsState()

    val availableSkills = listOf(
        "First Aid & Medical Support",
        "Search & Rescue Operations",
        "Disaster Relief Supply Distribution",
        "Emergency Shelter Coordination",
        "Community Evacuation Assistance",
        "Emergency Transport & Logistics"
    )

    val selectedSkills = remember { mutableStateListOf<String>() }
    var locationFetched by remember { mutableStateOf<Pair<Double, Double>?>(null) }

    // On start, attempt to fetch location and load tasks
    LaunchedEffect(Unit) {
        viewModel.loadTasks()

        val fusedLocationClient = LocationServices.getFusedLocationProviderClient(context)
        if (ContextCompat.checkSelfPermission(
                context,
                Manifest.permission.ACCESS_FINE_LOCATION
            ) == PackageManager.PERMISSION_GRANTED
        ) {
            fusedLocationClient.lastLocation.addOnSuccessListener { loc ->
                if (loc != null) {
                    locationFetched = Pair(loc.latitude, loc.longitude)
                }
            }
        }
    }

    LaunchedEffect(registrationState) {
        if (registrationState is Result.Success) {
            viewModel.loadTasks()
            viewModel.resetRegistrationState()
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Slate950)
            .padding(top = 16.dp)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 16.dp)
        ) {
            // Header Row
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 8.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                IconButton(onClick = onBack) {
                    Icon(
                        imageVector = Icons.Default.ArrowBack,
                        contentDescription = "Back",
                        tint = Slate100
                    )
                }
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = "Volunteer Center",
                    color = Slate100,
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            when (tasksState) {
                is Result.Loading -> {
                    Box(
                        modifier = Modifier.fillMaxSize(),
                        contentAlignment = Alignment.Center
                    ) {
                        CircularProgressIndicator(color = EmergencyRed)
                    }
                }
                is Result.Error -> {
                    // Not registered or server error: show registration form
                    VolunteerRegistrationView(
                        skills = availableSkills,
                        selectedSkills = selectedSkills,
                        isSubmitting = registrationState is Result.Loading,
                        errorMessage = (registrationState as? Result.Error)?.message,
                        onRegister = {
                            val lat = locationFetched?.first ?: 12.9716
                            val lng = locationFetched?.second ?: 77.5946
                            viewModel.registerAsVolunteer(selectedSkills, lat, lng)
                        }
                    )
                }
                is Result.Success -> {
                    val tasks = (tasksState as Result.Success<List<VolunteerTaskDto>>).data
                    if (tasks.isEmpty()) {
                        EmptyTasksView(onRefresh = { viewModel.loadTasks() })
                    } else {
                        Column(
                            modifier = Modifier
                                .fillMaxSize()
                                .verticalScroll(rememberScrollState())
                        ) {
                            Text(
                                text = "Your Active Assignments",
                                color = Slate400,
                                fontSize = 14.sp,
                                fontWeight = FontWeight.SemiBold,
                                modifier = Modifier.padding(bottom = 12.dp)
                            )
                            tasks.forEach { task ->
                                VolunteerTaskCard(
                                    task = task,
                                    onUpdateStatus = { newStatus ->
                                        viewModel.updateTaskStatus(task._id, newStatus)
                                    }
                                )
                                Spacer(modifier = Modifier.height(12.dp))
                            }
                            Spacer(modifier = Modifier.height(24.dp))
                        }
                    }
                }
            }
        }
    }
}

@Composable
fun VolunteerRegistrationView(
    skills: List<String>,
    selectedSkills: List<String>,
    isSubmitting: Boolean,
    errorMessage: String?,
    onRegister: () -> Unit
) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .verticalScroll(rememberScrollState())
    ) {
        Text(
            text = "Join as a Safety Volunteer",
            color = Slate100,
            fontSize = 22.sp,
            fontWeight = FontWeight.Bold
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = "As a registered volunteer, you can receive direct assistance requests from the emergency command center to support citizens in crisis near you.",
            color = Slate400,
            fontSize = 14.sp,
            lineHeight = 20.sp
        )

        Spacer(modifier = Modifier.height(24.dp))

        Text(
            text = "SELECT YOUR SKILLS",
            color = Slate400,
            fontSize = 12.sp,
            fontWeight = FontWeight.Bold,
            letterSpacing = 0.8.sp
        )
        Spacer(modifier = Modifier.height(12.dp))

        skills.forEach { skill ->
            val isChecked = selectedSkills.contains(skill)
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 4.dp)
                    .background(Slate900, RoundedCornerShape(8.dp))
                    .clickable {
                        if (isChecked) {
                            (selectedSkills as MutableList).remove(skill)
                        } else {
                            (selectedSkills as MutableList).add(skill)
                        }
                    }
                    .padding(horizontal = 12.dp, vertical = 12.dp),
                verticalAlignment = Alignment.CenterVertically
            ) {
                Checkbox(
                    checked = isChecked,
                    onCheckedChange = { checked ->
                        if (checked == true) {
                            (selectedSkills as MutableList).add(skill)
                        } else {
                            (selectedSkills as MutableList).remove(skill)
                        }
                    },
                    colors = CheckboxDefaults.colors(
                        checkedColor = EmergencyRed,
                        uncheckedColor = Slate700
                    )
                )
                Spacer(modifier = Modifier.width(8.dp))
                Text(
                    text = skill,
                    color = Slate100,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Medium
                )
            }
        }

        if (errorMessage != null) {
            Spacer(modifier = Modifier.height(16.dp))
            Text(
                text = errorMessage,
                color = EmergencyRed,
                fontSize = 14.sp,
                fontWeight = FontWeight.SemiBold
            )
        }

        Spacer(modifier = Modifier.height(32.dp))

        Button(
            onClick = onRegister,
            modifier = Modifier
                .fillMaxWidth()
                .height(52.dp),
            shape = RoundedCornerShape(8.dp),
            colors = ButtonDefaults.buttonColors(
                containerColor = EmergencyRed,
                contentColor = SurfaceWhite
            ),
            enabled = !isSubmitting
        ) {
            if (isSubmitting) {
                CircularProgressIndicator(
                    color = SurfaceWhite,
                    modifier = Modifier.width(24.dp)
                )
            } else {
                Text(
                    text = "Register as Volunteer",
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold
                )
            }
        }
        Spacer(modifier = Modifier.height(40.dp))
    }
}

@Composable
fun EmptyTasksView(onRefresh: () -> Unit) {
    Column(
        modifier = Modifier
            .fillMaxSize()
            .padding(24.dp),
        horizontalAlignment = Alignment.CenterHorizontally,
        verticalArrangement = Arrangement.Center
    ) {
        Text(
            text = "No Active Assignments",
            color = Slate100,
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold
        )
        Spacer(modifier = Modifier.height(8.dp))
        Text(
            text = "You are registered as a safety volunteer! When the Command Center creates a task for your skills nearby, it will appear here.",
            color = Slate400,
            fontSize = 14.sp,
            textAlign = androidx.compose.ui.text.style.TextAlign.Center,
            lineHeight = 20.sp
        )
        Spacer(modifier = Modifier.height(24.dp))
        Button(
            onClick = onRefresh,
            colors = ButtonDefaults.buttonColors(containerColor = Slate800),
            shape = RoundedCornerShape(8.dp)
        ) {
            Text(text = "Check for Tasks", color = Slate100)
        }
    }
}

@Composable
fun VolunteerTaskCard(
    task: VolunteerTaskDto,
    onUpdateStatus: (String) -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(
            containerColor = Slate900,
            contentColor = Slate100
        )
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = task.title,
                    color = Slate100,
                    fontSize = 16.sp,
                    fontWeight = FontWeight.Bold
                )
                SeverityBadge(severity = task.severity)
            }
            Spacer(modifier = Modifier.height(8.dp))
            Text(
                text = task.description,
                color = Slate400,
                fontSize = 14.sp,
                lineHeight = 20.sp
            )

            Spacer(modifier = Modifier.height(16.dp))

            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                // Status indicator
                Column {
                    Text(
                        text = "STATUS",
                        color = Slate400,
                        fontSize = 10.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 0.5.sp
                    )
                    Text(
                        text = task.status.uppercase(),
                        color = when (task.status.lowercase()) {
                            "completed" -> Emerald500
                            "in progress" -> Color(0xFF0EA5E9)
                            else -> Color(0xFFF59E0B)
                        },
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Bold
                    )
                }

                // Action Buttons
                when (task.status.lowercase()) {
                    "open", "assigned", "pending" -> {
                        Button(
                            onClick = { onUpdateStatus("Accepted") },
                            colors = ButtonDefaults.buttonColors(containerColor = EmergencyRed),
                            shape = RoundedCornerShape(6.dp)
                        ) {
                            Text(text = "Accept", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                    "accepted" -> {
                        Button(
                            onClick = { onUpdateStatus("In Progress") },
                            colors = ButtonDefaults.buttonColors(containerColor = Color(0xFF0EA5E9)),
                            shape = RoundedCornerShape(6.dp)
                        ) {
                            Text(text = "Start", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                    "in progress" -> {
                        Button(
                            onClick = { onUpdateStatus("Completed") },
                            colors = ButtonDefaults.buttonColors(containerColor = Emerald500),
                            shape = RoundedCornerShape(6.dp)
                        ) {
                            Text(text = "Complete", fontSize = 12.sp, fontWeight = FontWeight.Bold)
                        }
                    }
                }
            }
        }
    }
}