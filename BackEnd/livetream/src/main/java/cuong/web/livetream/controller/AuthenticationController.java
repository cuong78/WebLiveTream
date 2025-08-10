package cuong.web.livetream.controller;

import cuong.web.livetream.dto.request.LoginRequest;
import cuong.web.livetream.dto.response.ResponseObject;
import cuong.web.livetream.dto.response.UserResponse;
import cuong.web.livetream.exception.exceptions.BadRequestException;
import cuong.web.livetream.exception.exceptions.ForbiddenException;
import cuong.web.livetream.service.AuthenticationService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

@RestController
@RequestMapping("api")
@RequiredArgsConstructor
public class AuthenticationController {

    private static final String ACCOUNT_LOCKED_MESSAGE = "Account has been locked!";
    private static final String LOGIN_SUCCESSFUL = "Login successful";
    private final AuthenticationService authenticationService;
    @PostMapping("/login")
    public ResponseEntity<ResponseObject> login(@RequestBody LoginRequest loginRequest) {
        try {
            UserResponse userResponse = authenticationService.login(loginRequest);
            return ResponseEntity.ok()
                    .body(new ResponseObject(HttpStatus.OK.value(), LOGIN_SUCCESSFUL, userResponse));
        } catch (RuntimeException e) {
            // Fixed: Position literals first in String comparisons
            if (ACCOUNT_LOCKED_MESSAGE.equals(e.getMessage())) {
                // Fixed: Preserve stack trace
                throw new ForbiddenException(e.getMessage(), e);
            }
            // Fixed: Preserve stack trace
            throw new BadRequestException(e.getMessage(), e);
        }
    }

}