package cuong.web.livetream.service;



import cuong.web.livetream.entity.RefreshToken;
import cuong.web.livetream.entity.User;

import java.util.Optional;

public interface RefreshTokenService {

    RefreshToken createRefreshToken(User user);

}
