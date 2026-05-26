package com.raksh.alert.data.remote.api

import com.raksh.alert.data.remote.dto.AlertDto
import retrofit2.Response
import retrofit2.http.GET
import retrofit2.http.PATCH
import retrofit2.http.Path
import retrofit2.http.Query
import retrofit2.http.Body

interface AlertApi {
    @GET("sos")
    suspend fun getAlerts(
        @Query("page") page: Int = 1,
        @Query("limit") limit: Int = 10,
        @Query("status") status: String? = null,
        @Query("severity") severity: String? = null,
        @Query("type") type: String? = null,
        @Query("district") district: String? = null
    ): Response<AlertsListResponseDto>

    @GET("sos/nearby")
    suspend fun getNearbyAlerts(
        @Query("lat") lat: Double,
        @Query("lng") lng: Double,
        @Query("radius") radiusInKm: Int = 10
    ): Response<NearbyAlertsResponseDto>

    @GET("sos/{id}")
    suspend fun getAlertById(@Path("id") id: String): Response<SosResponseDto>

    @PATCH("sos/{id}/status")
    suspend fun updateAlertStatus(
        @Path("id") id: String,
        @Body payload: UpdateStatusPayload
    ): Response<SosResponseDto>
}

data class AlertsListResponseDto(
    val success: Boolean,
    val data: List<AlertDto>?,
    val total: Int?,
    val page: Int?,
    val pages: Int?
)

data class NearbyAlertsResponseDto(
    val success: Boolean,
    val data: List<AlertDto>
)

data class UpdateStatusPayload(
    val status: String
)
