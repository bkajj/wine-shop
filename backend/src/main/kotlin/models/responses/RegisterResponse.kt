package models.responses

import kotlinx.serialization.Serializable

@Serializable
data class RegisterResponse(
    val status: String,
    val message: String? = null,
    val userId: String? = null
)