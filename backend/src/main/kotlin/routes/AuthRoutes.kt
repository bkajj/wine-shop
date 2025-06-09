package routes

import com.auth0.jwt.JWT
import com.auth0.jwt.algorithms.Algorithm
import models.User
import models.requests.LoginRequest
import models.requests.RegisterRequest
import models.responses.LoginResponse
import models.responses.RegisterResponse
import io.ktor.server.application.*
import io.ktor.server.request.*
import io.ktor.server.response.*
import io.ktor.server.routing.*
import java.util.*
import java.util.concurrent.ConcurrentHashMap

val userDB = ConcurrentHashMap<String, User>()

fun generateToken(user: User): String {
    val jwtIssuer = "WineShop"
    val jwtAudience = "WineShopAudience"
    val jwtSecret = "supersecretkey"
    val expirationTime = System.currentTimeMillis() + 24 * 60 * 60 * 1000 // 24h

    return JWT.create()
        .withIssuer(jwtIssuer)
        .withAudience(jwtAudience)
        .withClaim("userId", user.id)
        .withClaim("username", user.username)
        .withClaim("email", user.email)
        .withClaim("password", user.password)
        .withExpiresAt(Date(expirationTime))
        .sign(Algorithm.HMAC256(jwtSecret))
}

fun Route.authRoutes() {

    post("/register") {
        val data = call.receive<RegisterRequest>()

        val existingUser = userDB.values.find {
            it.email == data.email || it.username == data.username
        }

        if (existingUser != null) {
            call.respond(RegisterResponse(status = "error", message = "Użytkownik już istnieje"))
            return@post
        }

        val user = User(
            id = UUID.randomUUID().toString(),
            username = data.username,
            email = data.email,
            password = data.password
        )

        println("Zarejestrowano użytkownika - username: ${data.username}, haslo: ${data.password}")

        userDB[user.id] = user
        call.respond(RegisterResponse(status = "success", userId = user.id))
    }

    post("/login") {
        val data = call.receive<LoginRequest>()

        val user = userDB.values.find {
            it.username == data.username && it.password == data.password
        }

        if (user == null) {
            call.respond(LoginResponse(status = "error", message = "Nieprawidłowe dane logowania"))
        } else {
            val token = generateToken(user)
            call.respond(LoginResponse(status = "success", token = token))
        }
    }
}
