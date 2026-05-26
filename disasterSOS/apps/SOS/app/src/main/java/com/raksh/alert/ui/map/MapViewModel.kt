package com.raksh.alert.ui.map

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.raksh.alert.data.model.Alert
import com.raksh.alert.data.model.Resource
import com.raksh.alert.domain.usecase.GetNearbyAlertsUseCase
import com.raksh.alert.domain.usecase.GetNearbyResourcesUseCase
import com.raksh.alert.utils.Result
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class MapViewModel @Inject constructor(
    private val getNearbyAlertsUseCase: GetNearbyAlertsUseCase,
    private val getNearbyResourcesUseCase: GetNearbyResourcesUseCase
) : ViewModel() {

    private val _nearbyAlerts = MutableStateFlow<Result<List<Alert>>>(Result.Loading())
    val nearbyAlerts = _nearbyAlerts.asStateFlow()

    private val _nearbyResources = MutableStateFlow<Result<List<Resource>>>(Result.Loading())
    val nearbyResources = _nearbyResources.asStateFlow()

    fun loadMapData(lat: Double, lng: Double, radiusKm: Int = 50) {
        viewModelScope.launch {
            // Load alerts near coordinates
            getNearbyAlertsUseCase.executeNearby(lat, lng, radiusKm).collectLatest { result ->
                _nearbyAlerts.value = result
            }
        }
        
        viewModelScope.launch {
            // Load resources near coordinates
            getNearbyResourcesUseCase(lat = lat, lng = lng, radiusInKm = radiusKm.toDouble()).collectLatest { result ->
                _nearbyResources.value = result
            }
        }
    }
}
