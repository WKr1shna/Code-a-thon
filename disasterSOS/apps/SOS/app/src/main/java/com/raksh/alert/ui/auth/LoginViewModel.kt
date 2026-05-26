package com.raksh.alert.ui.auth

import androidx.lifecycle.ViewModel
import androidx.lifecycle.viewModelScope
import com.raksh.alert.data.remote.dto.LoginRequest
import com.raksh.alert.domain.usecase.LoginUseCase
import com.raksh.alert.utils.Result
import dagger.hilt.android.lifecycle.HiltViewModel
import kotlinx.coroutines.flow.MutableStateFlow
import kotlinx.coroutines.flow.asStateFlow
import kotlinx.coroutines.flow.collectLatest
import kotlinx.coroutines.launch
import javax.inject.Inject

@HiltViewModel
class LoginViewModel @Inject constructor(
    private val loginUseCase: LoginUseCase
) : ViewModel() {

    private val _loginState = MutableStateFlow<Result<com.raksh.alert.data.model.User>?>(null)
    val loginState = _loginState.asStateFlow()

    fun login(email: String, name: String) {
        if (email.isBlank() || name.isBlank()) {
            _loginState.value = Result.Error("Fields cannot be empty")
            return
        }

        viewModelScope.launch {
            val request = LoginRequest(email = email, password = name) // Using standard field bindings matching backend
            loginUseCase(request).collectLatest { result ->
                _loginState.value = result
            }
        }
    }

    fun resetState() {
        _loginState.value = null
    }
}
