package com.raksh.alert.domain.usecase

import com.raksh.alert.data.model.Resource
import com.raksh.alert.data.repository.ResourceRepository
import com.raksh.alert.utils.Result
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject

class GetNearbyResourcesUseCase @Inject constructor(
    private val resourceRepository: ResourceRepository
) {
    operator fun invoke(
        type: String? = null,
        lat: Double? = null,
        lng: Double? = null,
        radiusInKm: Double? = null
    ): Flow<Result<List<Resource>>> {
        return resourceRepository.getResources(type, lat, lng, radiusInKm)
    }
}
