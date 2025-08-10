package cuong.web.livetream.mapper;


import cuong.web.livetream.dto.response.MemberResponse;
import cuong.web.livetream.dto.response.UserInfoResponse;
import cuong.web.livetream.dto.response.UserResponse;
import cuong.web.livetream.entity.User;
import org.springframework.stereotype.Component;

import java.util.stream.Collectors;

@Component
public class UserMapper {
    public MemberResponse toUserResponse(User user) {
        return MemberResponse.builder()
                .userId(user.getUserId())
                .username(user.getUsername())
                .roles(user.getRoles().stream().map(role -> role.getName()).collect(Collectors.toSet()))
                .build();
    }

    // Convert User -> UserResponse (cho login)
    public static UserResponse toResponse(User user, String token, String refreshToken) {
        return UserResponse.builder()
                .token(token)
                .refreshToken(refreshToken)
                .userId(String.valueOf(user.getUserId()))
                .username(user.getUsername())
                .roles(user.getRoles().stream().map(role -> role.getName()).collect(Collectors.toSet()))
                .build();
    }
}
