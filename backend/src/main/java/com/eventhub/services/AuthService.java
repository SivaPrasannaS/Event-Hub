package com.eventhub.services;

import com.eventhub.dto.JwtResponse;
import com.eventhub.dto.LoginRequest;
import com.eventhub.dto.SignupRequest;
import com.eventhub.enums.ERole;
import com.eventhub.models.AuditLog;
import com.eventhub.models.Role;
import com.eventhub.models.User;
import com.eventhub.repositories.AuditLogRepository;
import com.eventhub.repositories.RoleRepository;
import com.eventhub.repositories.UserRepository;
import java.util.List;
import java.util.Map;
import java.util.Set;
import java.util.stream.Collectors;
import org.springframework.security.authentication.AuthenticationManager;
import org.springframework.security.authentication.BadCredentialsException;
import org.springframework.security.authentication.DisabledException;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

@Service
@Transactional
public class AuthService {
    private final AuthenticationManager authenticationManager;
    private final UserRepository userRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;
    private final JwtService jwtService;
    private final AuditLogRepository auditLogRepository;

    public AuthService(AuthenticationManager authenticationManager, UserRepository userRepository, RoleRepository roleRepository,
                       PasswordEncoder passwordEncoder, JwtService jwtService, AuditLogRepository auditLogRepository) {
        this.authenticationManager = authenticationManager;
        this.userRepository = userRepository;
        this.roleRepository = roleRepository;
        this.passwordEncoder = passwordEncoder;
        this.jwtService = jwtService;
        this.auditLogRepository = auditLogRepository;
    }

    public JwtResponse register(SignupRequest request) {
        if (userRepository.existsByUsername(request.getUsername())) {
            throw new IllegalStateException("Username already exists");
        }
        Role role = roleRepository.findByName(ERole.ROLE_USER).orElseThrow();
        User user = User.builder()
            .username(request.getUsername().trim())
            .password(passwordEncoder.encode(request.getPassword()))
            .active(true)
            .roles(Set.of(role))
            .build();
        userRepository.save(user);
        auditLogRepository.save(AuditLog.builder()
            .action("REGISTER")
            .username(user.getUsername())
            .details("User registered")
            .build());
        return createJwtResponse(user);
    }

    public JwtResponse login(LoginRequest request) {
        try {
            authenticationManager.authenticate(new UsernamePasswordAuthenticationToken(request.getUsername(), request.getPassword()));
        } catch (BadCredentialsException ex) {
            throw ex;
        } catch (DisabledException ex) {
            throw new BadCredentialsException("User account is deactivated");
        }
        User user = userRepository.findByUsername(request.getUsername()).orElseThrow(() -> new BadCredentialsException("Invalid credentials"));
        if (!Boolean.TRUE.equals(user.getActive())) {
            throw new BadCredentialsException("User account is deactivated");
        }
        auditLogRepository.save(AuditLog.builder()
            .action("LOGIN")
            .username(user.getUsername())
            .details("User logged in")
            .build());
        return createJwtResponse(user);
    }

    public Map<String, String> refresh(Map<String, String> payload) {
        String refreshToken = payload.get("refreshToken");
        if (refreshToken == null || !jwtService.isTokenValid(refreshToken) || !jwtService.isRefreshToken(refreshToken)) {
            throw new BadCredentialsException("Invalid refresh token");
        }
        String username = jwtService.extractUsername(refreshToken);
        User user = userRepository.findByUsername(username).orElseThrow(() -> new BadCredentialsException("Invalid refresh token"));
        return Map.of("accessToken", jwtService.generateAccessToken(user.getUsername()));
    }

    private JwtResponse createJwtResponse(User user) {
        List<String> roles = user.getRoles().stream().map(role -> role.getName().name()).collect(Collectors.toList());
        return JwtResponse.builder()
            .id(user.getId())
            .username(user.getUsername())
            .roles(roles)
            .accessToken(jwtService.generateAccessToken(user.getUsername()))
            .refreshToken(jwtService.generateRefreshToken(user.getUsername()))
            .tokenType("Bearer")
            .active(user.getActive())
            .build();
    }
}
