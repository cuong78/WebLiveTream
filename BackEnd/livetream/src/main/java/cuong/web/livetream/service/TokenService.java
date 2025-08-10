package cuong.web.livetream.service;


import cuong.web.livetream.entity.User;

public interface TokenService {
    String generateToken(User user);
    User getAccountByToken(String token);
}
