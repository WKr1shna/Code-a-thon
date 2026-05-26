package com.raksh.alert.data.remote.api

import com.google.gson.annotations.SerializedName
import com.raksh.alert.data.remote.dto.LoginRequest
import com.raksh.alert.data.remote.dto.SignupRequest
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST
import retrofit2.http.PATCH

interface AuthApi {
    @POST("auth/login")
    suspend fun login(@Body request: LoginRequest): Response<AuthResponseDto>

    @POST("auth/register")
    suspend fun register(@Body request: SignupRequest): Response<AuthResponseDto>

    @POST("auth/fcm-token")
    suspend fun registerFcmToken(@Body tokenBody: FcmTokenRequestDto): Response<SimpleResponseDto>

    @PATCH("auth/me")
    suspend fun updateLocation(@Body locationBody: UpdateLocationRequestDto): Response<SimpleResponseDto>
}

data class AuthResponseDto(
    val success: Boolean,
    val message: String?,
    val data: AuthDataDto?
)

data class AuthDataDto(
    val user: UserDto,
    val accessToken: String,
    val refreshToken: String?
)

data class UserDto(
    val id: String,
    val name: String,
    val email: String,
    val phone: String,
    val role: String,
    val district: String,
    val language: String?
)

data class FcmTokenRequestDto(
    @SerializedName("token")
    val fcmToken: String
)

data class UpdateLocationRequestDto(
    val lastLocation: LatLngDto
)

data class LatLngDto(
    val lat: Double,
    val lng: Double
)

data class SimpleResponseDto(
    val success: Boolean,
    val message: String?
)
