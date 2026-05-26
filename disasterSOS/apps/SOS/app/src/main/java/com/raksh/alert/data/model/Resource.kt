package com.raksh.alert.data.model

data class Resource(
    val id: String,
    val name: String,
    val type: String,
    val lat: Double,
    val lng: Double,
    val address: String,
    val contactPhone: String,
    val totalCapacity: Int,
    val availableCapacity: Int,
    val isActive: Boolean
)
