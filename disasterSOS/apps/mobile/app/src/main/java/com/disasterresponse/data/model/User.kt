package com.disasterresponse.data.model

data class User(
    val id: String,
    val name: String,
    val role: String, // CITIZEN, SUPERVISOR, RESPONDER, ADMIN
    val token: String
)
