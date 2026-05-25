package com.disasterresponse.data.model

data class Alert(
    val id: String,
    val title: String,
    val description: String,
    val latitude: Double,
    val longitude: Double,
    val severity: String, // LOW, MEDIUM, CRITICAL
    val timestamp: Long,
    val verified: Boolean
)
