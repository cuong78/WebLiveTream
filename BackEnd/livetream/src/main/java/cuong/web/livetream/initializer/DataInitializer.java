package cuong.web.livetream.initializer;

import cuong.web.livetream.constant.PredefinedRole;
import cuong.web.livetream.entity.Permission;
import cuong.web.livetream.entity.Role;
import cuong.web.livetream.entity.User;
import cuong.web.livetream.repository.PermissionRepository;
import cuong.web.livetream.repository.RoleRepository;
import cuong.web.livetream.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.*;
import java.util.function.Function;
import java.util.stream.Collectors;

@Component
@RequiredArgsConstructor
public class DataInitializer implements CommandLineRunner {

    private final UserRepository userRepository;
    private final PermissionRepository permissionRepository;
    private final RoleRepository roleRepository;
    private final PasswordEncoder passwordEncoder;


    @Override
    @Transactional
    public void run(String... args) throws Exception {
        if (userRepository.count() > 0) {
            return;
        }

        createPermissions();

        createRoles();
        createUsers();

    }
    private void createPermissions() {
        List<Permission> permissions = Arrays.asList(
                // System permissions (should never be changed)
                new Permission("User Read", "USER_READ", "Read user information"),
                new Permission("User Write", "USER_WRITE", "Modify user information"));

        permissionRepository.saveAll(permissions);
    }

    private void createRoles() {
        // Get all permissions
        Set<Permission> allPermissions = new HashSet<>(permissionRepository.findAll());

        // ADMIN_ROLE - has all permissions
        Role adminRole = Role.builder()
                .name(PredefinedRole.ADMIN_ROLE)
                .description("System Administrator with full access")
                .permissions(allPermissions)
                .build();


        roleRepository.saveAll(List.of(adminRole));
    }

    private void createUsers() {
        Role adminRole = roleRepository
                .findByName(PredefinedRole.ADMIN_ROLE)
                .orElseThrow(() -> new RuntimeException("Admin role not found"));


        // Create admin user
        User admin = User.builder()
                .username("admin")
                .password(passwordEncoder.encode("admin123"))
                .isVerify(true)
                .build();
        admin.setRoles(Set.of(adminRole));
        userRepository.save(admin);



        }

    }


