package cuong.web.livetream.dto.request;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.Size;
import lombok.AllArgsConstructor;
import lombok.Data;
import lombok.NoArgsConstructor;

@Data
@NoArgsConstructor
@AllArgsConstructor
public class ChatMessageRequest {

    @NotBlank(message = "Tên hiển thị không được để trống")
    @Size(max = 50, message = "Tên hiển thị không được quá 50 ký tự")
    private String displayName;

    @NotBlank(message = "Nội dung tin nhắn không được để trống")
    @Size(max = 500, message = "Nội dung tin nhắn không được quá 500 ký tự")
    private String content;
}