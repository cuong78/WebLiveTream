package cuong.web.livetream.dto.request;

import jakarta.validation.constraints.NotBlank;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class LiveStreamControlRequest {
    
    @NotBlank(message = "Action không được để trống")
    private String action; // START, STOP, PAUSE, RESUME
    
    private String streamTitle;
    private String streamDescription;
}
