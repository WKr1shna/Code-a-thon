package com.raksh.alert.ui.alerts

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.raksh.alert.data.model.Alert
import com.raksh.alert.domain.usecase.GetNearbyAlertsUseCase
import com.raksh.alert.utils.Result
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class AlertFeedViewModel @Inject constructor(
    private val getNearbyAlertsUseCase: GetNearbyAlertsUseCase
) : ViewModel() {

    private val _alertsState = MutableStateFlow<Result<List<Alert>>>(Result.Loading())
    val alertsState = _alertsState.asStateFlow()

    init {
        fetchAlerts()
    }

    fun fetchAlerts(
        status: String? = null,
        severity: String? = null,
        type: String? = null,
        district: String? = null
    ) {
        viewModelScope.launch {
            getNearbyAlertsUseCase.executeFeed(status, severity, type, district).collectLatest { result ->
                _alertsState.value = result
            }
        }
    }
}
