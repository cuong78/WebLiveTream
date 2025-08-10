package cuong.web.livetream.repository;

import cuong.web.livetream.entity.Permission;
import jakarta.validation.constraints.NotBlank;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.Optional;
import java.util.Set;

public interface PermissionRepository extends JpaRepository<Permission, String> {
    Set<Permission> findByNameIn(Set<String> names);

    Optional<Object> findByName(String userRead);

    boolean existsByName(@NotBlank(message = "Permission name is required") String name);

    boolean existsByCode(String code);
}
