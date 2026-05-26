package com.raksh.alert.ui.navigation

import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Home
import androidx.compose.material.icons.filled.Info
import androidx.compose.material.icons.filled.List
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material.icons.filled.Person
import androidx.compose.material.icons.filled.Warning
import androidx.compose.ui.graphics.vector.ImageVector

sealed class Screen(val route: String, val title: String, val icon: ImageVector? = null) {
    object Login : Screen("login", "Login")
    object Signup : Screen("signup", "Signup")
    object Home : Screen("home", "Home", Icons.Default.Home)
    object Sos : Screen("sos", "Emergency SOS", Icons.Default.Warning)
    object Alerts : Screen("alerts", "Alerts", Icons.Default.List)
    object Map : Screen("map", "Live Map", Icons.Default.LocationOn)
    object Resources : Screen("resources", "Resources", Icons.Default.Info)
    object Profile : Screen("profile", "Profile", Icons.Default.Person)
}
