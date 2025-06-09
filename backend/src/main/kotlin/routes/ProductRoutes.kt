package routes

import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import com.auth0.jwt.interfaces.DecodedJWT
import io.ktor.http.*
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import kotlinx.serialization.json.Json
import models.Product
import models.Order
import models.requests.PaymentRequest
import models.responses.UserResponse

val products = listOf(
    Product(1, "Wino Czerwone", 49.99),
    Product(2, "Wino Białe", 39.99),
    Product(3, "Wino Różowe", 44.99),
)

fun parseJwt(token: String?): DecodedJWT? {
    return try {
        val jwtSecret = "supersecretkey"
        val algorithm = Algorithm.HMAC256(jwtSecret)

        JWT.require(algorithm)
            .withIssuer("WineShop")
            .build()
            .verify(token)
    } catch (e: Exception) {
        println("Błąd dekodowania tokena: ${e.message}")
        null
    }
}

fun Route.productRoutes() {

    get("/products") {
        call.respond(products)
    }

    post("/payment") {
        val token = call.request.headers["Authorization"]?.replace("Bearer ", "")
        val decoded = parseJwt(token)
        val decodedUserId = decoded?.getClaim("userId")?.asString()

        if (decodedUserId == null) {
            call.respond(HttpStatusCode.Unauthorized, "Niepoprawny token JWT - brak ID użytkownika.")
            return@post
        }

        val orderRequest = call.receive<PaymentRequest>()
        val order = Order(
            userId = decodedUserId,
            firstName = orderRequest.firstName,
            lastName = orderRequest.lastName,
            homeAddress = orderRequest.homeAddress,
            phone = orderRequest.phone,
            cart = orderRequest.cart,
            total = orderRequest.total
        )

        println("Złożono zamówienie: $order")
        call.respond(HttpStatusCode.OK, mapOf("message" to "Zamówienie zostało złożone"))
    }
}
