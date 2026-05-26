package com.raksh.alert.ui.theme

import androidx.compose.ui.graphics.Color

// Tailwind Slate Theme colors
val Slate950 = Color(0xFF020617)
val Slate900 = Color(0xFF0F172A)
val Slate800 = Color(0xFF1E293B)
val Slate700 = Color(0xFF334155)
val Slate400 = Color(0xFF94A3B8)
val Slate100 = Color(0xFFF1F5F9)

// Primary Emergency Colors
val Red600 = Color(0xFFDC2626)
val Red500 = Color(0xFFEF4444)
val Amber600 = Color(0xFFD97706)
val Amber500 = Color(0xFFF59E0B)

// Accents
val Sky500 = Color(0xFF0EA5E9)
val Emerald500 = Color(0xFF10B981)

// Legacy compatibility
val EmergencyRed = Red600
val DeepNavy = Slate950
val AlertAmber = Amber600
val SafeGreen = Emerald500
val CriticalCrimson = Color(0xFF7F1D1D)
val BackgroundGray = Slate950
val SurfaceWhite = Color(0xFFFFFFFF)

fun severityColor(severity: String): Color = when(severity.uppercase()) {
    "NORMAL" -> SafeGreen
    "LOW" -> AlertAmber
    "MEDIUM" -> Color(0xFFFF6B35)
    "HIGH" -> EmergencyRed
    "CRITICAL" -> CriticalCrimson
    else -> Color.Gray
}
