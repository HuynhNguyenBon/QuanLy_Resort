package com.BBTT.BBTTResort.service;

import com.fasterxml.jackson.databind.ObjectMapper;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.stereotype.Service;

import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.time.Duration;
import java.util.List;
import java.util.Map;

// Gửi email qua Brevo Transactional Email API (HTTPS) thay vì SMTP,
// vì nền tảng deploy (Railway) chặn kết nối SMTP ra ngoài tới Gmail.
@Service
public class EmailService {

    private static final String BREVO_API_URL = "https://api.brevo.com/v3/smtp/email";
    private static final String SENDER_NAME = "BBHH Resort";

    @Value("${brevo.api.key}")
    private String brevoApiKey;

    @Value("${brevo.sender.email}")
    private String senderEmail;

    private final HttpClient httpClient = HttpClient.newBuilder()
            .connectTimeout(Duration.ofSeconds(8))
            .build();

    private final ObjectMapper objectMapper = new ObjectMapper();

    private boolean sendEmail(String toEmail, String subject, String textContent) {
        try {
            Map<String, Object> body = Map.of(
                    "sender", Map.of("name", SENDER_NAME, "email", senderEmail),
                    "to", List.of(Map.of("email", toEmail)),
                    "subject", subject,
                    "textContent", textContent
            );

            HttpRequest request = HttpRequest.newBuilder()
                    .uri(URI.create(BREVO_API_URL))
                    .timeout(Duration.ofSeconds(10))
                    .header("api-key", brevoApiKey)
                    .header("Content-Type", "application/json")
                    .header("Accept", "application/json")
                    .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(body)))
                    .build();

            HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());

            if (response.statusCode() >= 200 && response.statusCode() < 300) {
                return true;
            }

            System.err.println("❌ Brevo trả về lỗi (" + response.statusCode() + "): " + response.body());
            return false;
        } catch (Exception e) {
            System.err.println("❌ Không thể gửi email qua Brevo: " + e.getMessage());
            return false;
        }
    }

    // ── Gửi OTP quên mật khẩu ──────────────────────────────────────────────
    // Trả về true nếu gửi thành công, false nếu thất bại (để service gọi biết mà báo lỗi đúng cho người dùng)
    public boolean sendOtpEmail(String toEmail, String otp) {
        String content =
                "Xin chào,\n\n" +
                        "Bạn đã yêu cầu đặt lại mật khẩu tại BBHH Resort.\n\n" +
                        "━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                        "  Mã OTP của bạn: " + otp + "\n" +
                        "━━━━━━━━━━━━━━━━━━━━━━━━\n\n" +
                        "⏱️ Mã có hiệu lực trong 5 phút.\n" +
                        "⚠️ Không chia sẻ mã này với bất kỳ ai.\n\n" +
                        "Nếu bạn không yêu cầu, hãy bỏ qua email này.\n\n" +
                        "BBHH Resort | 📞 0909.448.608";

        return sendEmail(toEmail, "🔐 Mã OTP đặt lại mật khẩu - BBHH Resort", content);
    }

    // ── Gửi email xác nhận đặt phòng ───────────────────────────────────────
    public void sendBookingConfirmationEmail(
            String toEmail,
            String guestName,
            String confirmationCode,
            String roomType,
            String checkInDate,
            String checkOutDate,
            int totalGuests,
            int numOfAdults,
            int numOfChildren,
            double totalPrice) {

        String guestInfo = numOfChildren > 0
                ? numOfAdults + " người lớn, " + numOfChildren + " trẻ em"
                : numOfAdults + " người lớn";

        String content =
                "Xin chào " + guestName + ",\n\n" +
                        "Đặt phòng của bạn đã được xác nhận thành công! 🎉\n\n" +
                        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                        "  THÔNG TIN ĐẶT PHÒNG\n" +
                        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                        "📋 Mã xác nhận  : " + confirmationCode + "\n" +
                        "🛏️  Loại phòng   : " + roomType + "\n" +
                        "📅 Ngày nhận    : " + checkInDate + "\n" +
                        "📅 Ngày trả     : " + checkOutDate + "\n" +
                        "👥 Số khách     : " + totalGuests + " (" + guestInfo + ")\n" +
                        "💰 Tổng tiền    : $" + String.format("%.2f", totalPrice) + "\n" +
                        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n" +
                        "📌 Lưu ý quan trọng:\n" +
                        "• Lưu mã xác nhận để tra cứu đặt phòng bất cứ lúc nào\n" +
                        "• Thời gian nhận phòng (Check-in)  : từ 14:00\n" +
                        "• Thời gian trả phòng (Check-out)  : trước 12:00\n" +
                        "• Hủy miễn phí trước 24h trước ngày nhận phòng\n\n" +
                        "📞 Liên hệ hỗ trợ: 0909.448.608\n" +
                        "🌐 Website: bbhh.com\n\n" +
                        "Cảm ơn bạn đã chọn BBHH Resort!\n" +
                        "Chúc bạn có kỳ nghỉ tuyệt vời. 🌟\n\n" +
                        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                        "BBHH Resort | Khu nghỉ dưỡng sang trọng\n" +
                        "📍 Địa chỉ: [Địa chỉ resort]";

        sendEmail(toEmail, "✅ Xác nhận đặt phòng - BBHH Resort | Mã: " + confirmationCode, content);
    }

    // ── Gửi email hủy đặt phòng ───────────────────────────────────────────
    public void sendBookingCancellationEmail(
            String toEmail,
            String guestName,
            String confirmationCode,
            String roomType,
            String checkInDate) {

        String content =
                "Xin chào " + guestName + ",\n\n" +
                        "Đặt phòng của bạn đã được hủy thành công.\n\n" +
                        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                        "📋 Mã xác nhận : " + confirmationCode + "\n" +
                        "🛏️  Loại phòng  : " + roomType + "\n" +
                        "📅 Ngày nhận   : " + checkInDate + "\n" +
                        "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n" +
                        "Nếu bạn muốn đặt phòng mới, hãy truy cập website của chúng tôi.\n\n" +
                        "📞 Hỗ trợ: 0909.448.608\n\n" +
                        "BBHH Resort";

        sendEmail(toEmail, "❌ Hủy đặt phòng - BBHH Resort | Mã: " + confirmationCode, content);
    }
}
