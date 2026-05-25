package com.disasterresponse.data.repository

import com.disasterresponse.data.model.Resource

class ResourceRepository {
    suspend fun fetchResources(): List<Resource> {
        // TODO: Fetch available relief resources
        return emptyList()
    }
}
