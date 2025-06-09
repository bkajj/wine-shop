package models

import kotlinx.serialization.Serializable

@Serializable
data class UserInfo(
    val id: String,
    val email: String,
    val name: String,
    val picture: String? = null
)