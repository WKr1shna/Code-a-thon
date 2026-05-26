package com.raksh.alert.utils

import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale

fun Long.toTimeAgo(): String {
    val diff = System.currentTimeMillis() - this
    return when {
        diff < 60_000 -> "Just now"
        diff < 3600_000 -> "${diff / 60_000}m ago"
        diff < 86400_000 -> "${diff / 3600_000}h ago"
        else -> "${diff / 86400_000}d ago"
    }
}

fun Double.format(digits: Int) = String.format(Locale.US, "%.${digits}f", this)

fun Long.toDateString(): String {
    val sdf = SimpleDateFormat("dd MMM yyyy, hh:mm a", Locale.getDefault())
    return sdf.format(Date(this))
}
