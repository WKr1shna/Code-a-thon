package com.raksh.alert.ui.sos

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.raksh.alert.data.remote.api.AvailableResourcesDataDto
import com.raksh.alert.data.repository.SosRepository
import com.raksh.alert.domain.usecase.SendSosUseCase
import com.raksh.alert.utils.Result
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class SosViewModel @Inject constructor(
    private val sendSosUseCase: SendSosUseCase,
    private val sosRepository: SosRepository
) : ViewModel() {

    private val _sosResult = MutableStateFlow<Result<String>?>(null)
    val sosResult = _sosResult.asStateFlow()

    private val _availableResources = MutableStateFlow<Result<AvailableResourcesDataDto>>(Result.Loading())
    val availableResources = _availableResources.asStateFlow()

    init {
        loadAvailableResources()
    }

    fun sendEmergencySos(
        type: String,
        severity: String,
        lat: Double,
        lng: Double,
        district: String,
        state: String,
        description: String = "EMERGENCY: SOS dispatch from Citizen app.",
        userName: String = "Citizen"
    ) {
        viewModelScope.launch {
            sendSosUseCase(
                title = "Emergency SOS: ${type.uppercase()} reported",
                description = description,
                type = type,
                severity = severity,
                lat = lat,
                lng = lng,
                district = district,
                state = state,
                userName = userName
            ).collectLatest { result ->
                _sosResult.value = result
            }
        }
    }

    fun loadAvailableResources() {
        viewModelScope.launch {
            sosRepository.getAvailableResources().collectLatest { result ->
                _availableResources.value = result
            }
        }
    }
}