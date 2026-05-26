package com.raksh.alert.ui.resources

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.raksh.alert.data.model.Resource
import com.raksh.alert.data.repository.ResourceRepository
import com.raksh.alert.domain.usecase.GetNearbyResourcesUseCase
import com.raksh.alert.utils.Result
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class ResourceViewModel @Inject constructor(
    private val getNearbyResourcesUseCase: GetNearbyResourcesUseCase,
    private val resourceRepository: ResourceRepository
) : ViewModel() {

    private val _resourcesState = MutableStateFlow<Result<List<Resource>>>(Result.Loading())
    val resourcesState = _resourcesState.asStateFlow()

    private val _modifyState = MutableStateFlow<Result<Resource>?>(null)
    val modifyState = _modifyState.asStateFlow()

    init {
        fetchResources()
    }

    fun fetchResources(
        type: String? = null,
        lat: Double? = null,
        lng: Double? = null,
        radiusInKm: Double? = null
    ) {
        viewModelScope.launch {
            getNearbyResourcesUseCase(type, lat, lng, radiusInKm).collectLatest { result ->
                _resourcesState.value = result
            }
        }
    }

    fun createResource(
        name: String,
        type: String,
        address: String,
        contactPhone: String,
        totalCapacity: Int,
        lat: Double,
        lng: Double
    ) {
        viewModelScope.launch {
            _modifyState.value = Result.Loading()
            val result = resourceRepository.createResource(name, type, address, contactPhone, totalCapacity, lat, lng)
            _modifyState.value = result
            if (result is Result.Success) {
                fetchResources() // reload
            }
        }
    }

    fun updateCapacity(id: String, availableCapacity: Int) {
        viewModelScope.launch {
            _modifyState.value = Result.Loading()
            val result = resourceRepository.updateCapacity(id, availableCapacity)
            _modifyState.value = result
            if (result is Result.Success) {
                fetchResources() // reload
            }
        }
    }

    fun resetModifyState() {
        _modifyState.value = null
    }
}