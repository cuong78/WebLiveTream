package cuong.web.livetream.dto.response;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDate;
import java.util.Set;

@Data
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class MemberResponse {
    private Long userId;
    private String username;
    private String email;
    private String identity_Card;
    private String fullName;
    private String phone;
    private String address;
    private LocalDate dateOfBirth;
    private Set<String> roles;
}
