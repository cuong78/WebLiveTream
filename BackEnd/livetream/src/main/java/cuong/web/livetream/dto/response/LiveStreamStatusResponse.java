package cuong.web.livetream.dto.response;

import com.fasterxml.jackson.annotation.JsonProperty;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LiveStreamStatusResponse {
    @JsonProperty("isLive")
    private boolean isLive;
    private String streamTitle;
    private String streamDescription;
    private LocalDateTime startTime;
    private int viewerCount;
    private String streamUrl;
}
