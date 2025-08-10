package cuong.web.livetream.dto.response;

import lombok.*;
import java.util.Set;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserResponse {
    public String token;
    public String refreshToken;
    public String userId;
    public String username;
    public Set<String> roles;
}
