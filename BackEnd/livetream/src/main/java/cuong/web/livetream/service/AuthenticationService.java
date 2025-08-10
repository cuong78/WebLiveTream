package cuong.web.livetream.service;


import cuong.web.livetream.dto.request.LoginRequest;
import cuong.web.livetream.dto.response.UserResponse;
import org.springframework.security.core.userdetails.UserDetailsService;

public interface AuthenticationService extends UserDetailsService {

    UserResponse login(LoginRequest loginRequest);

}
