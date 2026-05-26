package com.raksh.alert.ui.components

import android.content.Intent
import android.net.Uri
import androidx.compose.foundation.border
import androidx.compose.foundation.layout.Arrangement
import androidx.compose.foundation.layout.Column
import androidx.compose.foundation.layout.Row
import androidx.compose.foundation.layout.Spacer
import androidx.compose.foundation.layout.fillMaxWidth
import androidx.compose.foundation.layout.height
import androidx.compose.foundation.layout.padding
import androidx.compose.foundation.layout.width
import androidx.compose.foundation.shape.RoundedCornerShape
import androidx.compose.material.icons.Icons
import androidx.compose.material.icons.filled.Call
import androidx.compose.material.icons.filled.LocationOn
import androidx.compose.material3.Button
import androidx.compose.material3.ButtonDefaults
import androidx.compose.material3.Card
import androidx.compose.material3.CardDefaults
import androidx.compose.material3.Icon
import androidx.compose.material3.LinearProgressIndicator
import androidx.compose.material3.Text
import androidx.compose.runtime.Composable
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.graphics.Color
import androidx.compose.ui.platform.LocalContext
import androidx.compose.ui.text.font.FontWeight
import androidx.compose.ui.unit.dp
import androidx.compose.ui.unit.sp
import com.raksh.alert.data.model.Resource
import com.raksh.alert.ui.theme.Slate900
import com.raksh.alert.ui.theme.Slate800
import com.raksh.alert.ui.theme.Slate400
import com.raksh.alert.ui.theme.Slate100
import com.raksh.alert.ui.theme.EmergencyRed
import com.raksh.alert.ui.theme.SafeGreen
import com.raksh.alert.ui.theme.AlertAmber

@Composable
fun ResourceCard(
    resource: Resource,
    modifier: Modifier = Modifier
) {
    val context = LocalContext.current
    val progress = if (resource.totalCapacity > 0) {
        resource.availableCapacity.toFloat() / resource.totalCapacity
    } else {
        0f
    }
    
    // Choose status color
    val progressColor = when {
        progress > 0.5f -> SafeGreen // Green: ample supply
        progress > 0.15f -> AlertAmber // Orange: low supply
        else -> EmergencyRed // Red: critical scarcity
    }

    Card(
        modifier = modifier
            .fillMaxWidth()
            .border(1.dp, Slate800, RoundedCornerShape(16.dp)),
        shape = RoundedCornerShape(16.dp),
        colors = CardDefaults.cardColors(
            containerColor = Slate900
        ),
        elevation = CardDefaults.cardElevation(
            defaultElevation = 0.dp
        )
    ) {
        Column(
            modifier = Modifier.padding(16.dp)
        ) {
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = resource.type.uppercase(),
                    color = Slate400,
                    fontSize = 11.sp,
                    fontWeight = FontWeight.Bold,
                    letterSpacing = 1.sp
                )
                Text(
                    text = if (resource.isActive) "ACTIVE" else "INACTIVE",
                    color = if (resource.isActive) SafeGreen else Slate400,
                    fontSize = 10.sp,
                    fontWeight = FontWeight.Bold
                )
            }
            
            Spacer(modifier = Modifier.height(8.dp))
            
            Text(
                text = resource.name,
                color = Slate100,
                fontSize = 18.sp,
                fontWeight = FontWeight.Bold
            )
            
            Spacer(modifier = Modifier.height(6.dp))
            
            Row(
                verticalAlignment = Alignment.CenterVertically
            ) {
                Icon(
                    imageVector = Icons.Default.LocationOn,
                    contentDescription = "Location",
                    tint = Slate400,
                    modifier = Modifier.width(16.dp)
                )
                Spacer(modifier = Modifier.width(4.dp))
                Text(
                    text = resource.address,
                    color = Slate400,
                    fontSize = 12.sp,
                    maxLines = 1
                )
            }
            
            Spacer(modifier = Modifier.height(16.dp))
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.SpaceBetween,
                verticalAlignment = Alignment.CenterVertically
            ) {
                Text(
                    text = "Capacity: ${resource.availableCapacity}/${resource.totalCapacity}",
                    color = Slate100,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Medium
                )
                Text(
                    text = "${(progress * 100).toInt()}% Available",
                    color = progressColor,
                    fontSize = 12.sp,
                    fontWeight = FontWeight.Bold
                )
            }
            
            Spacer(modifier = Modifier.height(6.dp))
            
            LinearProgressIndicator(
                progress = { progress },
                modifier = Modifier.fillMaxWidth(),
                color = progressColor,
                trackColor = Slate800,
                strokeCap = androidx.compose.ui.graphics.StrokeCap.Round
            )
            
            Spacer(modifier = Modifier.height(16.dp))
            
            Row(
                modifier = Modifier.fillMaxWidth(),
                horizontalArrangement = Arrangement.spacedBy(8.dp)
            ) {
                Button(
                    onClick = {
                        val intent = Intent(Intent.ACTION_DIAL, Uri.parse("tel:${resource.contactPhone}"))
                        context.startActivity(intent)
                    },
                    modifier = Modifier.weight(1f),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = Slate800,
                        contentColor = Slate100
                    ),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.Call,
                        contentDescription = "Call",
                        tint = Slate100
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(text = "Call", fontSize = 14.sp, fontWeight = FontWeight.Bold)
                }
                
                Button(
                    onClick = {
                        val gmmIntentUri = Uri.parse("geo:${resource.lat},${resource.lng}?q=${Uri.encode(resource.name)}")
                        val mapIntent = Intent(Intent.ACTION_VIEW, gmmIntentUri)
                        mapIntent.setPackage("com.google.android.apps.maps")
                        context.startActivity(mapIntent)
                    },
                    modifier = Modifier.weight(1f),
                    colors = ButtonDefaults.buttonColors(
                        containerColor = EmergencyRed,
                        contentColor = Color.White
                    ),
                    shape = RoundedCornerShape(8.dp)
                ) {
                    Icon(
                        imageVector = Icons.Default.LocationOn,
                        contentDescription = "Navigate",
                        tint = Color.White
                    )
                    Spacer(modifier = Modifier.width(8.dp))
                    Text(text = "Navigate", fontSize = 14.sp, fontWeight = FontWeight.Bold)
                }
            }
        }
    }
}