package com.raksh.alert.data.local.db.dao

import androidx.room.Dao
import androidx.room.Insert
import androidx.room.OnConflictStrategy
import androidx.room.Query
import com.raksh.alert.data.local.db.entity.LocationData
import kotlinx.coroutines.flow.Flow

@Dao
interface LocationDao {
    @Query("SELECT * FROM location_data WHERE id = 1")
    fun getLocation(): Flow<LocationData?>

    @Query("SELECT * FROM location_data WHERE id = 1")
    suspend fun getLocationOnce(): LocationData?

    @Insert(onConflict = OnConflictStrategy.REPLACE)
    suspend fun saveLocation(location: LocationData)
}
