package cuong.web.livetream.serviceimpl;

import cuong.web.livetream.dto.request.LiveStreamControlRequest;
import cuong.web.livetream.dto.response.LiveStreamStatusResponse;
import cuong.web.livetream.service.LiveStreamService;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.concurrent.atomic.AtomicBoolean;
import java.util.concurrent.atomic.AtomicInteger;

@Service
@Slf4j
public class LiveStreamServiceImpl implements LiveStreamService {

    private final SimpMessagingTemplate messagingTemplate;
    
    private final AtomicBoolean isLive = new AtomicBoolean(false);
    private final AtomicInteger viewerCount = new AtomicInteger(0);
    private LocalDateTime streamStartTime;
    private String currentStreamTitle;
    private String currentStreamDescription;

    public LiveStreamServiceImpl(SimpMessagingTemplate messagingTemplate) {
        this.messagingTemplate = messagingTemplate;
    }

    @Override
    public LiveStreamStatusResponse getStreamStatus() {
        return new LiveStreamStatusResponse(
            isLive.get(),
            currentStreamTitle,
            currentStreamDescription,
            streamStartTime,
            viewerCount.get(),
            isLive.get() ? "/stream/live" : null
        );
    }

    @Override
    public LiveStreamStatusResponse controlStream(LiveStreamControlRequest request) {
        switch (request.getAction().toUpperCase()) {
            case "START":
                startStream(request.getStreamTitle(), request.getStreamDescription());
                break;
            case "STOP":
                stopStream();
                break;
            case "PAUSE":
                pauseStream();
                break;
            case "RESUME":
                resumeStream();
                break;
            default:
                throw new IllegalArgumentException("Invalid action: " + request.getAction());
        }
        
        LiveStreamStatusResponse status = getStreamStatus();
        
        // Notify all clients about stream status change
        messagingTemplate.convertAndSend("/topic/stream-status", status);
        
        return status;
    }

    private void startStream(String title, String description) {
        isLive.set(true);
        streamStartTime = LocalDateTime.now();
        currentStreamTitle = title != null ? title : "CLB Gà Chọi Anh Cương - Live Stream";
        currentStreamDescription = description != null ? description : "Xổ gà trực tiếp 18h hàng ngày";
        viewerCount.set(0);
        
        log.info("Live stream started: {}", currentStreamTitle);
    }

    private void stopStream() {
        isLive.set(false);
        streamStartTime = null;
        currentStreamTitle = null;
        currentStreamDescription = null;
        viewerCount.set(0);
        
        log.info("Live stream stopped");
    }

    private void pauseStream() {
        // For now, pause is same as stop
        stopStream();
        log.info("Live stream paused");
    }

    private void resumeStream() {
        if (!isLive.get()) {
            startStream(currentStreamTitle, currentStreamDescription);
            log.info("Live stream resumed");
        }
    }

    @Override
    public void addViewer() {
        if (isLive.get()) {
            int newCount = viewerCount.incrementAndGet();
            log.info("Viewer joined. Current count: {}", newCount);
            
            // Notify all clients about viewer count change
            messagingTemplate.convertAndSend("/topic/viewer-count", newCount);
        }
    }

    @Override
    public void removeViewer() {
        if (isLive.get() && viewerCount.get() > 0) {
            int newCount = viewerCount.decrementAndGet();
            log.info("Viewer left. Current count: {}", newCount);
            
            // Notify all clients about viewer count change
            messagingTemplate.convertAndSend("/topic/viewer-count", newCount);
        }
    }

    @Override
    public boolean isStreamLive() {
        return isLive.get();
    }

    @Override
    public int getViewerCount() {
        return viewerCount.get();
    }
}
