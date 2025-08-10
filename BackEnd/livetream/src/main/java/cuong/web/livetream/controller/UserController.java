package cuong.web.livetream.controller;

import cuong.web.livetream.dto.response.MemberResponse;
import cuong.web.livetream.dto.response.ResponseObject;
import cuong.web.livetream.service.UserService;
import io.swagger.v3.oas.annotations.security.SecurityRequirement;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import java.util.List;

@RestController
@RequestMapping("/api/users")
@SecurityRequirement(name = "api")
@RequiredArgsConstructor
public class UserController {
    private final UserService userService;

    @GetMapping
    public ResponseEntity<ResponseObject> getAllUsers(
            @RequestParam(defaultValue = "0") int page, @RequestParam(defaultValue = "10") int size) {
        List<MemberResponse> users = userService.getAllUsers(page, size);

        String message = users.isEmpty() ? "Empty list!" : "Get all users successfully";

        ResponseObject response = new ResponseObject(200, message, users);
        return ResponseEntity.ok(response);
    }
}
