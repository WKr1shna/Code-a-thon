package com.raksh.alert.data.model

data class Alert(
    val id: String,
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
    val mediaUrls: List<String>,
    val reportedAt: Long
)
