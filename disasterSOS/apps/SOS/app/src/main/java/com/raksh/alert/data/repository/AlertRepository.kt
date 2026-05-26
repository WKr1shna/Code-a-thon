package com.raksh.alert.data.repository

import android.content.Context
import com.google.gson.Gson
import com.raksh.alert.data.local.db.dao.AlertDao
import com.raksh.alert.data.local.db.entity.AlertEntity
import com.raksh.alert.data.model.Alert
import com.raksh.alert.data.remote.api.AlertApi
import com.raksh.alert.data.remote.api.UpdateStatusPayload
import com.raksh.alert.utils.NetworkUtils
import com.raksh.alert.utils.Result
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import java.text.SimpleDateFormat
import java.util.Locale
import javax.inject.Inject

class AlertRepository @Inject constructor(
    private val context: Context,
    private val alertApi: AlertApi,
    private val alertDao: AlertDao
) {
    private val gson = Gson()

    private fun AlertEntity.toDomain(): Alert {
        val mediaList: List<String> = try {
            gson.fromJson(this.mediaUrls, Array<String>::class.java).toList()
        } catch (e: Exception) {
            emptyList()
        }
        return Alert(
            id = this.id,
            title = this.title,
            description = this.description,
            type = this.type,
            severity = this.severity,
            status = this.status,
            lat = this.lat,
            lng = this.lng,
            district = this.district,
            state = this.state,
            aiScore = this.aiScore,
            mediaUrls = mediaList,
            reportedAt = this.reportedAt
        )
    }

    private fun parseDateString(dateStr: String): Long {
        return try {
            val format = SimpleDateFormat("yyyy-MM-dd'T'HH:mm:ss.SSS'Z'", Locale.getDefault())
            format.parse(dateStr)?.time ?: System.currentTimeMillis()
        } catch (e: Exception) {
            System.currentTimeMillis()
        }
    }

    fun getAlerts(
        status: String? = null,
        severity: String? = null,
        type: String? = null,
        district: String? = null
    ): Flow<Result<List<Alert>>> = flow {
        emit(Result.Loading())
        
        if (NetworkUtils.isConnected(context)) {
            try {
                val response = alertApi.getAlerts(
                    status = status,
                    severity = severity,
                    type = type,
                    district = district
                )
                if (response.isSuccessful && response.body()?.success == true) {
                    val alertsDto = response.body()?.data ?: emptyList()
                    val entities = alertsDto.map { dto ->
                        AlertEntity(
                            id = dto._id,
                            title = dto.title,
                            description = dto.description,
                            type = dto.type,
                            severity = dto.severity,
                            status = dto.status,
                            lat = dto.location.coordinates[1],
                            lng = dto.location.coordinates[0],
                            district = dto.reportedBy?.district ?: "",
                            state = "",
                            aiScore = dto.aiScore ?: 0.0f,
                            mediaUrls = gson.toJson(dto.mediaUrls ?: emptyList<String>()),
                            reportedAt = parseDateString(dto.createdAt),
                            cachedAt = System.currentTimeMillis()
                        )
                    }
                    alertDao.insertAlerts(entities)
                }
            } catch (e: Exception) {
                // Silently fallback to Room DB on net errors
            }
        }

        try {
            alertDao.getAllAlerts().collect { entities ->
                var domainAlerts = entities.map { it.toDomain() }
                if (status != null) {
                    domainAlerts = domainAlerts.filter { it.status.equals(status, ignoreCase = true) }
                }
                if (severity != null) {
                    domainAlerts = domainAlerts.filter { it.severity.equals(severity, ignoreCase = true) }
                }
                if (type != null) {
                    domainAlerts = domainAlerts.filter { it.type.equals(type, ignoreCase = true) }
                }
                if (district != null) {
                    domainAlerts = domainAlerts.filter { it.district.equals(district, ignoreCase = true) }
                }
                emit(Result.Success(domainAlerts))
            }
        } catch (e: Exception) {
            emit(Result.Error(e.message ?: "Failed to read local database"))
        }
    }

    fun getNearbyAlerts(lat: Double, lng: Double, radiusInKm: Int = 10): Flow<Result<List<Alert>>> = flow {
        emit(Result.Loading())
        try {
            val response = alertApi.getNearbyAlerts(lat, lng, radiusInKm)
            if (response.isSuccessful && response.body()?.success == true) {
                val alertsDto = response.body()?.data ?: emptyList()
                val domainAlerts = alertsDto.map { dto ->
                    Alert(
                        id = dto._id,
                        title = dto.title,
                        description = dto.description,
                        type = dto.type,
                        severity = dto.severity,
                        status = dto.status,
                        lat = dto.location.coordinates[1],
                        lng = dto.location.coordinates[0],
                        district = dto.reportedBy?.district ?: "",
                        state = "",
                        aiScore = dto.aiScore ?: 0f,
                        mediaUrls = dto.mediaUrls ?: emptyList(),
                        reportedAt = parseDateString(dto.createdAt)
                    )
                }
                emit(Result.Success(domainAlerts))
            } else {
                emit(Result.Error("Failed to fetch nearby alerts"))
            }
        } catch (e: Exception) {
            emit(Result.Error(e.message ?: "An unexpected error occurred"))
        }
    }

    fun updateAlertStatus(id: String, status: String): Flow<Result<Alert>> = flow {
        emit(Result.Loading())
        try {
            val response = alertApi.updateAlertStatus(id, UpdateStatusPayload(status))
            if (response.isSuccessful && response.body()?.success == true) {
                val dto = response.body()!!.data!!
                val domainAlert = Alert(
                    id = dto._id,
                    title = dto.title,
                    description = dto.description,
                    type = dto.type,
                    severity = dto.severity,
                    status = dto.status,
                    lat = dto.location.coordinates[1],
                    lng = dto.location.coordinates[0],
                    district = dto.reportedBy?.district ?: "",
                    state = "",
                    aiScore = dto.aiScore ?: 0f,
                    mediaUrls = dto.mediaUrls ?: emptyList(),
                    reportedAt = parseDateString(dto.createdAt)
                )
                // Cache updated alert in Room
                val entity = AlertEntity(
                    id = domainAlert.id,
                    title = domainAlert.title,
                    description = domainAlert.description,
                    type = domainAlert.type,
                    severity = domainAlert.severity,
                    status = domainAlert.status,
                    lat = domainAlert.lat,
                    lng = domainAlert.lng,
                    district = domainAlert.district,
                    state = domainAlert.state,
                    aiScore = domainAlert.aiScore,
                    mediaUrls = gson.toJson(domainAlert.mediaUrls),
                    reportedAt = domainAlert.reportedAt,
                    cachedAt = System.currentTimeMillis()
                )
                alertDao.insertAlerts(listOf(entity))
                emit(Result.Success(domainAlert))
            } else {
                emit(Result.Error("Failed to update status"))
            }
        } catch (e: Exception) {
            emit(Result.Error(e.message ?: "An unexpected error occurred"))
        }
    }
}