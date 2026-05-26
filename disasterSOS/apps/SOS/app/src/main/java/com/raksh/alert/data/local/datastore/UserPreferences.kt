package com.raksh.alert.data.local.datastore

import android.content.Context
import androidx.datastore.core.DataStore
import androidx.datastore.preferences.core.Preferences
import androidx.datastore.preferences.core.booleanPreferencesKey
import androidx.datastore.preferences.core.doublePreferencesKey
import androidx.datastore.preferences.core.edit
import androidx.datastore.preferences.core.stringPreferencesKey
import androidx.datastore.preferences.preferencesDataStore
import com.raksh.alert.data.model.User
import kotlinx.coroutines.flow.Flow
import kotlinx.coroutines.flow.map
import javax.inject.Inject

val Context.dataStore: DataStore<Preferences> by preferencesDataStore(name = "user_preferences")

class UserPreferences @Inject constructor(private val context: Context) {

    companion object {
        private val USER_ID = stringPreferencesKey("user_id")
        private val USER_NAME = stringPreferencesKey("user_name")
        private val USER_PHONE = stringPreferencesKey("user_phone")
        private val USER_EMAIL = stringPreferencesKey("user_email")
        private val USER_ROLE = stringPreferencesKey("user_role")
        private val USER_DISTRICT = stringPreferencesKey("user_district")
        private val USER_STATE = stringPreferencesKey("user_state")
        private val USER_LANGUAGE = stringPreferencesKey("user_language")
        
        private val LATITUDE = doublePreferencesKey("latitude")
        private val LONGITUDE = doublePreferencesKey("longitude")
        private val FCM_TOKEN = stringPreferencesKey("fcm_token")
        
        private val TRACKING_ENABLED = booleanPreferencesKey("tracking_enabled")
        private val SMS_FALLBACK = booleanPreferencesKey("sms_fallback")
    }

    val userFlow: Flow<User?> = context.dataStore.data.map { preferences ->
        val id = preferences[USER_ID] ?: return@map null
        User(
            id = id,
            name = preferences[USER_NAME] ?: "",
            phone = preferences[USER_PHONE] ?: "",
            email = preferences[USER_EMAIL] ?: "",
            role = preferences[USER_ROLE] ?: "citizen",
            district = preferences[USER_DISTRICT] ?: "",
            state = preferences[USER_STATE] ?: "",
            language = preferences[USER_LANGUAGE] ?: "English"
        )
    }

    val trackingEnabledFlow: Flow<Boolean> = context.dataStore.data.map { preferences ->
        preferences[TRACKING_ENABLED] ?: true
    }

    val smsFallbackFlow: Flow<Boolean> = context.dataStore.data.map { preferences ->
        preferences[SMS_FALLBACK] ?: true
    }

    val trackingEnabled: Flow<Boolean> = trackingEnabledFlow
    val smsFallback: Flow<Boolean> = smsFallbackFlow

    val fcmToken: Flow<String?> = context.dataStore.data.map { preferences ->
        preferences[FCM_TOKEN]
    }

    val lastLocation: Flow<Pair<Double, Double>?> = context.dataStore.data.map { preferences ->
        val lat = preferences[LATITUDE]
        val lng = preferences[LONGITUDE]
        if (lat != null && lng != null) {
            Pair(lat, lng)
        } else {
            null
        }
    }

    suspend fun saveUser(user: User) {
        context.dataStore.edit { preferences ->
            preferences[USER_ID] = user.id
            preferences[USER_NAME] = user.name
            preferences[USER_PHONE] = user.phone
            preferences[USER_EMAIL] = user.email
            preferences[USER_ROLE] = user.role
            preferences[USER_DISTRICT] = user.district
            preferences[USER_STATE] = user.state
            preferences[USER_LANGUAGE] = user.language
        }
    }

    suspend fun clearUser() {
        context.dataStore.edit { preferences ->
            preferences.remove(USER_ID)
            preferences.remove(USER_NAME)
            preferences.remove(USER_PHONE)
            preferences.remove(USER_EMAIL)
            preferences.remove(USER_ROLE)
            preferences.remove(USER_DISTRICT)
            preferences.remove(USER_STATE)
            preferences.remove(USER_LANGUAGE)
        }
    }

    suspend fun setTrackingEnabled(enabled: Boolean) {
        context.dataStore.edit { preferences ->
            preferences[TRACKING_ENABLED] = enabled
        }
    }

    suspend fun setSmsFallback(enabled: Boolean) {
        context.dataStore.edit { preferences ->
            preferences[SMS_FALLBACK] = enabled
        }
    }

    suspend fun setFcmToken(token: String) {
        context.dataStore.edit { preferences ->
            preferences[FCM_TOKEN] = token
        }
    }

    suspend fun saveLocation(lat: Double, lng: Double) {
        context.dataStore.edit { preferences ->
            preferences[LATITUDE] = lat
            preferences[LONGITUDE] = lng
        }
    }
}