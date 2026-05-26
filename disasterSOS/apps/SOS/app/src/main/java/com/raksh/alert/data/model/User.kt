package com.raksh.alert.data.model

data class User(
    val id: String,
    val name: String,
    val phone: String,
    val email: String,
    val role: String,
    val district: String,
    val state: String = "",
    val language: String = "English"
)
