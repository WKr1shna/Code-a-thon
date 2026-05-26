package com.raksh.alert.ui.auth

import androidx.compose.foundation.background
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.size
import androidx.compose.foundation.rememberScrollState
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.foundation.text.KeyboardOptions
import androidx.compose.foundation.verticalScroll
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.CircularProgressIndicator
import androidx.compose.material3.DropdownMenuItem
import androidx.compose.material3.ExperimentalMaterial3Api
import androidx.compose.material3.ExposedDropdownMenuBox
import androidx.compose.material3.ExposedDropdownMenuDefaults
import androidx.compose.material3.OutlinedTextField
import androidx.compose.material3.OutlinedTextFieldDefaults
import androidx.compose.material3.Text
import androidx.compose.material3.TextButton
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.collectAsState
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.text.input.KeyboardType
import androidx.compose.ui.text.input.PasswordVisualTransformation
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import androidx.hilt.navigation.compose.hiltViewModel
import com.raksh.alert.utils.Result
import com.raksh.alert.ui.theme.Slate950
import com.raksh.alert.ui.theme.Slate900
import com.raksh.alert.ui.theme.Slate800
import com.raksh.alert.ui.theme.Slate400
import com.raksh.alert.ui.theme.Slate100
import com.raksh.alert.ui.theme.EmergencyRed
import com.raksh.alert.ui.theme.Amber600

