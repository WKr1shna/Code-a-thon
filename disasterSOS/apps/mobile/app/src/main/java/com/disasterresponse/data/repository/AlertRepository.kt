package com.disasterresponse.data.repository

import com.disasterresponse.data.model.Alert

class AlertRepository {
    suspend fun getAlerts(): List<Alert> {
        // TODO: Fetch remote alerts and sync with local Room database
        return emptyList()
    }
}
