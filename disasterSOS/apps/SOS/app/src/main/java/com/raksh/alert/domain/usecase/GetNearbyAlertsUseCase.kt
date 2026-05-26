package com.raksh.alert.domain.usecase

import com.raksh.alert.data.model.Alert
import com.raksh.alert.data.repository.AlertRepository
import com.raksh.alert.utils.Result
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject

class GetNearbyAlertsUseCase @Inject constructor(
    private val alertRepository: AlertRepository
) {
    // For Map view - dynamic fetch
    suspend fun executeNearby(lat: Double, lng: Double, radius: Int = 50): Flow<Result<List<Alert>>> {
        return alertRepository.getNearbyAlerts(lat, lng, radius)
    }

    // For Feed view - offline first cache matching filters
    fun executeFeed(
        status: String? = null,
        severity: String? = null,
        type: String? = null,
        district: String? = null
    ): Flow<Result<List<Alert>>> {
        return alertRepository.getAlerts(status, severity, type, district)
    }
}