@OptIn(ExperimentalMaterial3Api::class)
@Composable
fun SignupScreen(
    onSignupSuccess: () -> Unit,
    onNavigateToLogin: () -> Unit,
    viewModel: SignupViewModel = hiltViewModel()
) {
    var name by remember { mutableStateOf("") }
    var email by remember { mutableStateOf("") }
    var phone by remember { mutableStateOf("") }
    var password by remember { mutableStateOf("") }
    var district by remember { mutableStateOf("") }
    
    // Role selection
    val roles = listOf("Citizen", "Volunteer")
    var roleExpanded by remember { mutableStateOf(false) }
    var selectedRole by remember { mutableStateOf(roles[0]) }

    // Language selection
    val languages = listOf("English", "Hindi")
    var langExpanded by remember { mutableStateOf(false) }
    var selectedLanguage by remember { mutableStateOf(languages[0]) }

    val signupState by viewModel.signupState.collectAsState()

    LaunchedEffect(signupState) {
        if (signupState is Result.Success) {
            onSignupSuccess()
            viewModel.resetState()
        }
    }

    Box(
        modifier = Modifier
            .fillMaxSize()
            .background(Slate950),
        contentAlignment = Alignment.TopCenter
    ) {
        Column(
            modifier = Modifier
                .fillMaxSize()
                .verticalScroll(rememberScrollState())
                .padding(28.dp),
            horizontalAlignment = Alignment.CenterHorizontally,
            verticalArrangement = Arrangement.Top
        ) {
            Spacer(modifier = Modifier.height(24.dp))

            Box(
                modifier = Modifier
                    .size(64.dp)
                    .background(
                        Brush.verticalGradient(listOf(EmergencyRed, Amber600)),
                        RoundedCornerShape(20.dp)
                    ),
                contentAlignment = Alignment.Center
            ) {
                Text(
                    text = "R",
                    color = Color.White,
                    fontSize = 32.sp,
                    fontWeight = FontWeight.Black
                )
            }

            Spacer(modifier = Modifier.height(16.dp))

            Text(
                text = "Create Account",
                color = Slate100,
                fontSize = 28.sp,
                fontWeight = FontWeight.Bold
            )

            Spacer(modifier = Modifier.height(6.dp))

            Text(
                text = "Join RakshAlert emergency rescue network",
                color = Slate400,
                fontSize = 14.sp
            )

            Spacer(modifier = Modifier.height(32.dp))

            OutlinedTextField(
                value = name,
                onValueChange = { name = it },
                label = { Text("Full Name") },
                singleLine = true,
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
                shape = RoundedCornerShape(12.dp)
            )

            Spacer(modifier = Modifier.height(16.dp))

            OutlinedTextField(
                value = email,
                onValueChange = { email = it },
                label = { Text("Email Address") },
                singleLine = true,
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
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Email)
            )

            Spacer(modifier = Modifier.height(16.dp))

            OutlinedTextField(
                value = phone,
                onValueChange = { phone = it },
                label = { Text("Phone Number") },
                singleLine = true,
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
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Phone)
            )

            Spacer(modifier = Modifier.height(16.dp))

            OutlinedTextField(
                value = password,
                onValueChange = { password = it },
                label = { Text("Password") },
                singleLine = true,
                visualTransformation = PasswordVisualTransformation(),
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
                keyboardOptions = KeyboardOptions(keyboardType = KeyboardType.Password)
            )

            Spacer(modifier = Modifier.height(16.dp))

            OutlinedTextField(
                value = district,
                onValueChange = { district = it },
                label = { Text("District") },
                singleLine = true,
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
                shape = RoundedCornerShape(12.dp)
            )

            Spacer(modifier = Modifier.height(16.dp))

            // Role selection exposed dropdown
            ExposedDropdownMenuBox(
                expanded = roleExpanded,
                onExpandedChange = { roleExpanded = !roleExpanded },
                modifier = Modifier.fillMaxWidth()
            ) {
                OutlinedTextField(
                    value = selectedRole,
                    onValueChange = {},
                    readOnly = true,
                    label = { Text("Account Role") },
                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = roleExpanded) },
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
                    expanded = roleExpanded,
                    onDismissRequest = { roleExpanded = false },
                    modifier = Modifier.background(Slate900)
                ) {
                    roles.forEach { role ->
                        DropdownMenuItem(
                            text = { Text(role, color = Slate100) },
                            onClick = {
                                selectedRole = role
                                roleExpanded = false
                            }
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            // Language exposed dropdown
            ExposedDropdownMenuBox(
                expanded = langExpanded,
                onExpandedChange = { langExpanded = !langExpanded },
                modifier = Modifier.fillMaxWidth()
            ) {
                OutlinedTextField(
                    value = selectedLanguage,
                    onValueChange = {},
                    readOnly = true,
                    label = { Text("Preferred Language") },
                    trailingIcon = { ExposedDropdownMenuDefaults.TrailingIcon(expanded = langExpanded) },
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
                    expanded = langExpanded,
                    onDismissRequest = { langExpanded = false },
                    modifier = Modifier.background(Slate900)
                ) {
                    languages.forEach { lang ->
                        DropdownMenuItem(
                            text = { Text(lang, color = Slate100) },
                            onClick = {
                                selectedLanguage = lang
                                langExpanded = false
                            }
                        )
                    }
                }
            }

            Spacer(modifier = Modifier.height(28.dp))

            if (signupState is Result.Error) {
                Text(
                    text = (signupState as Result.Error).message ?: "Sign up failed",
                    color = EmergencyRed,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Medium,
                    modifier = Modifier.padding(bottom = 16.dp)
                )
            }

            Button(
                onClick = {
                    viewModel.signup(
                        name = name,
                        email = email,
                        phone = phone,
                        password = password,
                        role = selectedRole,
                        district = district,
                        language = selectedLanguage
                    )
                },
                enabled = signupState !is Result.Loading,
                modifier = Modifier
                    .fillMaxWidth()
                    .height(52.dp),
                colors = ButtonDefaults.buttonColors(
                    containerColor = EmergencyRed,
                    disabledContainerColor = EmergencyRed.copy(alpha = 0.5f)
                ),
                shape = RoundedCornerShape(12.dp)
            ) {
                if (signupState is Result.Loading) {
                    CircularProgressIndicator(
                        modifier = Modifier.size(24.dp),
                        color = Color.White,
                        strokeWidth = 2.5.dp
                    )
                } else {
                    Text(
                        text = "Sign Up",
                        color = Color.White,
                        fontSize = 16.sp,
                        fontWeight = FontWeight.Bold
                    )
                }
            }

            Spacer(modifier = Modifier.height(16.dp))

            TextButton(
                onClick = onNavigateToLogin,
                enabled = signupState !is Result.Loading
            ) {
                Text(
                    text = "Already have an account? Sign In",
                    color = Slate400,
                    fontSize = 14.sp,
                    fontWeight = FontWeight.Medium
                )
            }

            Spacer(modifier = Modifier.height(32.dp))
        }
    }
}