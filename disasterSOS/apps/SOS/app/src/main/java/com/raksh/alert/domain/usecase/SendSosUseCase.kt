package com.raksh.alert.domain.usecase

import com.raksh.alert.data.repository.SosRepository
import com.raksh.alert.utils.Result
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject

class SendSosUseCase @Inject constructor(
    private val sosRepository: SosRepository
) {
    suspend operator fun invoke(
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
    ): Flow<Result<String>> {
        return sosRepository.sendSos(
            title = title,
            description = description,
            type = type,
            severity = severity,
            lat = lat,
            lng = lng,
            district = district,
            state = state,
            mediaUris = mediaUris,
            userName = userName
        )
    }
}
