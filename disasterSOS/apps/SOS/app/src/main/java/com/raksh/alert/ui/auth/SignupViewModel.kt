package com.raksh.alert.ui.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.raksh.alert.data.remote.dto.SignupRequest
import com.raksh.alert.domain.usecase.SignupUseCase
import com.raksh.alert.utils.Result
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class SignupViewModel @Inject constructor(
    private val signupUseCase: SignupUseCase
) : ViewModel() {

    private val _signupState = MutableStateFlow<Result<com.raksh.alert.data.model.User>?>(null)
    val signupState = _signupState.asStateFlow()

    fun signup(
        name: String,
        email: String,
        phone: String,
        password: String,
        role: String,
        district: String,
        language: String
    ) {
        if (name.isBlank() || email.isBlank() || phone.isBlank() || password.isBlank() || district.isBlank()) {
            _signupState.value = Result.Error("All fields must be filled out")
            return
        }

        viewModelScope.launch {
            val request = SignupRequest(
                name = name,
                email = email,
                phone = phone,
                password = password,
                role = role.lowercase(),
                district = district,
                language = language
            )
            signupUseCase(request).collectLatest { result ->
                _signupState.value = result
            }
        }
    }

    fun resetState() {
        _signupState.value = null
    }
}
