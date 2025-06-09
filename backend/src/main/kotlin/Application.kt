import com.auth0.jwt.JWT
import io.ktor.server.application.*
import io.ktor.server.engine.*
import io.ktor.server.netty.*
import io.ktor.server.routing.*
import io.ktor.server.plugins.contentnegotiation.ContentNegotiation as ServerContentNegotiation
import io.ktor.client.plugins.contentnegotiation.ContentNegotiation as ClientContentNegotiation
import io.ktor.serialization.kotlinx.json.*
import io.ktor.server.plugins.cors.routing.*
import io.ktor.server.response.*
import io.ktor.server.auth.*
import io.ktor.server.auth.jwt.*
import com.auth0.jwt.algorithms.Algorithm
import io.ktor.client.*
import io.ktor.client.engine.cio.*
import io.ktor.http.*
import io.ktor.client.call.body
import io.ktor.server.sessions.*
import kotlinx.serialization.Serializable
import io.github.cdimascio.dotenv.dotenv
import io.ktor.client.request.*
import io.ktor.server.routing.header
import kotlinx.serialization.json.*
import models.User
import models.UserInfo

import routes.authRoutes
import routes.generateToken
import routes.productRoutes

@Serializable
data class UserSession(val state: String, val token: String)

val applicationHttpClient = HttpClient(CIO) {
    install(ClientContentNegotiation) {
        json(Json {
            ignoreUnknownKeys = true
        })
    }
}

val redirects = mutableMapOf<String, String>()

fun main() {
    embeddedServer(Netty, port = 8080, host = "0.0.0.0", module = Application::module).start(wait = true)
}

fun Application.module() {
    install(ServerContentNegotiation) {
        json()
    }
    install(CORS) {
        anyHost()
        allowHeader(HttpHeaders.ContentType)
        allowHeader(HttpHeaders.Authorization)
        allowMethod(HttpMethod.Post)
        allowMethod(HttpMethod.Options)
    }
    install(Sessions) {
        cookie<UserSession>("user_session")
    }

    configureAuth()
    routing {
        authRoutes()
        productRoutes()
        authenticate("auth-oauth-google") {
            get("/login-google") {
                // Redirects to 'authorizeUrl' automatically
            }

            get("/callback") {
                val currentPrincipal: OAuthAccessTokenResponse.OAuth2? = call.principal()
                currentPrincipal?.let { principal ->
                    principal.state?.let { state ->
                        val accessToken = principal.accessToken

                        val response = applicationHttpClient.get("https://www.googleapis.com/oauth2/v2/userinfo") {
                            header(HttpHeaders.Authorization, "Bearer $accessToken")
                        }
                        val userInfo: UserInfo = response.body()

                        val user = User(
                            id = userInfo.id,
                            username = userInfo.email,
                            email = userInfo.email,
                            password = ""
                        )

                        val jwtToken = generateToken(user)

                        call.sessions.set(UserSession(state, accessToken))

                        redirects[state]?.let { redirect ->
                            val redirectWithToken = "$redirect?token=$jwtToken"
                            call.respondRedirect(redirectWithToken)
                            return@get
                        }
                    }
                }
                call.respondRedirect("/")
            }
        }
        authenticate("auth-oauth-github") {
            get("/login-github") {
            }

            get("/login-github/callback") {
                val principal: OAuthAccessTokenResponse.OAuth2? = call.principal()
                if (principal == null) {
                    call.respondRedirect("/login?error=github_auth_failed")
                    return@get
                }

                val accessToken = principal.accessToken

                val userResponse = applicationHttpClient.get("https://api.github.com/user") {
                    header(HttpHeaders.Authorization, "Bearer $accessToken")
                    header(HttpHeaders.Accept, "application/json")
                }
                val userJson = userResponse.body<JsonElement>()

                val login = userJson.jsonObject["login"]?.jsonPrimitive?.content ?: "unknown"
                val id = userJson.jsonObject["id"]?.jsonPrimitive?.int ?: 0
                val emailResponse = applicationHttpClient.get("https://api.github.com/user/emails") {
                    header(HttpHeaders.Authorization, "Bearer $accessToken")
                    header(HttpHeaders.Accept, "application/json")
                }

                val emailsJson = emailResponse.body<List<JsonElement>>()
                val primaryEmail = emailsJson.firstOrNull {
                    it.jsonObject["primary"]?.jsonPrimitive?.booleanOrNull == true
                }?.jsonObject?.get("email")?.jsonPrimitive?.content ?: ""

                val user = User(
                    id = id.toString(),
                    username = login,
                    email = primaryEmail,
                    password = ""
                )
                val jwtToken = generateToken(user)

                val state = principal.state ?: ""

                if (state.isNotEmpty() && redirects.containsKey(state)) {
                    val redirectUrl = redirects[state] + "?token=$jwtToken"
                    call.respondRedirect(redirectUrl)
                } else {
                    call.respondRedirect("http://localhost:3000/?token=$jwtToken")
                }
            }
        }

        authenticate("auth-jwt") {
            get("/protected") {
                call.respondText("Dostęp do chronionej trasy przyznany!")
            }
        }
    }
}

