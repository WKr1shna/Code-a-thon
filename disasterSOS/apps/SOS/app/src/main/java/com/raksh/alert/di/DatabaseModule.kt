package com.raksh.alert.di

import android.content.Context
import androidx.room.Room
import com.raksh.alert.data.local.db.AppDatabase
import com.raksh.alert.data.local.db.dao.AlertDao
import com.raksh.alert.data.local.db.dao.LocationDao
import com.raksh.alert.data.local.db.dao.PendingSosDao
import com.raksh.alert.data.local.db.dao.ResourceDao
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object DatabaseModule {

    @Provides
    @Singleton
    fun provideDatabase(@ApplicationContext context: Context): AppDatabase {
        return Room.databaseBuilder(
            context,
            AppDatabase::class.java,
            "rakshalert_db"
        ).fallbackToDestructiveMigration()
         .build()
    }

    @Provides
    @Singleton
    fun provideAlertDao(database: AppDatabase): AlertDao {
        return database.alertDao()
    }

    @Provides
    @Singleton
    fun provideResourceDao(database: AppDatabase): ResourceDao {
        return database.resourceDao()
    }

    @Provides
    @Singleton
    fun providePendingSosDao(database: AppDatabase): PendingSosDao {
        return database.pendingSosDao()
    }

    @Provides
    @Singleton
    fun provideLocationDao(database: AppDatabase): LocationDao {
        return database.locationDao()
    }
}
