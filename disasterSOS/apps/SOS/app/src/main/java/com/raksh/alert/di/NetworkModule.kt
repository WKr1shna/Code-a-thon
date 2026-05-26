package com.raksh.alert.di

import android.content.Context
import com.raksh.alert.data.remote.NetworkClient
import com.raksh.alert.data.remote.api.AlertApi
import com.raksh.alert.data.remote.api.AuthApi
import com.raksh.alert.data.remote.api.ResourceApi
import com.raksh.alert.data.remote.api.SosApi
import com.raksh.alert.data.remote.api.VolunteerApi
import com.raksh.alert.utils.Constants
import dagger.Module
import dagger.Provides
import dagger.hilt.InstallIn
import dagger.hilt.android.qualifiers.ApplicationContext
import dagger.hilt.components.SingletonComponent
import retrofit2.Retrofit
import javax.inject.Singleton

@Module
@InstallIn(SingletonComponent::class)
object NetworkModule {

    @Provides
    @Singleton
    fun provideRetrofit(@ApplicationContext context: Context): Retrofit {
        return NetworkClient.getRetrofit(context, Constants.BASE_URL)
    }

    @Provides
    @Singleton
    fun provideAuthApi(retrofit: Retrofit): AuthApi {
        return retrofit.create(AuthApi::class.java)
    }

    @Provides
    @Singleton
    fun provideSosApi(retrofit: Retrofit): SosApi {
        return retrofit.create(SosApi::class.java)
    }

    @Provides
    @Singleton
    fun provideAlertApi(retrofit: Retrofit): AlertApi {
        return retrofit.create(AlertApi::class.java)
    }

    @Provides
    @Singleton
    fun provideResourceApi(retrofit: Retrofit): ResourceApi {
        return retrofit.create(ResourceApi::class.java)
    }

    @Provides
    @Singleton
    fun provideVolunteerApi(retrofit: Retrofit): VolunteerApi {
        return retrofit.create(VolunteerApi::class.java)
    }
}
