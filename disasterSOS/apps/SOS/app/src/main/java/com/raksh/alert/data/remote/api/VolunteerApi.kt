package com.raksh.alert.data.remote.api

import retrofit2.Response
import retrofit2.http.POST
import retrofit2.http.GET
import retrofit2.http.PATCH
import retrofit2.http.Body
import retrofit2.http.Path

interface VolunteerApi {
    @POST("volunteers/register")
    suspend fun registerVolunteer(@Body payload: RegisterVolunteerPayload): Response<SimpleResponseDto>

    @GET("volunteers/my-tasks")
    suspend fun getMyTasks(): Response<VolunteerTasksResponseDto>

    @PATCH("volunteers/my-tasks/{taskId}")
    suspend fun updateTaskStatus(
        @Path("taskId") taskId: String,
        @Body payload: UpdateTaskStatusPayload
    ): Response<SimpleResponseDto>
}

data class RegisterVolunteerPayload(
    val skills: List<String>,
    val location: VolunteerLocationPayload,
    val availabilityStatus: String = "available"
)

data class VolunteerLocationPayload(
    val lat: Double,
    val lng: Double
)

data class VolunteerTasksResponseDto(
    val success: Boolean,
    val data: List<VolunteerTaskDto>
)

data class VolunteerTaskDto(
    val _id: String,
    val title: String,
    val description: String,
    val severity: String,
    val status: String, // Open, Accepted, In Progress, Completed
    val targetAlert: String?, // Alert ID reference
    val assignedAt: String?
)

data class UpdateTaskStatusPayload(
    val status: String
)
