package com.raksh.alert.data.local.db.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "resources")
data class ResourceEntity(
    @PrimaryKey val id: String,
    val name: String,
    val type: String,
    val lat: Double,
    val lng: Double,
    val address: String,
    val contactPhone: String,
    val totalCapacity: Int,
    val availableCapacity: Int,
    val isActive: Boolean,
    val cachedAt: Long
)
