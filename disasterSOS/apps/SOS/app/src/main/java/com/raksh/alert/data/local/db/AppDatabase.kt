package com.raksh.alert.data.local.db

import androidx.room.Database
import androidx.room.RoomDatabase
import com.raksh.alert.data.local.db.dao.AlertDao
import com.raksh.alert.data.local.db.dao.LocationDao
import com.raksh.alert.data.local.db.dao.PendingSosDao
import com.raksh.alert.data.local.db.dao.ResourceDao
import com.raksh.alert.data.local.db.entity.AlertEntity
import com.raksh.alert.data.local.db.entity.LocationData
import com.raksh.alert.data.local.db.entity.PendingSosEntity
import com.raksh.alert.data.local.db.entity.ResourceEntity

@Database(
    entities = [
        AlertEntity::class,
        ResourceEntity::class,
        PendingSosEntity::class,
        LocationData::class
    ],
    version = 1,
    exportSchema = false
)
abstract class AppDatabase : RoomDatabase() {
    abstract fun alertDao(): AlertDao
    abstract fun resourceDao(): ResourceDao
    abstract fun pendingSosDao(): PendingSosDao
    abstract fun locationDao(): LocationDao
}
