package config

import io.github.cdimascio.dotenv.dotenv

object AppConfig {
    private val dotenv = dotenv { ignoreIfMissing = false }

    val jwtSecret: String = dotenv["JWT_SECRET"]
        ?: error("JWT_SECRET is not set in .env")

    val frontendUrl: String = dotenv["FRONTEND_URL"] ?: "http://localhost:3000"

    val googleClientId: String = dotenv["GOOGLE_CLIENT_ID"] ?: ""
    val googleClientSecret: String = dotenv["GOOGLE_CLIENT_SECRET"] ?: ""
    val githubClientId: String = dotenv["GIT_CLIENT_ID"] ?: ""
    val githubClientSecret: String = dotenv["GIT_CLIENT_SECRET"] ?: ""
}