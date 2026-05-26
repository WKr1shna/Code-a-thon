package com.raksh.alert.ui.profile

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
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.CircleShape
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.KeyboardArrowRight
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Lock
import androidx.compose.material.icons.filled.Person
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.Switch
import androidx.compose.material3.SwitchDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.raksh.alert.ui.theme.Emerald500
import com.raksh.alert.ui.theme.EmergencyRed
import com.raksh.alert.ui.theme.Slate100
import com.raksh.alert.ui.theme.Slate400
import com.raksh.alert.ui.theme.Slate700
import com.raksh.alert.ui.theme.Slate800
import com.raksh.alert.ui.theme.Slate900
import com.raksh.alert.ui.theme.Slate950
import com.raksh.alert.ui.theme.SurfaceWhite

@Composable
fun ProfileScreen(
    onNavigateToLogin: () -> Unit,
    viewModel: ProfileViewModel = hiltViewModel()
) {
    val user by viewModel.currentUser.collectAsState()
    val isTrackingEnabled by viewModel.isTrackingEnabled.collectAsState()
    val isSmsFallbackEnabled by viewModel.isSmsFallbackEnabled.collectAsState()

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Slate950)
            .padding(16.dp)
            .verticalScroll(rememberScrollState())
    ) {
        Spacer(modifier = Modifier.height(24.dp))
        Text(
            text = "My Profile",
            color = Slate100,
            fontSize = 24.sp,
            fontWeight = FontWeight.Bold
        )
        Spacer(modifier = Modifier.height(24.dp))

        // Profile Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(16.dp),
            colors = CardDefaults.cardColors(
                containerColor = Slate900,
                contentColor = Slate100
            )
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(20.dp),
                horizontalAlignment = Alignment.CenterHorizontally
            ) {
                // Initial Circle Avatar
                val initial = user?.name?.firstOrNull()?.toString()?.uppercase() ?: "?"
                Box(
                    modifier = Modifier
                        .size(80.dp)
                        .background(Slate800, CircleShape),
                    contentAlignment = Alignment.Center
                ) {
                    Text(
                        text = initial,
                        color = EmergencyRed,
                        fontSize = 32.sp,
                        fontWeight = FontWeight.Bold
                    )
                }

                Spacer(modifier = Modifier.height(16.dp))

                Text(
                    text = user?.name ?: "RakshAlert User",
                    color = Slate100,
                    fontSize = 20.sp,
                    fontWeight = FontWeight.Bold
                )

                Spacer(modifier = Modifier.height(6.dp))

                // Role badge
                val role = user?.role ?: "Citizen"
                Box(
                    modifier = Modifier
                        .background(
                            if (role.lowercase() == "citizen") Slate800 else Emerald500.copy(alpha = 0.2f),
                            RoundedCornerShape(100.dp)
                        )
                        .padding(horizontal = 14.dp, vertical = 4.dp)
                ) {
                    Text(
                        text = role.uppercase(),
                        color = if (role.lowercase() == "citizen") Slate400 else Emerald500,
                        fontSize = 11.sp,
                        fontWeight = FontWeight.Bold,
                        letterSpacing = 0.8.sp
                    )
                }

                Spacer(modifier = Modifier.height(20.dp))

                // Details Row
                DetailRow(label = "Phone", value = user?.phone ?: "—")
                Spacer(modifier = Modifier.height(12.dp))
                DetailRow(label = "Email", value = user?.email ?: "—")
                Spacer(modifier = Modifier.height(12.dp))
                DetailRow(label = "District", value = user?.district ?: "—")
            }
        }

        Spacer(modifier = Modifier.height(24.dp))

        Text(
            text = "SAFETY SETTINGS",
            color = Slate400,
            fontSize = 12.sp,
            fontWeight = FontWeight.Bold,
            letterSpacing = 0.8.sp,
            modifier = Modifier.padding(start = 4.dp, bottom = 12.dp)
        )

        // Location toggle item
        SettingToggleItem(
            icon = Icons.Default.LocationOn,
            title = "Live Background Sharing",
            description = "Transmit real-time GPS coordinates to disaster control center during SOS events.",
            checked = isTrackingEnabled,
            onCheckedChange = { viewModel.toggleTracking(it) }
        )

        Spacer(modifier = Modifier.height(12.dp))

        // SMS fallback toggle item
        SettingToggleItem(
            icon = Icons.Default.Info,
            title = "Offline SMS Fallback",
            description = "If mobile network drops, broadcast encrypted crisis beacons over standard GSM SMS.",
            checked = isSmsFallbackEnabled,
            onCheckedChange = { viewModel.toggleSmsFallback(it) }
        )

        Spacer(modifier = Modifier.height(24.dp))

        // App Information Menu Card
        Card(
            modifier = Modifier.fillMaxWidth(),
            shape = RoundedCornerShape(12.dp),
            colors = CardDefaults.cardColors(
                containerColor = Slate900,
                contentColor = Slate100
            )
        ) {
            Column(modifier = Modifier.fillMaxWidth()) {
                SettingMenuItem(
                    icon = Icons.Default.Lock,
                    title = "Privacy Policy",
                    onClick = {}
                )
                SettingMenuItem(
                    icon = Icons.Default.Person,
                    title = "App Version",
                    onClick = {},
                    trailing = {
                        Text(
                            text = "v1.0.0 Stable",
                            color = Slate400,
                            fontSize = 13.sp,
                            fontWeight = FontWeight.Medium
                        )
                    }
                )
            }
        }

        Spacer(modifier = Modifier.height(36.dp))

        // Logout Button
        Button(
            onClick = {
                viewModel.logout {
                    onNavigateToLogin()
                }
            },
            modifier = Modifier
                .fillMaxWidth()
                .height(52.dp),
            shape = RoundedCornerShape(8.dp),
            colors = ButtonDefaults.buttonColors(
                containerColor = Color.Transparent,
                contentColor = EmergencyRed
            ),
            border = androidx.compose.foundation.BorderStroke(1.dp, EmergencyRed.copy(alpha = 0.5f))
        ) {
            Text(
                text = "Logout Account",
                fontSize = 16.sp,
                fontWeight = FontWeight.Bold
            )
        }
        Spacer(modifier = Modifier.height(40.dp))
    }
}

