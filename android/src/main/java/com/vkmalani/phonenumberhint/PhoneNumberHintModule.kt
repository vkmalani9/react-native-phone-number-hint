package com.vkmalani.phonenumberhint

import android.app.Activity
import android.content.Intent
import android.os.Handler
import android.os.Looper
import com.facebook.react.bridge.BaseActivityEventListener
import com.facebook.react.bridge.Promise
import com.facebook.react.bridge.ReactApplicationContext
import com.google.android.gms.auth.api.identity.GetPhoneNumberHintIntentRequest
import com.google.android.gms.auth.api.identity.Identity
import com.google.android.gms.common.ConnectionResult
import com.google.android.gms.common.GoogleApiAvailability

class PhoneNumberHintModule(reactContext: ReactApplicationContext) :
  NativePhoneNumberHintSpec(reactContext) {

  private val main = Handler(Looper.getMainLooper())
  private var pending: Promise? = null
  private val requestTimeout = Runnable { finish(null) }

  private val listener =
    object : BaseActivityEventListener() {
      override fun onActivityResult(
        activity: Activity,
        requestCode: Int,
        resultCode: Int,
        data: Intent?,
      ) {
        if (requestCode != REQUEST_CODE || pending == null) return
        if (resultCode != Activity.RESULT_OK || data == null) {
          finish(null)
          return
        }
        try {
          finish(Identity.getSignInClient(activity).getPhoneNumberFromIntent(data))
        } catch (_: Exception) {
          finish(null)
        }
      }
    }

  init {
    reactContext.addActivityEventListener(listener)
  }

  override fun isAvailable(promise: Promise) {
    val activity = reactApplicationContext.currentActivity
    if (activity == null || activity.isFinishing || activity.isDestroyed) {
      promise.resolve(false)
      return
    }
    val available =
      GoogleApiAvailability.getInstance().isGooglePlayServicesAvailable(activity) ==
        ConnectionResult.SUCCESS
    promise.resolve(available)
  }

  override fun requestPhoneNumber(promise: Promise) {
    main.post {
      val activity = reactApplicationContext.currentActivity
      if (pending != null || activity == null || activity.isFinishing || activity.isDestroyed) {
        promise.resolve(null)
        return@post
      }
      pending = promise
      try {
        if (
          GoogleApiAvailability.getInstance().isGooglePlayServicesAvailable(activity) !=
            ConnectionResult.SUCCESS
        ) {
          finish(null)
          return@post
        }
        // Bound only fetching the intent, never time out while the user is choosing.
        main.postDelayed(requestTimeout, REQUEST_TIMEOUT_MS)
        Identity.getSignInClient(activity)
          .getPhoneNumberHintIntent(GetPhoneNumberHintIntentRequest.builder().build())
          .addOnSuccessListener { result ->
            if (pending !== promise) return@addOnSuccessListener
            main.removeCallbacks(requestTimeout)
            val current = reactApplicationContext.currentActivity
            if (current !== activity || activity.isFinishing || activity.isDestroyed) {
              finish(null)
              return@addOnSuccessListener
            }
            try {
              activity.startIntentSenderForResult(
                result.intentSender,
                REQUEST_CODE,
                null,
                0,
                0,
                0,
              )
            } catch (_: Exception) {
              finish(null)
            }
          }
          .addOnFailureListener {
            if (pending === promise) finish(null)
          }
      } catch (_: Exception) {
        finish(null)
      }
    }
  }

  private fun finish(number: String?) {
    main.removeCallbacks(requestTimeout)
    val promise = pending
    pending = null
    promise?.resolve(number)
  }

  override fun invalidate() {
    reactApplicationContext.removeActivityEventListener(listener)
    main.post { finish(null) }
    super.invalidate()
  }

  companion object {
    const val NAME = NativePhoneNumberHintSpec.NAME
    private const val REQUEST_CODE = 48371
    private const val REQUEST_TIMEOUT_MS = 10_000L
  }
}
