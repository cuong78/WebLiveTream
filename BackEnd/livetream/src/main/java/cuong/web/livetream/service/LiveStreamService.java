package cuong.web.livetream.service;

import cuong.web.livetream.dto.request.LiveStreamControlRequest;
import cuong.web.livetream.dto.response.LiveStreamStatusResponse;

public interface LiveStreamService {
    LiveStreamStatusResponse getStreamStatus();
    LiveStreamStatusResponse controlStream(LiveStreamControlRequest request);
    void addViewer();
    void removeViewer();
    boolean isStreamLive();
    int getViewerCount();
}
