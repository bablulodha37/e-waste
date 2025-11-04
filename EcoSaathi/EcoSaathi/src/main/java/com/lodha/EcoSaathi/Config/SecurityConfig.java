package com.lodha.EcoSaathi.Config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.web.SecurityFilterChain;

@Configuration
public class SecurityConfig {

    @Bean
    public SecurityFilterChain securityFilterChain(HttpSecurity http) throws Exception {
        http
                .csrf(csrf -> csrf.disable()) // Disable CSRF for API testing
                .authorizeHttpRequests(auth -> auth
                        .requestMatchers("/api/auth/**").permitAll() // Allow register, login, etc.
                        .requestMatchers("/api/admin/**").permitAll() // Secure this with .hasRole("ADMIN") later!

                        //  Allow public access to the image serving endpoint
                        .requestMatchers("/images/**").permitAll()

                        .anyRequest().authenticated()
                );
        return http.build();
    }
}