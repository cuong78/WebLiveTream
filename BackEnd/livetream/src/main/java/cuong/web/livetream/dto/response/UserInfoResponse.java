package cuong.web.livetream.dto.response;

import lombok.*;

@Getter
@Setter
@AllArgsConstructor
@NoArgsConstructor
@Builder
public class UserInfoResponse {
    public Long userId;
    public String fullName;
    public String email;
    public String identityCard;
}
