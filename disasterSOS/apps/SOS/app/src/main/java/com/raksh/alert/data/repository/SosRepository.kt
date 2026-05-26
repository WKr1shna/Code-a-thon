package com.raksh.alert.data.repository

import android.content.Context
import com.google.gson.Gson
import com.raksh.alert.data.local.db.dao.PendingSosDao
import com.raksh.alert.data.local.db.entity.PendingSosEntity
import com.raksh.alert.data.remote.api.AvailableResourcesDataDto
import com.raksh.alert.data.remote.api.SosApi
import com.raksh.alert.data.remote.dto.SosLocationDto
import com.raksh.alert.data.remote.dto.SosRequest
import com.raksh.alert.data.model.Alert
import com.raksh.alert.utils.Constants
import com.raksh.alert.utils.NetworkUtils
import com.raksh.alert.utils.Result
import com.raksh.alert.utils.SmsUtils
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import javax.inject.Inject

class SosRepository @Inject constructor(
    private val context: Context,
    private val sosApi: SosApi,
    private val pendingSosDao: PendingSosDao
) {
    private val gson = Gson()

    suspend fun sendSos(
        title: String,
        description: String,
        type: String,
        severity: String,
        lat: Double,
        lng: Double,
        district: String,
        state: String,
        mediaUris: List<String> = emptyList(),
        userName: String = "Citizen"
    ): Flow<Result<String>> = flow {
        emit(Result.Loading())
        
        if (NetworkUtils.isConnected(context)) {
            // ONLINE FLOW
            try {
                val response = sosApi.sendSos(
                    SosRequest(
                        title = title,
                        description = description,
                        type = type.lowercase(),
                        severity = severity,
                        location = SosLocationDto(lat, lng),
                        mediaUrls = emptyList()
                    )
                )
                if (response.isSuccessful && response.body()?.success == true) {
                    emit(Result.Success("SOS alert dispatched successfully"))
                } else {
                    emit(Result.Error(response.body()?.message ?: "Failed to dispatch SOS alert"))
                }
            } catch (e: Exception) {
                // Fallback to offline
                saveOfflineSosAndSms(title, description, type, severity, lat, lng, district, state, mediaUris)
                emit(Result.Success("SOS saved locally and sent via SMS fallback."))
            }
        } else {
            // OFFLINE FLOW
            saveOfflineSosAndSms(title, description, type, severity, lat, lng, district, state, mediaUris)
            emit(Result.Success("SOS saved locally and sent via SMS fallback."))
        }
    }

    private suspend fun saveOfflineSosAndSms(
        title: String,
        description: String,
        type: String,
        severity: String,
        lat: Double,
        lng: Double,
        district: String,
        state: String,
        mediaUris: List<String>
    ) {
        val serializedMedia = gson.toJson(mediaUris)
        
        // SMS Fallback
        var smsSent = false
        try {
            smsSent = SmsUtils.sendSms(
                context = context,
                phoneNumber = Constants.NDRF_EMERGENCY_SMS,
                message = "CRITICAL DISASTER SOS: $title\nType: $type\nSeverity: $severity\nLocation: $lat, $lng\nDistrict: $district, $state"
            )
        } catch (e: Exception) {
            // Ignore SMS failure
        }
        
        pendingSosDao.insertPendingSos(
            PendingSosEntity(
                title = title,
                description = description,
                type = type,
                severity = severity,
                lat = lat,
                lng = lng,
                district = district,
                state = state,
                mediaUris = serializedMedia,
                createdAt = System.currentTimeMillis(),
                smsSent = smsSent
            )
        )
    }

    suspend fun getAvailableResources(): Flow<Result<AvailableResourcesDataDto>> = flow {
        emit(Result.Loading())
        try {
            val response = sosApi.getAvailableResources()
            if (response.isSuccessful && response.body()?.success == true) {
                emit(Result.Success(response.body()!!.data))
            } else {
                emit(Result.Error("Failed to fetch available resources"))
            }
        } catch (e: Exception) {
            emit(Result.Error(e.message ?: "An unexpected error occurred"))
        }
    }
}