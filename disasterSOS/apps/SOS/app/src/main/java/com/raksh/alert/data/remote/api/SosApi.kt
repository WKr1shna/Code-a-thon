package com.raksh.alert.data.remote.api

import com.raksh.alert.data.remote.dto.SosRequest
import com.raksh.alert.data.remote.dto.AlertDto
import com.raksh.alert.data.remote.dto.ResourceDto
import retrofit2.Response
import retrofit2.http.Body
import retrofit2.http.POST
import retrofit2.http.GET
import retrofit2.http.Path

interface SosApi {
    @POST("sos")
    suspend fun sendSos(@Body request: SosRequest): Response<SosResponseDto>

    @POST("sos/{id}/assign")
    suspend fun assignResource(
        @Path("id") id: String,
        @Body payload: AssignResourcePayload
    ): Response<SimpleResponseDto>

    @GET("sos/available-resources")
    suspend fun getAvailableResources(): Response<AvailableResourcesResponseDto>
}

data class SosResponseDto(
    val success: Boolean,
    val message: String?,
    val data: AlertDto?
)

data class AssignResourcePayload(
    val notes: String,
    val responderId: String? = null,
    val volunteerId: String? = null,
    val vehicleId: String? = null
)

data class AvailableResourcesResponseDto(
    val success: Boolean,
    val data: AvailableResourcesDataDto
)

data class AvailableResourcesDataDto(
    val responders: List<ApiResponderDto>,
    val volunteers: List<ApiVolunteerDto>,
    val vehicles: List<ApiVehicleDto>
)

data class ApiResponderDto(
    val id: String,
    val name: String,
    val phone: String,
    val status: String,
    val district: String
)

data class ApiVolunteerDto(
    val id: String,
    val name: String,
    val phone: String,
    val skills: List<String>,
    val status: String
)

data class ApiVehicleDto(
    val id: String,
    val type: String,
    val status: String,
    val lat: Double,
    val lng: Double,
    val fuel: Int,
    val capacity: String
)
