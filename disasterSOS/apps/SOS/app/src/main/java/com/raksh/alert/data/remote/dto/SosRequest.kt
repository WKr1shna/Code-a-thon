package com.raksh.alert.data.remote.dto

data class SosRequest(
    val title: String,
    val description: String,
    val type: String,
    val severity: String,
    val location: SosLocationDto,
    val mediaUrls: List<String> = emptyList()
)

data class SosLocationDto(
    val lat: Double,
    val lng: Double
)
