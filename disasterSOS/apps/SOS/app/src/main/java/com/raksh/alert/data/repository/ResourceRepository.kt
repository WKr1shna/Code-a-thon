package com.raksh.alert.data.repository

import android.content.Context
import com.raksh.alert.data.local.db.dao.ResourceDao
import com.raksh.alert.data.local.db.entity.ResourceEntity
import com.raksh.alert.data.model.Resource
import com.raksh.alert.data.remote.api.CreateResourcePayload
import com.raksh.alert.data.remote.api.ResourceApi
import com.raksh.alert.data.remote.api.ResourceLocationPayload
import com.raksh.alert.data.remote.api.UpdateCapacityPayload
import com.raksh.alert.data.remote.dto.ResourceDto
import com.raksh.alert.utils.NetworkUtils
import com.raksh.alert.utils.Result
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.flow
import kotlinx.coroutines.flow.first
import javax.inject.Inject

class ResourceRepository @Inject constructor(
    private val context: Context,
    private val resourceApi: ResourceApi,
    private val resourceDao: ResourceDao
) {
    private fun ResourceEntity.toDomain(): Resource {
        return Resource(
            id = this.id,
            name = this.name,
            type = this.type,
            lat = this.lat,
            lng = this.lng,
            address = this.address,
            contactPhone = this.contactPhone,
            totalCapacity = this.totalCapacity,
            availableCapacity = this.availableCapacity,
            isActive = this.isActive
        )
    }

    private fun ResourceDto.toEntity(): ResourceEntity {
        return ResourceEntity(
            id = this._id,
            name = this.name,
            type = this.type,
            lat = this.location.coordinates.getOrNull(1) ?: 0.0,
            lng = this.location.coordinates.getOrNull(0) ?: 0.0,
            address = this.address,
            contactPhone = this.contactPhone,
            totalCapacity = this.totalCapacity,
            availableCapacity = this.availableCapacity,
            isActive = this.isActive,
            cachedAt = System.currentTimeMillis()
        )
    }

    private fun ResourceDto.toDomain(): Resource {
        return Resource(
            id = this._id,
            name = this.name,
            type = this.type,
            lat = this.location.coordinates.getOrNull(1) ?: 0.0,
            lng = this.location.coordinates.getOrNull(0) ?: 0.0,
            address = this.address,
            contactPhone = this.contactPhone,
            totalCapacity = this.totalCapacity,
            availableCapacity = this.availableCapacity,
            isActive = this.isActive
        )
    }

    fun getResources(
        type: String? = null,
        lat: Double? = null,
        lng: Double? = null,
        radiusInKm: Double? = null
    ): Flow<Result<List<Resource>>> = flow {
        emit(Result.Loading())

        // Emit cached values first
        val cachedEntities = resourceDao.getAllResources().first()
        val cachedList = cachedEntities.map { it.toDomain() }
        val filteredCached = if (type != null && type.isNotEmpty()) {
            cachedList.filter { it.type.equals(type, ignoreCase = true) }
        } else {
            cachedList
        }
        emit(Result.Success(filteredCached))

        if (NetworkUtils.isConnected(context)) {
            try {
                val response = resourceApi.getResources(type, lat, lng, radiusInKm)
                if (response.isSuccessful && response.body()?.success == true) {
                    val resourceDtos = response.body()?.data ?: emptyList()
                    val entities = resourceDtos.map { it.toEntity() }
                    
                    // Clear and update local cache
                    resourceDao.clearResources()
                    resourceDao.insertResources(entities)

                    val domainList = resourceDtos.map { it.toDomain() }
                    emit(Result.Success(domainList))
                } else {
                    emit(Result.Error(response.message(), filteredCached))
                }
            } catch (e: Exception) {
                emit(Result.Error(e.localizedMessage ?: "Unknown Error", filteredCached))
            }
        } else {
            emit(Result.Error("No internet connection. Showing cached resources.", filteredCached))
        }
    }

    suspend fun createResource(
        name: String,
        type: String,
        address: String,
        contactPhone: String,
        totalCapacity: Int,
        lat: Double,
        lng: Double
    ): Result<Resource> {
        if (!NetworkUtils.isConnected(context)) {
            return Result.Error("No internet connection to create resource.")
        }
        return try {
            val payload = CreateResourcePayload(
                name = name,
                type = type,
                address = address,
                contactPhone = contactPhone,
                totalCapacity = totalCapacity,
                location = ResourceLocationPayload(lat, lng)
            )
            val response = resourceApi.createResource(payload)
            if (response.isSuccessful && response.body()?.success == true) {
                val dto = response.body()!!.data
                // Insert into cache
                resourceDao.insertResources(listOf(dto.toEntity()))
                Result.Success(dto.toDomain())
            } else {
                Result.Error(response.message())
            }
        } catch (e: Exception) {
            Result.Error(e.localizedMessage ?: "Unknown Error")
        }
    }

    suspend fun updateCapacity(id: String, availableCapacity: Int): Result<Resource> {
        if (!NetworkUtils.isConnected(context)) {
            return Result.Error("No internet connection to update capacity.")
        }
        return try {
            val payload = UpdateCapacityPayload(availableCapacity)
            val response = resourceApi.updateCapacity(id, payload)
            if (response.isSuccessful && response.body()?.success == true) {
                val dto = response.body()!!.data
                // Update cache
                resourceDao.insertResources(listOf(dto.toEntity()))
                Result.Success(dto.toDomain())
            } else {
                Result.Error(response.message())
            }
        } catch (e: Exception) {
            Result.Error(e.localizedMessage ?: "Unknown Error")
        }
    }
}