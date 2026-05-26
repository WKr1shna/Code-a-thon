package com.raksh.alert.ui.components

import android.view.HapticFeedbackConstants
import androidx.compose.animation.core.Animatable
import androidx.compose.animation.core.RepeatMode
import androidx.compose.animation.core.infiniteRepeatable
import androidx.compose.animation.core.tween
import androidx.compose.foundation.Canvas
import androidx.compose.foundation.gestures.detectTapGestures
import androidx.compose.foundation.layout.Box
import androidx.compose.foundation.layout.fillMaxSize
import androidx.compose.foundation.layout.size
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.runtime.LaunchedEffect
import androidx.compose.runtime.getValue
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.runtime.rememberCoroutineScope
import androidx.compose.runtime.setValue
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.geometry.Offset
import androidx.compose.ui.geometry.Size
import androidx.compose.ui.graphics.Brush
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.graphics.StrokeCap
import androidx.compose.ui.graphics.drawscope.Stroke
import androidx.compose.ui.input.pointer.pointerInput
import androidx.compose.ui.platform.LocalView
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import kotlinx.coroutines.Job
import kotlinx.coroutines.delay
import kotlinx.coroutines.launch
import com.raksh.alert.ui.theme.Red600
import com.raksh.alert.ui.theme.Red500
import com.raksh.alert.ui.theme.Amber600
import com.raksh.alert.ui.theme.Slate950
import com.raksh.alert.ui.theme.Slate900
import com.raksh.alert.ui.theme.Slate100

@Composable
fun SosButton(
    modifier: Modifier = Modifier,
    holdDurationMs: Long = 2000L,
    onConfirm: () -> Unit
) {
    val view = LocalView.current
    val scope = rememberCoroutineScope()
    
    // Pulse animation for high emergency visibility
    val scale = remember { Animatable(1f) }
    LaunchedEffect(Unit) {
        scale.animateTo(
            targetValue = 1.08f,
            animationSpec = infiniteRepeatable(
                animation = tween(1000),
                repeatMode = RepeatMode.Reverse
            )
        )
    }

    var progress by remember { mutableStateOf(0f) }
    var isPressing by remember { mutableStateOf(false) }
    val progressAnim = remember { Animatable(0f) }
    var holdJob by remember { mutableStateOf<Job?>(null) }

    LaunchedEffect(isPressing) {
        if (isPressing) {
            progressAnim.animateTo(
                targetValue = 1f,
                animationSpec = tween(durationMillis = holdDurationMs.toInt())
            ) {
                progress = value
            }
        } else {
            progressAnim.animateTo(
                targetValue = 0f,
                animationSpec = tween(durationMillis = 300)
            ) {
                progress = value
            }
        }
    }

    Box(
        modifier = modifier
            .size(200.dp)
            .pointerInput(Unit) {
                detectTapGestures(
                    onPress = {
                        isPressing = true
                        view.performHapticFeedback(HapticFeedbackConstants.LONG_PRESS)
                        holdJob = scope.launch {
                            delay(holdDurationMs)
                            view.performHapticFeedback(HapticFeedbackConstants.CONFIRM)
                            onConfirm()
                            isPressing = false
                        }
                        try {
                            awaitRelease()
                        } finally {
                            isPressing = false
                            holdJob?.cancel()
                        }
                    }
                )
            },
        contentAlignment = Alignment.Center
    ) {
        // Pulse outer rings
        Canvas(modifier = Modifier.fillMaxSize()) {
            val center = Offset(size.width / 2, size.height / 2)
            val baseRadius = (size.width / 2) * 0.8f
            
            // Outer glow when pressing or pulsing
            val currentScale = if (isPressing) 1.15f else scale.value
            drawCircle(
                color = Red600.copy(alpha = 0.15f),
                radius = baseRadius * currentScale,
                center = center
            )
            drawCircle(
                color = Red600.copy(alpha = 0.25f),
                radius = baseRadius * (currentScale - 0.05f),
                center = center
            )
            
            // Main button body with a premium gradient
            drawCircle(
                brush = Brush.radialGradient(
                    colors = listOf(Red500, Red600, Color(0xFF7F1D1D)),
                    center = center,
                    radius = baseRadius * 0.9f
                ),
                radius = baseRadius * 0.9f,
                center = center
            )

            // Hold progress ring around the button
            if (progress > 0f) {
                drawArc(
                    color = Color.White,
                    startAngle = -90f,
                    sweepAngle = progress * 360f,
                    useCenter = false,
                    topLeft = Offset(center.x - baseRadius * 0.95f, center.y - baseRadius * 0.95f),
                    size = Size(baseRadius * 1.9f, baseRadius * 1.9f),
                    style = Stroke(width = 6.dp.toPx(), cap = StrokeCap.Round)
                )
            }
        }

        // Action Text
        Text(
            text = if (isPressing) "HOLD..." else "TAP & HOLD\nFOR SOS",
            color = Slate100,
            fontSize = 18.sp,
            fontWeight = FontWeight.Bold,
            textAlign = androidx.compose.ui.text.style.TextAlign.Center
        )
    }
}