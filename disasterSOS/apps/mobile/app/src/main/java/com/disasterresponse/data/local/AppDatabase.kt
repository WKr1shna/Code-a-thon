package com.disasterresponse.data.local

/**
 * AppDatabase: Room local database for offline support
 */
abstract class AppDatabase {
    abstract fun alertDao(): AlertDao
}
