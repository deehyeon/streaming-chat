package com.example.munglogbackend.config;

import com.example.munglogbackend.adapter.security.jwt.JwtAuthenticationFilter;
import com.example.munglogbackend.adapter.security.oauth.CustomOAuth2UserService;
import com.example.munglogbackend.adapter.security.oauth.OAuth2LoginSuccessHandler;
import jakarta.servlet.http.HttpServletResponse;
import lombok.RequiredArgsConstructor;
import org.springframework.context.annotation.Bean;
import org.springframework.http.HttpMethod;
import org.springframework.security.config.Customizer;
import org.springframework.security.config.annotation.web.builders.HttpSecurity;
import org.springframework.security.config.annotation.web.configuration.EnableWebSecurity;
import org.springframework.security.config.annotation.web.configurers.AbstractHttpConfigurer;
import org.springframework.security.config.http.SessionCreationPolicy;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.security.web.SecurityFilterChain;
import org.springframework.security.web.authentication.UsernamePasswordAuthenticationFilter;
import org.springframework.stereotype.Component;

@Component
@EnableWebSecurity
@RequiredArgsConstructor
public class SecurityConfig {
    private final JwtAuthenticationFilter jwtAuthenticationFilter;
    private final CustomOAuth2UserService customOAuth2UserService;
    private final OAuth2LoginSuccessHandler oAuth2LoginSuccessHandler;

    @Bean
    public SecurityFilterChain filterChain(HttpSecurity httpSecurity) throws Exception {
        httpSecurity.csrf(AbstractHttpConfigurer::disable) // REST API에서는 CSRF 보호 불필요 (세션을 쓰지 않으므로)
                .httpBasic(AbstractHttpConfigurer::disable) // 브라우저에서 뜨는 기본 인증 팝업을 막음
                .cors(Customizer.withDefaults())
                .formLogin(AbstractHttpConfigurer::disable) // 로그인 form 비활성화 (우린 토큰 기반이니까)
                .sessionManagement(configure -> configure.sessionCreationPolicy(SessionCreationPolicy.STATELESS)) // JWT 기반 인증이므로 세션을 아예 생성하지 않음
                .exceptionHandling(exception -> exception
                        .authenticationEntryPoint((request, response, authException) -> {
                            // OAuth2 자동 리다이렉트를 방지하고 401 에러 반환
                            response.setStatus(HttpServletResponse.SC_UNAUTHORIZED);
                            response.setContentType("application/json;charset=UTF-8");
                            response.getWriter().write(
                                    "{\"error\":\"Unauthorized\",\"message\":\"Authentication required\"}"
                            );
                        })
                )
                .authorizeHttpRequests(authorize ->
                        authorize
                                .requestMatchers(HttpMethod.OPTIONS, "/v1/**", "/**").permitAll()
                                .requestMatchers(
                                        "/connect/**",
                                        "/publish/**"
                                ).permitAll()
                                .requestMatchers(
                                        "/swagger-ui.html",
                                        "/swagger-ui/**",
                                        "/v1/api-docs/**",
                                        "/v3/api-docs/**"
                                        ).permitAll()
                                .requestMatchers(
                                        "/oauth2/**",
                                        "/login/oauth2/**",
                                        "/login-success"
                                ).permitAll()
                                .requestMatchers(
                                        "/v1/auth/signup/**",
                                        "/actuator/health/readiness",
                                        "/actuator/health/liveness",
                                        "/v1/auth/login"
                                ).permitAll()
                                .anyRequest().authenticated()
                )
                // OAuth2 로그인은 명시적 경로로만 시작
                .oauth2Login(oauth -> oauth
                        .loginPage("/oauth2/authorization/google")  // 명시적 로그인 페이지 설정
                        .userInfoEndpoint(userInfo -> userInfo
                                .userService(customOAuth2UserService)
                        )
                        .successHandler(oAuth2LoginSuccessHandler)
                ).addFilterBefore(jwtAuthenticationFilter, UsernamePasswordAuthenticationFilter.class);
        return httpSecurity.build();
    }
}
