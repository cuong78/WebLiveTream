package cuong.web.livetream.serviceimpl;

import cuong.web.livetream.dto.response.MemberResponse;
import cuong.web.livetream.mapper.UserMapper;
import cuong.web.livetream.repository.UserRepository;
import cuong.web.livetream.service.UserService;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.PageRequest;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Service;

import java.util.List;

@Service
@RequiredArgsConstructor
public class UserServiceImpl implements UserService {
    private final UserRepository userRepository;
    private final UserMapper userMapper;
    private final PasswordEncoder passwordEncoder;

    // Fix: Add @Override annotation
    @Override
    public List<MemberResponse> getAllUsers(int page, int size) {
        return userRepository.findAll(PageRequest.of(page, size)).stream()
                .map(userMapper::toUserResponse)
                .toList();
    }
}
