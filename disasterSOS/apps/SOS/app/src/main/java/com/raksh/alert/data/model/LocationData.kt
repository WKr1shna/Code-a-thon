package com.raksh.alert.data.model

data class LocationData(
    val lat: Double,
    val lng: Double,
    val district: String = "",
    val state: String = "",
    val accuracy: Float = 0f,
    val updatedAt: Long = 0
)
