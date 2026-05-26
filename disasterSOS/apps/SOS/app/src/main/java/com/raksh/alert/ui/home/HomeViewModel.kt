package com.raksh.alert.ui.home

import android.content.Context
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.raksh.alert.data.model.Alert
import com.raksh.alert.data.model.User
import com.raksh.alert.data.repository.AuthRepository
import com.raksh.alert.domain.usecase.GetNearbyAlertsUseCase
import com.raksh.alert.utils.NetworkUtils
import com.raksh.alert.utils.Result
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

import android.util.Log
import com.google.firebase.messaging.FirebaseMessaging

@HiltViewModel
class HomeViewModel @Inject constructor(
    private val context: Context,
    private val authRepository: AuthRepository,
    private val getNearbyAlertsUseCase: GetNearbyAlertsUseCase
) : ViewModel() {

    val currentUser: StateFlow<User?> = authRepository.userFlow
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)

    private val _isOffline = MutableStateFlow(!NetworkUtils.isConnected(context))
    val isOffline = _isOffline.asStateFlow()

    private val _feedAlerts = MutableStateFlow<Result<List<Alert>>>(Result.Loading())
    val feedAlerts = _feedAlerts.asStateFlow()

    init {
        refreshConnectionStatus()
        fetchRecentAlerts()
        registerFcmTokenIfNeeded()
    }

    private fun registerFcmTokenIfNeeded() {
        viewModelScope.launch {
            currentUser.collectLatest { user ->
                if (user != null) {
                    try {
                        Log.d("RakshAlert_FCM", "🔑 Starting to fetch FCM token for logged-in user: ${user.email}")
                        FirebaseMessaging.getInstance().token.addOnCompleteListener { task ->
                            if (task.isSuccessful) {
                                val token = task.result
                                if (!token.isNullOrEmpty()) {
                                    Log.d("RakshAlert_FCM", "✅ FCM Token retrieved successfully: $token")
                                    viewModelScope.launch {
                                        Log.d("RakshAlert_FCM", "📡 Sending FCM token to backend REST API...")
                                        authRepository.registerFcmToken(token).collectLatest { result ->
                                            when (result) {
                                                is Result.Success -> Log.d("RakshAlert_FCM", "🎉 FCM Token registered successfully on backend!")
                                                is Result.Error -> Log.e("RakshAlert_FCM", "❌ FCM Token registration failed: ${result.message}")
                                                is Result.Loading -> Log.d("RakshAlert_FCM", "⏳ FCM token registration in progress...")
                                            }
                                        }
                                    }
                                } else {
                                    Log.w("RakshAlert_FCM", "⚠️ FCM Token is null or empty!")
                                }
                            } else {
                                Log.e("RakshAlert_FCM", "❌ Failed to retrieve FCM token!", task.exception)
                            }
                        }
                    } catch (e: Exception) {
                        Log.e("RakshAlert_FCM", "❌ Exception while fetching FCM token", e)
                    }
                } else {
                    Log.d("RakshAlert_FCM", "👤 No user is logged in. Skipping FCM token registration.")
                }
            }
        }
    }

    fun refreshConnectionStatus() {
        _isOffline.value = !NetworkUtils.isConnected(context)
    }

    fun fetchRecentAlerts() {
        viewModelScope.launch {
            getNearbyAlertsUseCase.executeFeed(status = "active").collectLatest { result ->
                _feedAlerts.value = result
            }
        }
    }
}
