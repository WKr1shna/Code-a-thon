package com.raksh.alert.ui.home

import androidx.compose.foundation.background
import androidx.compose.foundation.clickable
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
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.Refresh
import androidx.compose.material.icons.filled.Star
import androidx.compose.material.icons.filled.Warning
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.raksh.alert.ui.components.AlertCard
import com.raksh.alert.ui.components.OfflineBanner
import com.raksh.alert.ui.theme.Slate950
import com.raksh.alert.ui.theme.Slate900
import com.raksh.alert.ui.theme.Slate800
import com.raksh.alert.ui.theme.Slate400
import com.raksh.alert.ui.theme.Slate100
import com.raksh.alert.ui.theme.EmergencyRed
import com.raksh.alert.ui.theme.Red600
import com.raksh.alert.ui.theme.Red500
import com.raksh.alert.ui.theme.Amber500
import com.raksh.alert.ui.theme.Amber600
import com.raksh.alert.ui.theme.SafeGreen
import com.raksh.alert.utils.Result

@Composable
fun HomeScreen(
    onNavigateToSos: () -> Unit,
    onNavigateToSafetyGuide: () -> Unit,
    onNavigateToVolunteer: () -> Unit,
    viewModel: HomeViewModel = hiltViewModel()
) {
    val currentUser by viewModel.currentUser.collectAsState()
    val isOffline by viewModel.isOffline.collectAsState()
    val feedAlerts by viewModel.feedAlerts.collectAsState()

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Slate950)
    ) {
        Column(
            modifier = Modifier.fillMaxSize()
        ) {
            // Header
            Row(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(horizontal = 20.dp, vertical = 16.dp),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Column {
                    Text(
                        text = "Hello, ${currentUser?.name ?: "User"}",
                        color = Slate100,
                        fontSize = 20.sp,
                        fontWeight = FontWeight.Bold
                    )
                    Text(
                        text = "Role: ${currentUser?.role?.uppercase() ?: "CITIZEN"}",
                        color = Slate400,
                        fontSize = 12.sp,
                        fontWeight = FontWeight.Medium
                    )
                }
                
                IconButton(
                    onClick = {
                        viewModel.refreshConnectionStatus()
                        viewModel.fetchRecentAlerts()
                    },
                    modifier = Modifier
                        .background(Slate900, CircleShape)
                        .border(1.dp, Slate800, CircleShape)
                ) {
                    Icon(
                        imageVector = Icons.Default.Refresh,
                        contentDescription = "Refresh",
                        tint = Slate100
                    )
                }
            }

            OfflineBanner(isOffline = isOffline)

            LazyColumn(
                modifier = Modifier
                    .fillMaxSize()
                    .padding(horizontal = 20.dp),
                verticalArrangement = Arrangement.spacedBy(16.dp)
            ) {
                // Emergency Dispatch Card
                item {
                    Card(
                        modifier = Modifier
                            .fillMaxWidth()
                            .border(1.dp, Slate800, RoundedCornerShape(20.dp))
                            .clickable { onNavigateToSos() },
                        shape = RoundedCornerShape(20.dp),
                        colors = CardDefaults.cardColors(
                            containerColor = Slate900
                        )
                    ) {
                        Row(
                            modifier = Modifier
                                .fillMaxWidth()
                                .padding(20.dp),
                            verticalAlignment = Alignment.CenterVertically
                        ) {
                            Box(
                                modifier = Modifier
                                    .size(56.dp)
                                    .background(
                                        Brush.verticalGradient(listOf(Red500, Red600)),
                                        CircleShape
                                    ),
                                contentAlignment = Alignment.Center
                            ) {
                                Icon(
                                    imageVector = Icons.Default.Warning,
                                    contentDescription = "SOS",
                                    tint = Color.White,
                                    modifier = Modifier.size(28.dp)
                                )
                            }
                            
                            Spacer(modifier = Modifier.width(16.dp))
                            
                            Column(modifier = Modifier.weight(1f)) {
                                Text(
                                    text = "EMERGENCY SOS",
                                    color = Color.White,
                                    fontSize = 18.sp,
                                    fontWeight = FontWeight.Bold
                                )
                                Text(
                                    text = "Send panic signal & location directly to NDRF",
                                    color = Slate400,
                                    fontSize = 12.sp
                                )
                            }
                        }
                    }
                }

                // Quick Actions row
                item {
                    Row(
                        modifier = Modifier.fillMaxWidth(),
                        horizontalArrangement = Arrangement.spacedBy(12.dp)
                    ) {
                        // Volunteer portal
                        Card(
                            modifier = Modifier
                                .weight(1f)
                                .height(120.dp)
                                .border(1.dp, Slate800, RoundedCornerShape(16.dp))
                                .clickable { onNavigateToVolunteer() },
                            shape = RoundedCornerShape(16.dp),
                            colors = CardDefaults.cardColors(containerColor = Slate900)
                        ) {
                            Column(
                                modifier = Modifier
                                    .fillMaxSize()
                                    .padding(16.dp),
                                verticalArrangement = Arrangement.SpaceBetween
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(36.dp)
                                        .background(SafeGreen.copy(alpha = 0.2f), CircleShape),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Star,
                                        contentDescription = "Volunteer",
                                        tint = SafeGreen,
                                        modifier = Modifier.size(20.dp)
                                    )
                                }
                                Column {
                                    Text(text = "Volunteer", color = Slate100, fontSize = 15.sp, fontWeight = FontWeight.Bold)
                                    Text(text = "Accept rescue tasks", color = Slate400, fontSize = 10.sp)
                                }
                            }
                        }

                        // Safety Guides
                        Card(
                            modifier = Modifier
                                .weight(1f)
                                .height(120.dp)
                                .border(1.dp, Slate800, RoundedCornerShape(16.dp))
                                .clickable { onNavigateToSafetyGuide() },
                            shape = RoundedCornerShape(16.dp),
                            colors = CardDefaults.cardColors(containerColor = Slate900)
                        ) {
                            Column(
                                modifier = Modifier
                                    .fillMaxSize()
                                    .padding(16.dp),
                                verticalArrangement = Arrangement.SpaceBetween
                            ) {
                                Box(
                                    modifier = Modifier
                                        .size(36.dp)
                                        .background(Amber600.copy(alpha = 0.2f), CircleShape),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Icon(
                                        imageVector = Icons.Default.Info,
                                        contentDescription = "Safety Guides",
                                        tint = Amber500,
                                        modifier = Modifier.size(20.dp)
                                    )
                                }
                                Column {
                                    Text(text = "Safety Guides", color = Slate100, fontSize = 15.sp, fontWeight = FontWeight.Bold)
                                    Text(text = "Precaution instructions", color = Slate400, fontSize = 10.sp)
                                }
                            }
                        }
                    }
                }

                // Recent Alerts Header
                item {
                    Text(
                        text = "Active Disaster Feed",
                        color = Slate100,
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        modifier = Modifier.padding(top = 8.dp)
                    )
                }

                // Alerts feed list
                when (val result = feedAlerts) {
                    is Result.Loading -> {
                        item {
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(150.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                CircularProgressIndicator(color = EmergencyRed)
                            }
                        }
                    }
                    is Result.Success -> {
                        val list = result.data ?: emptyList()
                        if (list.isEmpty()) {
                            item {
                                Box(
                                    modifier = Modifier
                                        .fillMaxWidth()
                                        .height(150.dp),
                                    contentAlignment = Alignment.Center
                                ) {
                                    Text(
                                        text = "No active emergency alerts in your region.",
                                        color = Slate400,
                                        fontSize = 14.sp
                                    )
                                }
                            }
                        } else {
                            items(list) { alert ->
                                AlertCard(
                                    alert = alert,
                                    onClick = { /* Handle Alert Detailed Map view or general navigation */ }
                                )
                            }
                        }
                    }
                    is Result.Error -> {
                        item {
                            Box(
                                modifier = Modifier
                                    .fillMaxWidth()
                                    .height(150.dp),
                                contentAlignment = Alignment.Center
                            ) {
                                Text(
                                    text = result.message ?: "An unexpected error occurred",
                                    color = EmergencyRed,
                                    fontSize = 14.sp
                                )
                            }
                        }
                    }
                }

                // Spacer at bottom
                item {
                    Spacer(modifier = Modifier.height(80.dp))
                }
            }
        }
    }
}