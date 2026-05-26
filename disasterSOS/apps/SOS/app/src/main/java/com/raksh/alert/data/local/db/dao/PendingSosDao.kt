package com.raksh.alert.data.local.db.dao

import androidx.room.Dao
import androidx.room.Delete
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.raksh.alert.data.local.db.entity.PendingSosEntity

@Dao
interface PendingSosDao {
    @Query("SELECT * FROM pending_sos ORDER BY createdAt ASC")
    suspend fun getAllPendingSos(): List<PendingSosEntity>

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun insertPendingSos(sos: PendingSosEntity): Long

    @Delete
    suspend fun deletePendingSos(sos: PendingSosEntity)

    @Query("DELETE FROM pending_sos")
    suspend fun clearPendingSos()
}
