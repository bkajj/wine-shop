package models.responses

import kotlinx.serialization.Serializable

@Serializable
data class UserResponse(
    val id: String,
    val username: String,
    val email: String,
    val fullName: String,
    val phoneNumber: String
)