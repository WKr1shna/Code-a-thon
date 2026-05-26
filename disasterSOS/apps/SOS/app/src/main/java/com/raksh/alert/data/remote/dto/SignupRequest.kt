package com.raksh.alert.data.remote.dto

data class SignupRequest(
    val name: String,
    val email: String,
    val phone: String,
    val password: String,
    val role: String,
    val district: String,
    val language: String
)
