package com.raksh.alert.data.local.db.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "pending_sos")
data class PendingSosEntity(
    @PrimaryKey(autoGenerate = true) val localId: Int = 0,
    val title: String,
    val description: String,
    val type: String,
    val severity: String,
    val lat: Double,
    val lng: Double,
    val district: String,
    val state: String,
    val mediaUris: String, // JSON array string
    val createdAt: Long,
    val smsSent: Boolean
)
