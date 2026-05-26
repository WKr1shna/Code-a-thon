package com.raksh.alert

import android.app.Application
import androidx.hilt.work.HiltWorkerFactory
import androidx.work.Configuration
import dagger.hilt.android.HiltAndroidApp
import javax.inject.Inject

import com.google.firebase.FirebaseApp
import com.google.firebase.FirebaseOptions

@HiltAndroidApp
class RakshAlertApp : Application(), Configuration.Provider {

    @Inject
    lateinit var workerFactory: HiltWorkerFactory

    override fun onCreate() {
        super.onCreate()
        try {
            val options = FirebaseOptions.Builder()
                .setApplicationId("1:118619039330:android:9413e557fad4ca4fc7933b")
                .setApiKey("AIzaSyDp6KrPmewEZDqkpBed4QZu78GGLalnelA")
                .setProjectId("kuchnahi-2c378")
                .setGcmSenderId("118619039330")
                .setStorageBucket("kuchnahi-2c378.firebasestorage.app")
                .build()
            
            FirebaseApp.initializeApp(this, options)
        } catch (e: Exception) {
            e.printStackTrace()
        }
    }

    override val workManagerConfiguration: Configuration
        get() = Configuration.Builder()
            .setWorkerFactory(workerFactory)
            .build()
}
