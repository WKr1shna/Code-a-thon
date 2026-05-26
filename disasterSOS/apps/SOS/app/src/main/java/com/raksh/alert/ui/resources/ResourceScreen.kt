package com.raksh.alert.ui.resources

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.clickable
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.PaddingValues
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.lazy.LazyColumn
import androidx.compose.foundation.lazy.LazyRow
import androidx.compose.foundation.lazy.items
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Add
import androidx.compose.material.icons.filled.Close
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.FilterChip
import androidx.compose.material3.FilterChipDefaults
import androidx.compose.material3.FloatingActionButton
import androidx.compose.material3.Icon
import androidx.compose.material3.IconButton
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Surface
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
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.compose.ui.window.Dialog
import androidx.compose.ui.window.DialogProperties
import androidx.hilt.navigation.compose.hiltViewModel
import com.raksh.alert.ui.components.ResourceCard
import com.raksh.alert.ui.theme.EmergencyRed
import com.raksh.alert.ui.theme.Slate100
import com.raksh.alert.ui.theme.Slate400
import com.raksh.alert.ui.theme.Slate700
import com.raksh.alert.ui.theme.Slate800
import com.raksh.alert.ui.theme.Slate900
import com.raksh.alert.ui.theme.Slate950
import com.raksh.alert.ui.theme.SurfaceWhite
import com.raksh.alert.utils.Result

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun ResourceScreen(
    viewModel: ResourceViewModel = hiltViewModel()
) {
    val resourcesState by viewModel.resourcesState.collectAsState()
    val modifyState by viewModel.modifyState.collectAsState()
    
    var selectedType by remember { mutableStateOf<String?>(null) }
    var showCreateDialog by remember { mutableStateOf(false) }

    val resourceTypes = listOf("Shelter", "Food", "Medical", "Water", "Rescue Gear")

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Slate950)
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .padding(horizontal = 16.dp)
        ) {
            Spacer(modifier = Modifier.height(24.dp))
            Text(
                text = "Community Resources",
                color = Slate100,
                fontSize = 24.sp,
                fontWeight = FontWeight.Bold
            )
            Spacer(modifier = Modifier.height(6.dp))
            Text(
                text = "Discover or register local safety shelters and medical hubs near you.",
                color = Slate400,
                fontSize = 13.sp
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Horizontal Filters Row
            LazyRow(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(vertical = 4.dp),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                item {
                    FilterChip(
                        selected = selectedType == null,
                        onClick = {
                            selectedType = null
                            viewModel.fetchResources(type = null)
                        },
                        label = { Text("All", fontSize = 13.sp) },
                        colors = FilterChipDefaults.filterChipColors(
                            containerColor = Slate900,
                            labelColor = Slate400,
                            selectedContainerColor = EmergencyRed,
                            selectedLabelColor = SurfaceWhite
                        ),
                        border = null
                    )
                }
                items(resourceTypes) { type ->
                    FilterChip(
                        selected = selectedType == type,
                        onClick = {
                            selectedType = type
                            viewModel.fetchResources(type = type)
                        },
                        label = { Text(type, fontSize = 13.sp) },
                        colors = FilterChipDefaults.filterChipColors(
                            containerColor = Slate900,
                            labelColor = Slate400,
                            selectedContainerColor = EmergencyRed,
                            selectedLabelColor = SurfaceWhite
                        ),
                        border = null
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // List of resources
            when (resourcesState) {
                is Result.Loading -> {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .weight(1f),
                        contentAlignment = Alignment.Center
                    ) {
                        CircularProgressIndicator(color = EmergencyRed)
                    }
                }
                is Result.Error -> {
                    Box(
                        modifier = Modifier
                            .fillMaxWidth()
                            .weight(1f),
                        contentAlignment = Alignment.Center
                    ) {
                        Text(
                            text = (resourcesState as Result.Error).message ?: "Failed to load resources",
                            color = EmergencyRed,
                            fontSize = 14.sp
                        )
                    }
                }
                is Result.Success -> {
                    val resources = (resourcesState as Result.Success).data
                    if (resources.isEmpty()) {
                        Box(
                            modifier = Modifier
                                .fillMaxWidth()
                                .weight(1f),
                            contentAlignment = Alignment.Center
                        ) {
                            Text(
                                text = "No active resources registered in this category.",
                                color = Slate400,
                                fontSize = 14.sp
                            )
                        }
                    } else {
                        LazyColumn(
                            modifier = Modifier
                                .fillMaxWidth()
                                .weight(1f),
                            contentPadding = PaddingValues(bottom = 80.dp),
                            verticalArrangement = Arrangement.spacedBy(16.dp)
                        ) {
                            items(resources) { resource ->
                                ResourceCard(resource = resource)
                            }
                        }
                    }
                }
            }
        }

        // Floating Action Button
        FloatingActionButton(
            onClick = { showCreateDialog = true },
            containerColor = EmergencyRed,
            contentColor = SurfaceWhite,
            modifier = Modifier
                .align(Alignment.BottomEnd)
                .padding(24.dp),
            shape = RoundedCornerShape(16.dp)
        ) {
            Icon(
                imageVector = Icons.Default.Add,
                contentDescription = "Register Resource"
            )
        }

        // Dialog for Creating Resource
        if (showCreateDialog) {
            CreateResourceDialog(
                isSubmitting = modifyState is Result.Loading,
                errorMessage = (modifyState as? Result.Error)?.message,
                onDismiss = {
                    showCreateDialog = false
                    viewModel.resetModifyState()
                },
                onSubmit = { name, type, address, phone, capacity ->
                    viewModel.createResource(
                        name = name,
                        type = type,
                        address = address,
                        contactPhone = phone,
                        totalCapacity = capacity,
                        lat = 12.9716, // Default Bangalore latitude
                        lng = 77.5946  // Default Bangalore longitude
                    )
                }
            )
        }

        // Automatically close dialog on successful creation
        if (modifyState is Result.Success) {
            showCreateDialog = false
            viewModel.resetModifyState()
        }
    }
}

@Composable
fun CreateResourceDialog(
    isSubmitting: Boolean,
    errorMessage: String?,
    onDismiss: () -> Unit,
    onSubmit: (String, String, String, String, Int) -> Unit
) {
    var name by remember { mutableStateOf("") }
    var type by remember { mutableStateOf("Shelter") }
    var address by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var capacityStr by remember { mutableStateOf("") }

    val resourceTypes = listOf("Shelter", "Food", "Medical", "Water", "Rescue Gear")

    Dialog(
        onDismissRequest = onDismiss,
        properties = DialogProperties(usePlatformDefaultWidth = false)
    ) {
        Surface(
            modifier = Modifier
                .fillMaxWidth()
                .padding(16.dp),
            shape = RoundedCornerShape(16.dp),
            color = Slate900,
            contentColor = Slate100
        ) {
            Column(
                modifier = Modifier
                    .fillMaxWidth()
                    .padding(20.dp)
                    .verticalScroll(rememberScrollState())
            ) {
                Row(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.SpaceBetween,
                    verticalAlignment = Alignment.CenterVertically
                ) {
                    Text(
                        text = "Register Relief Center",
                        fontSize = 18.sp,
                        fontWeight = FontWeight.Bold,
                        color = Slate100
                    )
                    IconButton(onClick = onDismiss) {
                        Icon(imageVector = Icons.Default.Close, contentDescription = "Close", tint = Slate400)
                    }
                }

                Spacer(modifier = Modifier.height(16.dp))

                // Name field
                OutlinedTextField(
                    value = name,
                    onValueChange = { name = it },
                    label = { Text("Resource Name") },
                    modifier = Modifier.fillMaxWidth(),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = EmergencyRed,
                        unfocusedBorderColor = Slate700,
                        focusedLabelColor = EmergencyRed,
                        unfocusedLabelColor = Slate400,
                        focusedTextColor = Slate100,
                        unfocusedTextColor = Slate100
                    ),
                    singleLine = true
                )

                Spacer(modifier = Modifier.height(12.dp))

                // Type Chips Selection
                Text(
                    text = "RESOURCE TYPE",
                    color = Slate400,
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 0.5.sp
                )
                Spacer(modifier = Modifier.height(6.dp))
                LazyRow(
                    modifier = Modifier.fillMaxWidth(),
                    horizontalArrangement = Arrangement.spacedBy(6.dp)
                ) {
                    items(resourceTypes) { rType ->
                        val isSelected = type == rType
                        Box(
                            modifier = Modifier
                                .background(
                                    if (isSelected) EmergencyRed else Slate800,
                                    RoundedCornerShape(8.dp)
                                )
                                .border(
                                    1.dp,
                                    if (isSelected) EmergencyRed else Slate700,
                                    RoundedCornerShape(8.dp)
                                )
                                .clickable { type = rType }
                                .padding(horizontal = 12.dp, vertical = 8.dp)
                        ) {
                            Text(
                                text = rType,
                                color = if (isSelected) SurfaceWhite else Slate400,
                                fontSize = 12.sp,
                                fontWeight = FontWeight.Bold
                            )
                        }
                    }
                }

                Spacer(modifier = Modifier.height(12.dp))

                // Address field
                OutlinedTextField(
                    value = address,
                    onValueChange = { address = it },
                    label = { Text("Address / Location") },
                    modifier = Modifier.fillMaxWidth(),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = EmergencyRed,
                        unfocusedBorderColor = Slate700,
                        focusedLabelColor = EmergencyRed,
                        unfocusedLabelColor = Slate400,
                        focusedTextColor = Slate100,
                        unfocusedTextColor = Slate100
                    ),
                    singleLine = true
                )

                Spacer(modifier = Modifier.height(12.dp))

                // Phone field
                OutlinedTextField(
                    value = phone,
                    onValueChange = { phone = it },
                    label = { Text("Contact Phone") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone),
                    modifier = Modifier.fillMaxWidth(),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = EmergencyRed,
                        unfocusedBorderColor = Slate700,
                        focusedLabelColor = EmergencyRed,
                        unfocusedLabelColor = Slate400,
                        focusedTextColor = Slate100,
                        unfocusedTextColor = Slate100
                    ),
                    singleLine = true
                )

                Spacer(modifier = Modifier.height(12.dp))

                // Capacity field
                OutlinedTextField(
                    value = capacityStr,
                    onValueChange = { capacityStr = it },
                    label = { Text("Total Capacity (e.g. 50)") },
                    keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Number),
                    modifier = Modifier.fillMaxWidth(),
                    colors = OutlinedTextFieldDefaults.colors(
                        focusedBorderColor = EmergencyRed,
                        unfocusedBorderColor = Slate700,
                        focusedLabelColor = EmergencyRed,
                        unfocusedLabelColor = Slate400,
                        focusedTextColor = Slate100,
                        unfocusedTextColor = Slate100
                    ),
                    singleLine = true
                )

                if (errorMessage != null) {
                    Spacer(modifier = Modifier.height(12.dp))
                    Text(text = errorMessage, color = EmergencyRed, fontSize = 13.sp)
                }

                Spacer(modifier = Modifier.height(24.dp))

                Button(
                    onClick = {
                        val capacity = capacityStr.toIntOrNull() ?: 0
                        if (name.isNotBlank() && address.isNotBlank() && phone.isNotBlank() && capacity > 0) {
                            onSubmit(name, type, address, phone, capacity)
                        }
                    },
                    modifier = Modifier
                        .fillMaxWidth()
                        .height(50.dp),
                    shape = RoundedCornerShape(8.dp),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = EmergencyRed,
                        contentColor = SurfaceWhite
                    ),
                    enabled = !isSubmitting
                ) {
                    if (isSubmitting) {
                        CircularProgressIndicator(color = SurfaceWhite, modifier = Modifier.size(24.dp))
                    } else {
                        Text(text = "Submit relief resource", fontSize = 15.sp, fontWeight = FontWeight.Bold)
                    }
                }
            }
        }
    }
}