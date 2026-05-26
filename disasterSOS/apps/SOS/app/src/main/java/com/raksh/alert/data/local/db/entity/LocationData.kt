package com.raksh.alert.data.local.db.entity

import androidx.room.Entity
import androidx.room.PrimaryKey

@Entity(tableName = "location_data")
data class LocationData(
    @PrimaryKey val id: Int = 1,
    val lat: Double,
    val lng: Double,
    val district: String,
    val state: String,
    val accuracy: Float,
    val updatedAt: Long
)
