package cuong.web.livetream.config;

import cuong.web.livetream.service.AuthenticationService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Lazy;
import org.springframework.http.HttpMethod;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.authentication.configuration.AuthenticationConfiguration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.web.cors.CorsUtils;

@Configuration
public class SecurityConfig {

    private final AuthenticationService authenticationService;
    private final Filter filter;

    @Lazy
    @Autowired
    public SecurityConfig(AuthenticationService authenticationService, Filter filter) {
        this.authenticationService = authenticationService;
        this.filter = filter;
    }

    @Bean
    public PasswordEncoder passwordEncoder() {
        return new BCryptPasswordEncoder();
    }

    @Bean
    public AuthenticationManager authenticationManager(AuthenticationConfiguration authenticationConfiguration)
            throws Exception {
        return authenticationConfiguration.getAuthenticationManager();
    }

    @Bean
    public SecurityFilterChain securityFilterChain(
            HttpSecurity http)
            throws Exception {
        return http.cors(Customizer.withDefaults())
                .csrf(AbstractHttpConfigurer::disable)
                .authorizeHttpRequests(auth -> auth

                        // Cho phép truy cập các endpoint công khai
                        .requestMatchers(CorsUtils::isPreFlightRequest)
                        .permitAll() // Cho phép CORS pre-flight requests
                        .requestMatchers(
                                "/api/login",
                                "/api/google-login",
                                "/api/facebook-login",
                                "/api/register",
                                "/api/refresh-token",
                                "/api/forgot-password",
                                "/api/reset-password",
                                "/api/verify",
                                "/api/chat-with-guest"
                                )
                        .permitAll() // Các endpoint không cần xác thực
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**", "/swagger-resources/**")
                        .permitAll() // Cho phép truy cập Swagger
                        .requestMatchers(
                                "/api/promotions/available", "/api/payment/vnpay-return", "/api/payment/vnpay-ipn")
                        .permitAll()
                        .requestMatchers("/login/oauth2/code/google")
                        .permitAll()
                        .requestMatchers("/login/oauth2/code/facebook")
                        .permitAll() // Cho phép OAuth2 redirect URI
                        .requestMatchers(
                                "/api/promotions/UpcomingOrAvailable",
                                "/api/movie-blogs/coming-soon",
                                "/api/movie-blogs/reviews",
                                "/api/movie-blogs/now-showing",
                                "/api/promotions/Available",
                                "/api/promotions/getAvailableById/**",
                                "/api/feedbacks/movie/{movieId}",
                                "/api/users/{userId}/username")
                        .permitAll()
                        .requestMatchers(
                                "/api/promotions/UpcomingOrAvailable",
                                "/api/movie-blogs/coming-soon",
                                "/api/movie-blogs/reviews",
                                "/api/movie-blogs/now-showing",
                                "/api/promotions/Available",
                                "/api/promotions/getAvailableById/**")
                        .permitAll()
                        .requestMatchers(
                                HttpMethod.GET,
                                "/api/movies/comingSoon",
                                "/api/movies/upcomingMovies",
                                "/api/movies/topBookedMovies",
                                "/api/movies/search",
                                "/api/movies/showtimes",
                                "/api/movies/detail/**",
                                "/api/foodCombos/getAll")
                        .permitAll() // Các endpoint GET không cần xác thực
                        .requestMatchers("/api/showtime-details/date/**")
                        .permitAll()
                        .requestMatchers("/api/foodItems/getAll")
                        .permitAll()
                        .requestMatchers("/api/foodCombos/getAll")
                        .permitAll()
                        .requestMatchers("/api/booking/public/**").permitAll() // Cho phép truy cập public endpoint không cần xác thực

                        // Tất cả các request khác cần xác thực
                        .anyRequest()
                        .authenticated())
                .userDetailsService(authenticationService)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(filter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }
}