@Composable
fun DetailRow(label: String, value: String) {
    Row(
        modifier = Modifier.fillMaxWidth(),
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Text(
            text = label,
            color = Slate400,
            fontSize = 14.sp,
            fontWeight = FontWeight.Medium
        )
        Text(
            text = value,
            color = Slate100,
            fontSize = 14.sp,
            fontWeight = FontWeight.Bold
        )
    }
}

@Composable
fun SettingToggleItem(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    title: String,
    description: String,
    checked: Boolean,
    onCheckedChange: (Boolean) -> Unit
) {
    Card(
        modifier = Modifier.fillMaxWidth(),
        shape = RoundedCornerShape(12.dp),
        colors = CardDefaults.cardColors(
            containerColor = Slate900,
            contentColor = Slate100
        )
    ) {
        Row(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            verticalAlignment = Alignment.CenterVertically
        ) {
            Box(
                modifier = Modifier
                    .size(40.dp)
                    .background(Slate800, CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = EmergencyRed,
                    modifier = Modifier.size(20.dp)
                )
            }
            Spacer(modifier = Modifier.width(16.dp))
            Column(
                modifier = Modifier.weight(1f)
            ) {
                Text(
                    text = title,
                    color = Slate100,
                    fontSize = 15.sp,
                    fontWeight = FontWeight.Bold
                )
                Spacer(modifier = Modifier.height(2.dp))
                Text(
                    text = description,
                    color = Slate400,
                    fontSize = 11.sp,
                    lineHeight = 16.sp
                )
            }
            Spacer(modifier = Modifier.width(12.dp))
            Switch(
                checked = checked,
                onCheckedChange = onCheckedChange,
                colors = SwitchDefaults.colors(
                    checkedThumbColor = SurfaceWhite,
                    checkedTrackColor = EmergencyRed,
                    uncheckedThumbColor = Slate400,
                    uncheckedTrackColor = Slate800
                )
            )
        }
    }
}

@Composable
fun SettingMenuItem(
    icon: androidx.compose.ui.graphics.vector.ImageVector,
    title: String,
    onClick: () -> Unit,
    trailing: @Composable (() -> Unit)? = null
) {
    Row(
        modifier = Modifier
            .fillMaxWidth()
            .clickable { onClick() }
            .padding(horizontal = 16.dp, vertical = 16.dp),
        verticalAlignment = Alignment.CenterVertically,
        horizontalArrangement = Arrangement.SpaceBetween
    ) {
        Row(verticalAlignment = Alignment.CenterVertically) {
            Box(
                modifier = Modifier
                    .size(32.dp)
                    .background(Slate800, CircleShape),
                contentAlignment = Alignment.Center
            ) {
                Icon(
                    imageVector = icon,
                    contentDescription = null,
                    tint = Slate400,
                    modifier = Modifier.size(16.dp)
                )
            }
            Spacer(modifier = Modifier.width(16.dp))
            Text(
                text = title,
                color = Slate100,
                fontSize = 15.sp,
                fontWeight = FontWeight.Medium
            )
        }
        if (trailing != null) {
            trailing()
        } else {
            Icon(
                imageVector = Icons.Default.KeyboardArrowRight,
                contentDescription = null,
                tint = Slate700
            )
        }
    }
}