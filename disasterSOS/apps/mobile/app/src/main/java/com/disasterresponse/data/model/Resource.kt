package com.disasterresponse.data.model

data class Resource(
    val id: String,
    val name: String,
    val type: String, // SHELTER, FOOD, MEDICAL
    val latitude: Double,
    val longitude: Double,
    val quantity: Int
)
