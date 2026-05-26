package com.raksh.alert.ui.components

import androidx.compose.foundation.background
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp

@Composable
fun SeverityBadge(
    severity: String,
    modifier: Modifier = Modifier
) {
    val (backgroundColor, textColor, borderColor) = when (severity.lowercase()) {
        "critical" -> Triple(Color(0xFFFFEBEE), Color(0xFFC62828), Color(0xFFFFCDD2))
        "high" -> Triple(Color(0xFFFFF3E0), Color(0xFFE65100), Color(0xFFFFE0B2))
        "medium" -> Triple(Color(0xFFFFFDE7), Color(0xFFF57F17), Color(0xFFFFF9C4))
        else -> Triple(Color(0xFFE8F5E9), Color(0xFF2E7D32), Color(0xFFC8E6C9))
    }

    Box(
        modifier = modifier
            .background(backgroundColor, RoundedCornerShape(100.dp))
            .border(1.dp, borderColor, RoundedCornerShape(100.dp))
            .padding(horizontal = 12.dp, vertical = 4.dp)
    ) {
        Text(
            text = severity.uppercase(),
            color = textColor,
            fontSize = 10.sp,
            fontWeight = FontWeight.Bold,
            letterSpacing = 0.5.sp
        )
    }
}
