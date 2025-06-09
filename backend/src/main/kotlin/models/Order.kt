package models

import kotlinx.serialization.Serializable

@Serializable
data class Order(
    val userId: String,
    val firstName: String,
    val lastName: String,
    val homeAddress: String,
    val phone: String,
    val cart: List<CartItem>,
    val total: Double
)