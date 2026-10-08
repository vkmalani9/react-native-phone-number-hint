package com.vkmalani.phonenumberhint

import com.facebook.react.BaseReactPackage
import com.facebook.react.bridge.NativeModule
import com.facebook.react.bridge.ReactApplicationContext
import com.facebook.react.module.model.ReactModuleInfo
import com.facebook.react.module.model.ReactModuleInfoProvider

class PhoneNumberHintPackage : BaseReactPackage() {
  override fun getModule(name: String, reactContext: ReactApplicationContext): NativeModule? {
    return if (name == PhoneNumberHintModule.NAME) {
      PhoneNumberHintModule(reactContext)
    } else {
      null
    }
  }

  override fun getReactModuleInfoProvider() =
    ReactModuleInfoProvider {
      mapOf(
        PhoneNumberHintModule.NAME to
          ReactModuleInfo(
            name = PhoneNumberHintModule.NAME,
            className = PhoneNumberHintModule.NAME,
            canOverrideExistingModule = false,
            needsEagerInit = false,
            isCxxModule = false,
            isTurboModule = true,
          )
      )
    }
}
