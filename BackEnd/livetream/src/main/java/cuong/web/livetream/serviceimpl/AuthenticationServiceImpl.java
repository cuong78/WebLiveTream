package cuong.web.livetream.serviceimpl;


import cuong.web.livetream.dto.request.LoginRequest;
import cuong.web.livetream.dto.response.UserResponse;
import cuong.web.livetream.entity.RefreshToken;
import cuong.web.livetream.entity.User;
import cuong.web.livetream.exception.exceptions.BadRequestException;
import cuong.web.livetream.mapper.UserMapper;
import cuong.web.livetream.repository.UserRepository;
import cuong.web.livetream.service.AuthenticationService;
import cuong.web.livetream.service.RefreshTokenService;
import cuong.web.livetream.service.TokenService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;

import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.security.authentication.*;
import org.springframework.security.core.Authentication;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.security.core.userdetails.UsernameNotFoundException;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.*;

@Service
@Slf4j
@RequiredArgsConstructor
public class AuthenticationServiceImpl implements AuthenticationService {

    @Autowired
    UserRepository userRepository;
    @Autowired
    PasswordEncoder passwordEncoder;
    @Autowired
    AuthenticationManager authenticationManager;
    @Autowired
    TokenService tokenService;
    @Autowired
    RefreshTokenService refreshTokenService;
    @Autowired
    UserMapper userMapper;




    @Override
    public UserResponse login(LoginRequest loginRequest) {
        try {
            authenticationManager.authenticate(
                    new UsernamePasswordAuthenticationToken(loginRequest.getUsername(), loginRequest.getPassword()));
            User user = userRepository
                    .findByUsername(loginRequest.getUsername())
                    .orElseThrow(() -> new UsernameNotFoundException("User not found"));

            if (!user.isVerify()) {
                throw new DisabledException("Account not verified. Please check your email.");
            }

        } catch (BadCredentialsException e) {
            // Fixed: Preserve stack trace
            throw new BadRequestException("Username/ password is invalid. Please try again!", e);
        } catch (LockedException e) {
            // Fixed: Preserve stack trace
            throw new BadRequestException("Account has been locked!", e);
        } catch (Exception e) {
            // Fixed: Preserve stack trace
            throw new BadRequestException("Login failed: " + e.getMessage(), e);
        }

        User user = userRepository
                .findByUsername(loginRequest.getUsername())
                .orElseThrow(() -> new UsernameNotFoundException("User not found after authentication"));

        // Tạo authentication với authorities từ permissions
        Authentication authentication =
                new UsernamePasswordAuthenticationToken(user.getUsername(), null, user.getAuthorities());
        SecurityContextHolder.getContext().setAuthentication(authentication);

        RefreshToken refreshToken = refreshTokenService.createRefreshToken(user);
        String token = tokenService.generateToken(user);

        return UserMapper.toResponse(user, token, refreshToken.getToken());
    }

    @Override
    public UserDetails loadUserByUsername(String username) throws UsernameNotFoundException {
        return userRepository
                .findByUsername(username)
                .orElseThrow(() -> new UsernameNotFoundException("Account not found"));
    }

}