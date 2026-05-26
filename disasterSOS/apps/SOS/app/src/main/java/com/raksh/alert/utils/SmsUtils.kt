package com.raksh.alert.utils

import android.content.Context
import android.content.pm.PackageManager
import android.telephony.SmsManager
import androidx.core.content.ContextCompat

object SmsUtils {
    fun sendSms(context: Context, phoneNumber: String, message: String): Boolean {
        return try {
            if (ContextCompat.checkSelfPermission(context, android.Manifest.permission.SEND_SMS) == PackageManager.PERMISSION_GRANTED) {
                val smsManager = context.getSystemService(SmsManager::class.java) ?: SmsManager.getDefault()
                smsManager.sendTextMessage(phoneNumber, null, message, null, null)
                true
            } else {
                false
            }
        } catch (e: Exception) {
            e.printStackTrace()
            false
        }
    }
}
