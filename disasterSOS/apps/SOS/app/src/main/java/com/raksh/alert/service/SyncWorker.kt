package com.raksh.alert.service

import android.content.Context
import androidx.hilt.work.HiltWorker
import androidx.work.CoroutineWorker
import androidx.work.WorkerParameters
import com.raksh.alert.data.local.db.dao.PendingSosDao
import com.raksh.alert.data.remote.api.SosApi
import com.raksh.alert.data.remote.dto.SosLocationDto
import com.raksh.alert.data.remote.dto.SosRequest
import dagger.assisted.Assisted
import dagger.assisted.AssistedInject

@HiltWorker
class SyncWorker @AssistedInject constructor(
    @Assisted private val appContext: Context,
    @Assisted workerParams: WorkerParameters,
    private val sosApi: SosApi,
    private val pendingSosDao: PendingSosDao
) : CoroutineWorker(appContext, workerParams) {

    override suspend fun doWork(): Result {
        try {
            val pendingList = pendingSosDao.getAllPendingSos()
            if (pendingList.isEmpty()) {
                return Result.success()
            }

            var allSynced = true

            for (sos in pendingList) {
                try {
                    val request = SosRequest(
                        title = sos.title,
                        description = sos.description,
                        type = sos.type.lowercase(),
                        severity = sos.severity,
                        location = SosLocationDto(sos.lat, sos.lng),
                        mediaUrls = emptyList() // Typically uploaded to media server first
                    )
                    
                    val response = sosApi.sendSos(request)
                    if (response.isSuccessful && response.body()?.success == true) {
                        pendingSosDao.deletePendingSos(sos)
                    } else {
                        allSynced = false
                    }
                } catch (e: Exception) {
                    allSynced = false
                }
            }

            return if (allSynced) Result.success() else Result.retry()
        } catch (e: Exception) {
            return Result.failure()
        }
    }
}