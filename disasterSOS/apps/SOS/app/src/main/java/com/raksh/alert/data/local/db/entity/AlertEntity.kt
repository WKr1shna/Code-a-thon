package com.raksh.alert.data.local.db.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "alerts")
data class AlertEntity(
    @PrimaryKey val id: String,
    val title: String,
    val description: String,
    val type: String,
    val severity: String,
    val status: String,
    val lat: Double,
    val lng: Double,
    val district: String,
    val state: String,
    val aiScore: Float,
    val mediaUrls: String, // Stored as JSON array string
    val reportedAt: Long,
    val cachedAt: Long
)
