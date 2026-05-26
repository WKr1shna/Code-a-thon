package com.raksh.alert.data.repository

import android.content.SharedPreferences
import com.raksh.alert.data.local.datastore.UserPreferences
import com.raksh.alert.data.model.User
import com.raksh.alert.data.remote.api.AuthApi
import com.raksh.alert.data.remote.api.FcmTokenRequestDto
import com.raksh.alert.data.remote.api.LatLngDto
import com.raksh.alert.data.remote.api.UpdateLocationRequestDto
import com.raksh.alert.data.remote.dto.LoginRequest
import com.raksh.alert.data.remote.dto.SignupRequest
import com.raksh.alert.utils.Result
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import javax.inject.Inject

class AuthRepository @Inject constructor(
    private val authApi: AuthApi,
    private val userPrefs: UserPreferences,
    private val securePrefs: SharedPreferences
) {
    val userFlow: Flow<User?> = userPrefs.userFlow
    val isTrackingEnabled: Flow<Boolean> = userPrefs.trackingEnabledFlow
    val isSmsFallbackEnabled: Flow<Boolean> = userPrefs.smsFallbackFlow

    suspend fun login(request: LoginRequest): Flow<Result<User>> = flow {
        emit(Result.Loading())
        try {
            val response = authApi.login(request)
            if (response.isSuccessful && response.body()?.success == true) {
                val authData = response.body()!!.data!!
                val user = User(
                    id = authData.user.id,
                    name = authData.user.name,
                    email = authData.user.email,
                    phone = authData.user.phone,
                    role = authData.user.role,
                    district = authData.user.district,
                    state = "",
                    language = authData.user.language ?: "English"
                )
                userPrefs.saveUser(user)
                securePrefs.edit().putString("auth_token", authData.accessToken).apply()
                emit(Result.Success(user))
            } else {
                emit(Result.Error(response.body()?.message ?: "Login failed"))
            }
        } catch (e: Exception) {
            emit(Result.Error(e.message ?: "An unexpected error occurred"))
        }
    }

    suspend fun register(request: SignupRequest): Flow<Result<User>> = flow {
        emit(Result.Loading())
        try {
            val response = authApi.register(request)
            if (response.isSuccessful && response.body()?.success == true) {
                val authData = response.body()!!.data!!
                val user = User(
                    id = authData.user.id,
                    name = authData.user.name,
                    email = authData.user.email,
                    phone = authData.user.phone,
                    role = authData.user.role,
                    district = authData.user.district,
                    state = "",
                    language = authData.user.language ?: "English"
                )
                userPrefs.saveUser(user)
                securePrefs.edit().putString("auth_token", authData.accessToken).apply()
                emit(Result.Success(user))
            } else {
                emit(Result.Error(response.body()?.message ?: "Registration failed"))
            }
        } catch (e: Exception) {
            emit(Result.Error(e.message ?: "An unexpected error occurred"))
        }
    }

    suspend fun registerFcmToken(token: String): Flow<Result<String>> = flow {
        emit(Result.Loading())
        try {
            val response = authApi.registerFcmToken(FcmTokenRequestDto(token))
            if (response.isSuccessful && response.body()?.success == true) {
                userPrefs.setFcmToken(token)
                emit(Result.Success("FCM token registered successfully"))
            } else {
                emit(Result.Error(response.body()?.message ?: "FCM token registration failed"))
            }
        } catch (e: Exception) {
            emit(Result.Error(e.message ?: "An unexpected error occurred"))
        }
    }

    suspend fun updateLocation(lat: Double, lng: Double): Flow<Result<String>> = flow {
        emit(Result.Loading())
        try {
            val response = authApi.updateLocation(UpdateLocationRequestDto(LatLngDto(lat, lng)))
            if (response.isSuccessful && response.body()?.success == true) {
                userPrefs.saveLocation(lat, lng)
                emit(Result.Success("Location updated successfully"))
            } else {
                emit(Result.Error(response.body()?.message ?: "Location update failed"))
            }
        } catch (e: Exception) {
            emit(Result.Error(e.message ?: "An unexpected error occurred"))
        }
    }

    suspend fun logout() {
        userPrefs.clearUser()
        securePrefs.edit().remove("auth_token").apply()
    }

    suspend fun setTrackingEnabled(enabled: Boolean) {
        userPrefs.setTrackingEnabled(enabled)
    }

    suspend fun setSmsFallback(enabled: Boolean) {
        userPrefs.setSmsFallback(enabled)
    }
}