package com.BBTT.BBTTResort.service;

import jakarta.mail.internet.MimeMessage; 
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    @Autowired
    private JavaMailSender mailSender;

    @Value("${spring.mail.username}")
    private String fromEmail;
    // Tên hiển thị mà bạn muốn khách hàng nhìn thấy
    private final String SENDER_NAME = "BBHH Resort";

    // ── Gửi OTP quên mật khẩu ──────────────────────────────────────────────
    public void sendOtpEmail(String toEmail, String otp) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            // Quan trọng: Set fromEmail kèm SENDER_NAME
            helper.setFrom(fromEmail, SENDER_NAME);
            helper.setTo(toEmail);
            helper.setSubject("🔐 Mã OTP đặt lại mật khẩu - BBHH Resort");
            helper.setText(
                    "Xin chào,\n\n" +
                            "Bạn đã yêu cầu đặt lại mật khẩu tại BBHH Resort.\n\n" +
                            "━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                            "  Mã OTP của bạn: " + otp + "\n" +
                            "━━━━━━━━━━━━━━━━━━━━━━━━\n\n" +
                            "⏱️ Mã có hiệu lực trong 5 phút.\n" +
                            "⚠️ Không chia sẻ mã này với bất kỳ ai.\n\n" +
                            "Nếu bạn không yêu cầu, hãy bỏ qua email này.\n\n" +
                            "BBHH Resort | 📞 0909.448.608"
            );

            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("❌ Không thể gửi email OTP: " + e.getMessage());
        }
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

        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, SENDER_NAME);
            helper.setTo(toEmail);
            helper.setSubject("✅ Xác nhận đặt phòng - BBHH Resort | Mã: " + confirmationCode);

            String guestInfo = numOfChildren > 0
                    ? numOfAdults + " người lớn, " + numOfChildren + " trẻ em"
                    : numOfAdults + " người lớn";

            helper.setText(
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
                            "📍 Địa chỉ: [Địa chỉ resort]"
            );

            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("❌ Không thể gửi email xác nhận đặt phòng: " + e.getMessage());
        }
    }

    // ── Gửi email hủy đặt phòng ───────────────────────────────────────────
    public void sendBookingCancellationEmail(
            String toEmail,
            String guestName,
            String confirmationCode,
            String roomType,
            String checkInDate) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(fromEmail, SENDER_NAME);
            helper.setTo(toEmail);
            helper.setSubject("❌ Hủy đặt phòng - BBHH Resort | Mã: " + confirmationCode);

            helper.setText(
                    "Xin chào " + guestName + ",\n\n" +
                            "Đặt phòng của bạn đã được hủy thành công.\n\n" +
                            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n" +
                            "📋 Mã xác nhận : " + confirmationCode + "\n" +
                            "🛏️  Loại phòng  : " + roomType + "\n" +
                            "📅 Ngày nhận   : " + checkInDate + "\n" +
                            "━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━\n\n" +
                            "Nếu bạn muốn đặt phòng mới, hãy truy cập website của chúng tôi.\n\n" +
                            "📞 Hỗ trợ: 0909.448.608\n\n" +
                            "BBHH Resort"
            );

            mailSender.send(message);
        } catch (Exception e) {
            System.err.println("❌ Không thể gửi email hủy đặt phòng: " + e.getMessage());
        }
    }
}
