package com.raksh.alert.ui.profile

import android.content.Context
import android.content.Intent
import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.raksh.alert.data.model.User
import com.raksh.alert.data.repository.AuthRepository
import com.raksh.alert.service.LocationService
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.SharingStarted
import kotlinx.coroutines.flow.StateFlow
import kotlinx.coroutines.flow.stateIn
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ProfileViewModel @Inject constructor(
    private val context: Context,
    private val authRepository: AuthRepository
) : ViewModel() {

    val currentUser: StateFlow<User?> = authRepository.userFlow
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), null)

    val isTrackingEnabled: StateFlow<Boolean> = authRepository.isTrackingEnabled
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), true)

    val isSmsFallbackEnabled: StateFlow<Boolean> = authRepository.isSmsFallbackEnabled
        .stateIn(viewModelScope, SharingStarted.WhileSubscribed(5000), true)

    fun toggleTracking(enabled: Boolean) {
        viewModelScope.launch {
            authRepository.setTrackingEnabled(enabled)
            val serviceIntent = Intent(context, LocationService::class.java)
            if (enabled) {
                serviceIntent.action = LocationService.ACTION_START
                context.startForegroundService(serviceIntent)
            } else {
                serviceIntent.action = LocationService.ACTION_STOP
                context.startService(serviceIntent)
            }
        }
    }

    fun toggleSmsFallback(enabled: Boolean) {
        viewModelScope.launch {
            authRepository.setSmsFallback(enabled)
        }
    }

    fun logout(onSuccess: () -> Unit) {
        viewModelScope.launch {
            // Stop location tracking service when logging out
            val serviceIntent = Intent(context, LocationService::class.java).apply {
                action = LocationService.ACTION_STOP
            }
            context.startService(serviceIntent)
            authRepository.logout()
            onSuccess()
        }
    }
}