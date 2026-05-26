package com.raksh.alert.ui.theme

import android.app.Activity
import android.os.Build
import androidx.compose.foundation.isSystemInDarkTheme
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.darkColorScheme
import androidx.compose.material3.lightColorScheme
import androidx.compose.runtime.Composable
import androidx.compose.runtime.SideEffect
import androidx.compose.ui.graphics.toArgb
import androidx.compose.ui.platform.LocalView
import androidx.core.view.WindowCompat

private val DarkColorScheme = darkColorScheme(
    primary = EmergencyRed,
    secondary = Slate900,
    tertiary = AlertAmber,
    background = Slate950,
    surface = Slate900,
    onPrimary = SurfaceWhite,
    onSecondary = SurfaceWhite,
    onBackground = Slate100,
    onSurface = Slate100
)

private val LightColorScheme = lightColorScheme(
    primary = EmergencyRed,
    secondary = Slate900,
    tertiary = AlertAmber,
    background = Slate950, // Force dark mode everywhere as requested
    surface = Slate900,
    onPrimary = SurfaceWhite,
    onSecondary = SurfaceWhite,
    onBackground = Slate100,
    onSurface = Slate100
)

@Composable
fun RakshAlertTheme(
    darkTheme: Boolean = isSystemInDarkTheme(),
    dynamicColor: Boolean = false, // Keep it false to retain branding colors
    content: @Composable () -> Unit
) {
    val colorScheme = if (darkTheme) DarkColorScheme else LightColorScheme

    val view = LocalView.current
    if (!view.isInEditMode) {
        SideEffect {
            val window = (view.context as Activity).window
            window.statusBarColor = colorScheme.background.toArgb()
            window.navigationBarColor = colorScheme.background.toArgb()
            WindowCompat.getInsetsController(window, view).isAppearanceLightStatusBars = false
        }
    }

    MaterialTheme(
        colorScheme = colorScheme,
        typography = Typography,
        content = content
    )
}