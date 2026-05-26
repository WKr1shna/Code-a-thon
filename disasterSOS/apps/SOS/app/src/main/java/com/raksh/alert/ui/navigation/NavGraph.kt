package com.raksh.alert.ui.navigation

import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.navigation.NavHostController
import androidx.navigation.compose.NavHost
import androidx.navigation.compose.composable
import com.raksh.alert.ui.alerts.AlertFeedScreen
import com.raksh.alert.ui.auth.LoginScreen
import com.raksh.alert.ui.auth.SignupScreen
import com.raksh.alert.ui.home.HomeScreen
import com.raksh.alert.ui.map.MapScreen
import com.raksh.alert.ui.profile.ProfileScreen
import com.raksh.alert.ui.resources.ResourceScreen
import com.raksh.alert.ui.safety.SafetyGuideScreen
import com.raksh.alert.ui.sos.SosScreen
import com.raksh.alert.ui.volunteer.VolunteerScreen

@Composable
fun NavGraph(
    navController: NavHostController,
    startDestination: String,
    modifier: Modifier = Modifier
) {
    NavHost(
        navController = navController,
        startDestination = startDestination,
        modifier = modifier
    ) {
        composable(Screen.Login.route) {
            LoginScreen(
                onLoginSuccess = {
                    navController.navigate(Screen.Home.route) {
                        popUpTo(Screen.Login.route) { inclusive = true }
                    }
                },
                onNavigateToSignup = {
                    navController.navigate(Screen.Signup.route)
                }
            )
        }

        composable(Screen.Signup.route) {
            SignupScreen(
                onSignupSuccess = {
                    navController.navigate(Screen.Home.route) {
                        popUpTo(Screen.Signup.route) { inclusive = true }
                    }
                },
                onNavigateToLogin = {
                    navController.navigate(Screen.Login.route)
                }
            )
        }

        composable(Screen.Home.route) {
            HomeScreen(
                onNavigateToSos = {
                    navController.navigate(Screen.Sos.route)
                },
                onNavigateToSafetyGuide = {
                    navController.navigate("safety_guide")
                },
                onNavigateToVolunteer = {
                    navController.navigate("volunteer")
                }
            )
        }

        composable(Screen.Sos.route) {
            SosScreen(
                onBack = {
                    navController.popBackStack()
                }
            )
        }

        composable(Screen.Alerts.route) {
            AlertFeedScreen(
                onAlertClick = {
                    // Navigate to Map to inspect live alert location
                    navController.navigate(Screen.Map.route)
                }
            )
        }

        composable(Screen.Map.route) {
            MapScreen()
        }

        composable(Screen.Resources.route) {
            ResourceScreen()
        }

        composable(Screen.Profile.route) {
            ProfileScreen(
                onNavigateToLogin = {
                    navController.navigate(Screen.Login.route) {
                        popUpTo(0) { inclusive = true }
                    }
                }
            )
        }

        composable("safety_guide") {
            SafetyGuideScreen(
                onBack = {
                    navController.popBackStack()
                }
            )
        }

        composable("volunteer") {
            VolunteerScreen(
                onBack = {
                    navController.popBackStack()
                }
            )
        }
    }
}