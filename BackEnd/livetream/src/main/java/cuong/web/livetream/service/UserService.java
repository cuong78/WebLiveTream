package cuong.web.livetream.service;



import cuong.web.livetream.dto.response.MemberResponse;

import java.util.List;

public interface UserService {
    List<MemberResponse> getAllUsers(int page, int size);
}
