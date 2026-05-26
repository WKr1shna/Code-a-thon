package com.raksh.alert.ui.volunteer

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.raksh.alert.data.remote.api.RegisterVolunteerPayload
import com.raksh.alert.data.remote.api.UpdateTaskStatusPayload
import com.raksh.alert.data.remote.api.VolunteerApi
import com.raksh.alert.data.remote.api.VolunteerLocationPayload
import com.raksh.alert.data.remote.api.VolunteerTaskDto
import com.raksh.alert.utils.Result
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class VolunteerViewModel @Inject constructor(
    private val volunteerApi: VolunteerApi
) : ViewModel() {

    private val _registrationState = MutableStateFlow<Result<String>?>(null)
    val registrationState = _registrationState.asStateFlow()

    private val _tasksState = MutableStateFlow<Result<List<VolunteerTaskDto>>>(Result.Loading())
    val tasksState = _tasksState.asStateFlow()

    fun registerAsVolunteer(skills: List<String>, lat: Double, lng: Double) {
        if (skills.isEmpty()) {
            _registrationState.value = Result.Error("Please select at least one skill")
            return
        }
        viewModelScope.launch {
            _registrationState.value = Result.Loading()
            try {
                val payload = RegisterVolunteerPayload(
                    skills = skills,
                    location = VolunteerLocationPayload(lat, lng)
                )
                val response = volunteerApi.registerVolunteer(payload)
                if (response.isSuccessful && response.body()?.success == true) {
                    _registrationState.value = Result.Success("Successfully registered as a safety volunteer!")
                } else {
                    _registrationState.value = Result.Error(response.body()?.message ?: "Failed to register")
                }
            } catch (e: Exception) {
                _registrationState.value = Result.Error(e.message ?: "An unexpected error occurred")
            }
        }
    }

    fun loadTasks() {
        viewModelScope.launch {
            _tasksState.value = Result.Loading()
            try {
                val response = volunteerApi.getMyTasks()
                if (response.isSuccessful && response.body()?.success == true) {
                    _tasksState.value = Result.Success(response.body()?.data ?: emptyList())
                } else {
                    _tasksState.value = Result.Error("Failed to load tasks")
                }
            } catch (e: Exception) {
                _tasksState.value = Result.Error(e.message ?: "An unexpected error occurred")
            }
        }
    }

    fun updateTaskStatus(taskId: String, status: String) {
        viewModelScope.launch {
            try {
                val response = volunteerApi.updateTaskStatus(taskId, UpdateTaskStatusPayload(status))
                if (response.isSuccessful && response.body()?.success == true) {
                    loadTasks() // reload tasks
                }
            } catch (e: Exception) {
                // Handle silently
            }
        }
    }

    fun resetRegistrationState() {
        _registrationState.value = null
    }
}