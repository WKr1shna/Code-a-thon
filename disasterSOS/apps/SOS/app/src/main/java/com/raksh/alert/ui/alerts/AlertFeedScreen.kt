package com.raksh.alert.ui.alerts

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.raksh.alert.ui.components.AlertCard
import com.raksh.alert.ui.theme.Slate950
import com.raksh.alert.ui.theme.Slate900
import com.raksh.alert.ui.theme.Slate800
import com.raksh.alert.ui.theme.Slate400
import com.raksh.alert.ui.theme.Slate100
import com.raksh.alert.ui.theme.EmergencyRed
import com.raksh.alert.utils.Result

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun AlertFeedScreen(
    onAlertClick: (String) -> Unit,
    viewModel: AlertFeedViewModel = hiltViewModel()
) {
    val alertsState by viewModel.alertsState.collectAsState()
    
    var selectedType by remember { mutableStateOf<String?>(null) }
    val categories = listOf("Flood", "Earthquake", "Fire", "Cyclone")

    Column(
        modifier = Modifier
            .fillMaxSize()
            .background(Slate950)
            .padding(top = 16.dp)
    ) {
        Text(
            text = "Disaster Alert Center",
            color = Slate100,
            fontSize = 24.sp,
            fontWeight = FontWeight.Bold,
            modifier = Modifier.padding(horizontal = 20.dp)
        )
        
        Spacer(modifier = Modifier.height(12.dp))

        // Horizontal filter chips
        LazyRow(
            modifier = Modifier.fillMaxWidth(),
            contentPadding = PaddingValues(horizontal = 20.dp)
        ) {
            items(categories) { category ->
                val isSelected = selectedType == category
                FilterChip(
                    selected = isSelected,
                    onClick = {
                        selectedType = if (isSelected) null else category
                        viewModel.fetchAlerts(type = selectedType?.lowercase())
                    },
                    label = { Text(category, fontSize = 12.sp) },
                    modifier = Modifier.padding(end = 8.dp),
                    colors = FilterChipDefaults.filterChipColors(
                        containerColor = Slate900,
                        selectedContainerColor = EmergencyRed,
                        labelColor = Slate400,
                        selectedLabelColor = Color.White
                    ),
                    border = FilterChipDefaults.filterChipBorder(
                        borderColor = Slate800,
                        selectedBorderColor = EmergencyRed,
                        enabled = true,
                        selected = isSelected
                    )
                )
            }
        }

        Spacer(modifier = Modifier.height(16.dp))

        // Alert list
        Box(
            modifier = Modifier
                .weight(1f)
                .fillMaxWidth()
                .padding(horizontal = 20.dp)
        ) {
            when (val result = alertsState) {
                is Result.Loading -> {
                    CircularProgressIndicator(
                        modifier = Modifier.align(Alignment.Center),
                        color = EmergencyRed
                    )
                }
                is Result.Success -> {
                    val list = result.data ?: emptyList()
                    if (list.isEmpty()) {
                        Text(
                            text = "No active disaster feeds found.",
                            color = Slate400,
                            fontSize = 14.sp,
                            modifier = Modifier.align(Alignment.Center)
                        )
                    } else {
                        LazyColumn(
                            modifier = Modifier.fillMaxSize(),
                            contentPadding = PaddingValues(bottom = 80.dp)
                        ) {
                            items(list) { alert ->
                                AlertCard(
                                    alert = alert,
                                    onClick = { onAlertClick(alert.id) },
                                    modifier = Modifier.padding(bottom = 16.dp)
                                )
                            }
                        }
                    }
                }
                is Result.Error -> {
                    Text(
                        text = result.message ?: "Failed to fetch feed alerts.",
                        color = EmergencyRed,
                        fontSize = 14.sp,
                        fontWeight = FontWeight.Medium,
                        modifier = Modifier.align(Alignment.Center)
                    )
                }
            }
        }
    }
}