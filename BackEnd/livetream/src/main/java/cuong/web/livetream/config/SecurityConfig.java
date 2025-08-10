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
                        // Cho phép CORS pre-flight requests
                        .requestMatchers(CorsUtils::isPreFlightRequest).permitAll()
                        
                        // Public endpoints - không cần authentication
                        .requestMatchers(
                                "/api/login",
                                "/api/register", 
                                "/api/refresh-token",
                                "/api/livestream/status",
                                "/api/livestream/viewer/join",
                                "/api/livestream/viewer/leave"
                        ).permitAll()
                        
                        // WebSocket endpoints - allow all websocket related paths  
                        .requestMatchers("/ws/**", "/ws**", "/info**", "/sockjs-node/**").permitAll()
                        .requestMatchers(HttpMethod.GET, "/ws/info**").permitAll()
                        .requestMatchers(HttpMethod.POST, "/ws/**").permitAll()
                        
                        // Swagger endpoints  
                        .requestMatchers("/swagger-ui/**", "/v3/api-docs/**").permitAll()
                        
                        // Movie public endpoints
                        .requestMatchers(HttpMethod.GET, 
                                "/api/movies/**",
                                "/api/foodCombos/getAll",
                                "/api/foodItems/getAll"
                        ).permitAll()
                        
                        // All other requests need authentication
                        .anyRequest().authenticated()
                )
                .userDetailsService(authenticationService)
                .sessionManagement(session -> session.sessionCreationPolicy(SessionCreationPolicy.STATELESS))
                .addFilterBefore(filter, UsernamePasswordAuthenticationFilter.class)
                .build();
    }
}
