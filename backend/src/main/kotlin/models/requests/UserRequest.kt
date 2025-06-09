package models.requests

import kotlinx.serialization.Serializable

@Serializable
data class UserRequest(
    val username: String,
    val email: String,
    val fullName: String,
    val phoneNumber: String
)