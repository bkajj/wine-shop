package models.responses

import kotlinx.serialization.Serializable

@Serializable
data class LoginResponse(
    val status: String,
    val message: String? = null,
    val token: String? = null
)