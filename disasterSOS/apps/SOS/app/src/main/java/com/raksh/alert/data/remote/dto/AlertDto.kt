package com.raksh.alert.data.remote.dto

data class AlertDto(
    val _id: String,
    val title: String,
    val description: String,
    val type: String,
    val severity: String,
    val status: String,
    val location: LocationDto,
    val reportedBy: UserRefDto?,
    val claimedBy: UserRefDto?,
    val aiScore: Float?,
    val mediaUrls: List<String>?,
    val createdAt: String
)

data class LocationDto(
    val type: String,
    val coordinates: List<Double> // [lng, lat]
)

data class UserRefDto(
    val _id: String,
    val name: String,
    val phone: String,
    val email: String?,
    val role: String?,
    val district: String?
)