fun Application.configureAuth() {
    val jwtIssuer = environment.config.propertyOrNull("jwt.issuer")?.getString() ?: "WineShop"
    val jwtAudience = environment.config.propertyOrNull("jwt.audience")?.getString() ?: "WineShopAudience"
    val jwtSecret = environment.config.propertyOrNull("jwt.secret")?.getString() ?: "supersecretkey"

    install(Authentication) {
        jwt("auth-jwt") {
            realm = "ktor-sample-app"
            verifier(
                JWT.require(Algorithm.HMAC256(jwtSecret))
                    .withIssuer(jwtIssuer)
                    .withAudience(jwtAudience)
                    .build()
            )
            validate { credential ->
                if (credential.payload.getClaim("username").asString()
                        .isNotEmpty()
                ) JWTPrincipal(credential.payload) else null
            }
        }
        oauth("auth-oauth-google") {
            val dotenv = dotenv {
                ignoreIfMissing = false
            }
            urlProvider = { "http://localhost:8080/callback" }
            providerLookup = {
                OAuthServerSettings.OAuth2ServerSettings(
                    name = "google",
                    authorizeUrl = "https://accounts.google.com/o/oauth2/auth",
                    accessTokenUrl = "https://accounts.google.com/o/oauth2/token",
                    requestMethod = HttpMethod.Post,
                    clientId = dotenv["GOOGLE_CLIENT_ID"],
                    clientSecret = dotenv["GOOGLE_CLIENT_SECRET"],
                    defaultScopes = listOf(
                        "https://www.googleapis.com/auth/userinfo.profile",
                        "https://www.googleapis.com/auth/userinfo.email"),
                    extraAuthParameters = listOf("access_type" to "offline"),
                    onStateCreated = { call, state ->
                        //saves new state with redirect url value
                        call.request.queryParameters["redirectUrl"]?.let {
                            redirects[state] = it
                        }
                    }
                )
            }
            client = applicationHttpClient
        }
        oauth("auth-oauth-github") {
            val dotenv = dotenv {
                ignoreIfMissing = false
            }
            urlProvider = { "http://localhost:8080/login-github/callback" }
            providerLookup = {
                OAuthServerSettings.OAuth2ServerSettings(
                    name = "github",
                    authorizeUrl = "https://github.com/login/oauth/authorize",
                    accessTokenUrl = "https://github.com/login/oauth/access_token",
                    requestMethod = HttpMethod.Post,
                    clientId = dotenv["GITHUB_CLIENT_ID"],
                    clientSecret = dotenv["GITHUB_CLIENT_SECRET"],
                    defaultScopes = listOf("read:user", "user:email")
                )
            }
            client = applicationHttpClient
        }

    }
}