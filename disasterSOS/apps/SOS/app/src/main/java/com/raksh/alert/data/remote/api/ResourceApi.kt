package com.raksh.alert.data.remote.api

import com.raksh.alert.data.remote.dto.ResourceDto
import retrofit2.Response
import retrofit2.http.GET
import retrofit2.http.Query
import retrofit2.http.POST
import retrofit2.http.Body
import retrofit2.http.PATCH
import retrofit2.http.Path

interface ResourceApi {
    @GET("resources")
    suspend fun getResources(
        @Query("type") type: String? = null,
        @Query("lat") lat: Double? = null,
        @Query("lng") lng: Double? = null,
        @Query("radius") radiusInKm: Double? = null
    ): Response<ResourcesListResponseDto>

    @POST("resources")
    suspend fun createResource(@Body resource: CreateResourcePayload): Response<ResourceResponseDto>

    @PATCH("resources/{id}/capacity")
    suspend fun updateCapacity(
        @Path("id") id: String,
        @Body payload: UpdateCapacityPayload
    ): Response<ResourceResponseDto>
}

data class ResourcesListResponseDto(
    val success: Boolean,
    val data: List<ResourceDto>
)

data class ResourceResponseDto(
    val success: Boolean,
    val data: ResourceDto
)

data class CreateResourcePayload(
    val name: String,
    val type: String,
    val address: String,
    val contactPhone: String,
    val totalCapacity: Int,
    val location: ResourceLocationPayload
)

data class ResourceLocationPayload(
    val lat: Double,
    val lng: Double
)

data class UpdateCapacityPayload(
    val availableCapacity: Int
)
