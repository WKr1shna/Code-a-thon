package com.raksh.alert.domain.usecase

import com.raksh.alert.data.model.User
import com.raksh.alert.data.remote.dto.LoginRequest
import com.raksh.alert.data.repository.AuthRepository
import com.raksh.alert.utils.Result
import kotlinx.coroutines.flow.Flow
import javax.inject.Inject

class LoginUseCase @Inject constructor(
    private val authRepository: AuthRepository
) {
    suspend operator fun invoke(request: LoginRequest): Flow<Result<User>> {
        return authRepository.login(request)
    }
}
