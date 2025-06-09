package models.requests

import kotlinx.serialization.Serializable
import models.CartItem

@Serializable
data class PaymentRequest(
    val firstName: String,
    val lastName: String,
    val homeAddress: String,
    val phone: String,
    val cart: List<CartItem>,
    val total: Double
)