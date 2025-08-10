package cuong.web.livetream.controller;

import cuong.web.livetream.dto.request.LiveStreamControlRequest;
import cuong.web.livetream.dto.response.LiveStreamStatusResponse;
import cuong.web.livetream.service.LiveStreamService;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.web.bind.annotation.*;

import jakarta.validation.Valid;

@RestController
@RequestMapping("/api/livestream")
@RequiredArgsConstructor
@Slf4j
@CrossOrigin(origins = "*")
public class LiveStreamController {

    private final LiveStreamService liveStreamService;

    @GetMapping("/status")
    public ResponseEntity<LiveStreamStatusResponse> getStreamStatus() {
        LiveStreamStatusResponse status = liveStreamService.getStreamStatus();
        return ResponseEntity.ok(status);
    }

    @PostMapping("/control")
    public ResponseEntity<LiveStreamStatusResponse> controlStream(@Valid @RequestBody LiveStreamControlRequest request) {
        try {
            LiveStreamStatusResponse status = liveStreamService.controlStream(request);
            return ResponseEntity.ok(status);
        } catch (Exception e) {
            log.error("Error controlling stream", e);
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/viewer/join")
    public ResponseEntity<String> joinAsViewer() {
        try {
            liveStreamService.addViewer();
            return ResponseEntity.ok("Joined successfully");
        } catch (Exception e) {
            log.error("Error adding viewer", e);
            return ResponseEntity.badRequest().build();
        }
    }

    @PostMapping("/viewer/leave")
    public ResponseEntity<String> leaveAsViewer() {
        try {
            liveStreamService.removeViewer();
            return ResponseEntity.ok("Left successfully");
        } catch (Exception e) {
            log.error("Error removing viewer", e);
            return ResponseEntity.badRequest().build();
        }
    }
}
