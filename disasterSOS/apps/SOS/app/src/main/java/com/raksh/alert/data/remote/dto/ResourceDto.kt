package com.raksh.alert.data.remote.dto

data class ResourceDto(
    val _id: String,
    val name: String,
    val type: String,
    val location: LocationDto,
    val address: String,
    val contactPhone: String,
    val totalCapacity: Int,
    val availableCapacity: Int,
    val isActive: Boolean
)
