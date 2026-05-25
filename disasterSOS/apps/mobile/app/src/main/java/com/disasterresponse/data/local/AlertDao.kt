package com.disasterresponse.data.local

import com.disasterresponse.data.model.Alert

interface AlertDao {
    fun insertAlert(alert: Alert)
    fun getAllAlerts(): List<Alert>
}
