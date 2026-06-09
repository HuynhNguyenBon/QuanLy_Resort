package com.BBTT.BBTTResort.service.impl;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;  // nếu chưa có
import com.BBTT.BBTTResort.dto.VNPayRequest;
import com.BBTT.BBTTResort.dto.VNPayResponse;
import com.BBTT.BBTTResort.entity.Booking;
import com.BBTT.BBTTResort.entity.User;
import com.BBTT.BBTTResort.exception.OurException;
import com.BBTT.BBTTResort.repo.BookingRepository;
import com.BBTT.BBTTResort.utils.JWTUtils;
import com.BBTT.BBTTResort.utils.VNPayConfig;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.LocalDateTime;
import java.time.ZoneId;
import java.time.format.DateTimeFormatter;
import java.text.SimpleDateFormat;
import java.util.*;

@Service
public class VNPayService {

    @Autowired
    private VNPayConfig vnPayConfig;

    @Autowired
    private BookingRepository bookingRepository;

    @Autowired
    private JWTUtils jwtUtils;

    /**
     * Tạo URL thanh toán VNPAY từ bookingId
     */
     public VNPayResponse createPaymentUrl(VNPayRequest request) {

        VNPayResponse response = new VNPayResponse();

        try {

            Booking booking = bookingRepository.findById(request.getBookingId())
                    .orElseThrow(() -> new OurException("Booking not found"));

            // Nếu totalPrice là USD
            long amount = (long) (booking.getTotalPrice() * 25000 * 100);

            String txnRef = booking.getId() + "_" + System.currentTimeMillis();

            TimeZone tz = TimeZone.getTimeZone("Asia/Ho_Chi_Minh");

            Calendar cld = Calendar.getInstance(tz);

            SimpleDateFormat formatter =
                    new SimpleDateFormat("yyyyMMddHHmmss");

            formatter.setTimeZone(tz);

// thời gian tạo
            String createDate = formatter.format(cld.getTime());

// hết hạn sau 15 phút
            cld.add(Calendar.MINUTE, 15);

            String expireDate = formatter.format(cld.getTime());

            System.out.println("CREATE DATE: " + createDate);
            System.out.println("EXPIRE DATE: " + expireDate);

            Map<String, String> vnp_Params = new HashMap<>();

            vnp_Params.put("vnp_Version", "2.1.0");
            vnp_Params.put("vnp_Command", "pay");
            vnp_Params.put("vnp_TmnCode", vnPayConfig.tmnCode);

            vnp_Params.put("vnp_Amount", String.valueOf(amount));

            vnp_Params.put("vnp_CurrCode", "VND");

            vnp_Params.put("vnp_BankCode", "NCB");

            vnp_Params.put("vnp_TxnRef", txnRef);

            // KHÔNG dùng tiếng Việt/dấu/khoảng trắng
            vnp_Params.put(
                    "vnp_OrderInfo",
                    "Thanh_toan_booking_" + booking.getId()
            );

            vnp_Params.put("vnp_OrderType", "other");

            vnp_Params.put("vnp_Locale", "vn");

            vnp_Params.put(
                    "vnp_ReturnUrl",
                    vnPayConfig.returnUrl
            );

            vnp_Params.put(
                    "vnp_IpAddr",
                    request.getIpAddress() != null
                            ? request.getIpAddress()
                            : "127.0.0.1"
            );

            vnp_Params.put("vnp_CreateDate", createDate);

            vnp_Params.put("vnp_ExpireDate", expireDate);



            List<String> fieldNames =
                    new ArrayList<>(vnp_Params.keySet());

            Collections.sort(fieldNames);

            StringBuilder hashData = new StringBuilder();
            StringBuilder query = new StringBuilder();

            Iterator<String> itr = fieldNames.iterator();

            while (itr.hasNext()) {

                String fieldName = itr.next();

                String fieldValue = vnp_Params.get(fieldName);

                if (fieldValue != null
                        && !fieldValue.isEmpty()) {

                    // HASH DATA
                    hashData.append(fieldName);
                    hashData.append('=');

                    hashData.append(
                            java.net.URLEncoder.encode(
                                    fieldValue,
                                    StandardCharsets.US_ASCII
                            )
                    );

                    // QUERY
                    query.append(
                            java.net.URLEncoder.encode(
                                    fieldName,
                                    StandardCharsets.US_ASCII
                            )
                    );

                    query.append('=');

                    query.append(
                            java.net.URLEncoder.encode(
                                    fieldValue,
                                    StandardCharsets.US_ASCII
                            )
                    );

                    if (itr.hasNext()) {

                        query.append('&');

                        hashData.append('&');
                    }
                }
            }

            String secureHash = vnPayConfig.hmacSHA512(
                    hashData.toString()
            );

            String paymentUrl =
                    vnPayConfig.vnpayUrl
                            + "?"
                            + query
                            + "&vnp_SecureHash="
                            + secureHash;

            System.out.println("========= HASH DATA =========");
            System.out.println(hashData);

            System.out.println("========= SECURE HASH =========");
            System.out.println(secureHash);

            System.out.println("========= PAYMENT URL =========");
            System.out.println(paymentUrl);

            booking.setPaymentStatus("PENDING");

            bookingRepository.save(booking);

            response.setStatus("OK");
            response.setMessage("Payment URL created successfully");
            response.setPaymentUrl(paymentUrl);

        } catch (Exception e) {

            response.setStatus("FAILED");
            response.setMessage(e.getMessage());
        }

        return response;
    }

    /**
     * Xử lý IPN callback từ VNPAY (server-to-server)
     */
    public String handleIPN(Map<String, String> params) {
        try {
            // 1. Lấy secure hash từ VNPAY gửi về
            String vnpSecureHash = params.get("vnp_SecureHash");

            // 2. Xóa hash khỏi map để verify
            Map<String, String> verifyParams = new HashMap<>(params);
            verifyParams.remove("vnp_SecureHash");
            verifyParams.remove("vnp_SecureHashType");

            // 3. Tính lại hash
            String hashData = vnPayConfig.buildQueryString(verifyParams, true);
            String calculatedHash = vnPayConfig.hmacSHA512(hashData);

            // 4. So sánh hash
            if (!calculatedHash.equalsIgnoreCase(vnpSecureHash)) {
                return "{\"RspCode\":\"97\",\"Message\":\"Invalid signature\"}";
            }

            // 5. Lấy thông tin giao dịch
            String txnRef     = params.get("vnp_TxnRef");       // bookingId_timestamp
            String responseCode = params.get("vnp_ResponseCode"); // "00" = thành công
            String transactionId = params.get("vnp_TransactionNo");

            // 6. Lấy bookingId từ txnRef
            Long bookingId = Long.parseLong(txnRef.split("_")[0]);
            Booking booking = bookingRepository.findById(bookingId)
                    .orElse(null);

            if (booking == null) {
                return "{\"RspCode\":\"01\",\"Message\":\"Order not found\"}";
            }

            // 7. Cập nhật trạng thái booking
            if ("00".equals(responseCode)) {
                booking.setPaymentStatus("PAID");
                booking.setVnpayTransactionId(transactionId);
            } else {
                booking.setPaymentStatus("FAILED");
            }
            bookingRepository.save(booking);

            return "{\"RspCode\":\"00\",\"Message\":\"Confirm Success\"}";

        } catch (Exception e) {
            return "{\"RspCode\":\"99\",\"Message\":\"Unknown error: " + e.getMessage() + "\"}";
        }
    }

    /**
     * Xử lý Return URL (redirect sau khi thanh toán)
     */
    public Map<String, String> handleReturn(
            Map<String, String> params) {
        Map<String, String> result = new HashMap<>();
        try {
            // 1. Tách secure hash ra
            String vnpSecureHash = params.get("vnp_SecureHash");

            // 2. Copy params, xóa hash fields
            Map<String, String> verifyParams = new HashMap<>(params);
            verifyParams.remove("vnp_SecureHash");
            verifyParams.remove("vnp_SecureHashType");

            // 3. Sort theo key và build hashData
            //    KHÔNG encode — dùng giá trị raw VNPAY gửi về
            List<String> fieldNames =
                    new ArrayList<>(verifyParams.keySet());
            Collections.sort(fieldNames);

            StringBuilder hashData = new StringBuilder();
            for (String field : fieldNames) {
                String value = verifyParams.get(field);
                if (value != null && !value.isEmpty()) {
                    if (hashData.length() > 0)
                        hashData.append("&");
                    hashData.append(field)
                            .append("=")
                            .append(value);
                }
            }

            // 4. Tính lại hash
            String calculatedHash = vnPayConfig
                    .hmacSHA512(hashData.toString());

            System.out.println("=== RETURN HASH DATA: "
                    + hashData);
            System.out.println("=== CALCULATED: "
                    + calculatedHash);
            System.out.println("=== VNPAY HASH: "
                    + vnpSecureHash);

            // 5. So sánh
            if (!calculatedHash.equalsIgnoreCase(vnpSecureHash)) {
                result.put("status", "INVALID");
                result.put("message", "Chữ ký không hợp lệ");
                return result;
            }

            // 6. Lấy kết quả
            String responseCode  = params.get("vnp_ResponseCode");
            String txnRef        = params.get("vnp_TxnRef");
            String transactionNo = params.get("vnp_TransactionNo");
            String orderInfo     = params.get("vnp_OrderInfo");

            // Extract booking confirmation code from orderInfo
            String bookingCode = orderInfo
                    .replace("Thanh_toan_booking_", "")
                    .replace("Thanh toan dat phong #", "")
                    .replace("Thanh toan dat phong ", "")
                    .trim();

            // Update booking paymentStatus based on VNPay response
            try {
                Long bookingId = Long.parseLong(txnRef.split("_")[0]);
                Booking booking = bookingRepository.findById(bookingId).orElse(null);
                if (booking != null) {
                    if ("00".equals(responseCode)) {
                        booking.setPaymentStatus("PAID");
                        booking.setVnpayTransactionId(transactionNo);
                        // bookingCode in return is the numeric ID-based string; use the stored code
                        bookingCode = booking.getBookingConfirmationCode();

                        // Trình duyệt có thể xóa localStorage (kể cả token đăng nhập)
                        // do cơ chế chống bounce-tracking khi điều hướng qua VNPay rồi quay lại.
                        // Cấp lại token mới cho user của booking để frontend tự khôi phục phiên đăng nhập.
                        User user = booking.getUser();
                        if (user != null) {
                            result.put("token", jwtUtils.generateToken(user));
                            result.put("role", user.getRole());
                            result.put("userEmail", user.getEmail());
                        }
                    } else {
                        booking.setPaymentStatus("FAILED");
                    }
                    bookingRepository.save(booking);
                }
            } catch (Exception ignored) {}

            result.put("responseCode", responseCode);
            result.put("txnRef", txnRef);
            result.put("bookingConfirmationCode", bookingCode);
            result.put("amount", params.get("vnp_Amount"));
            result.put("transactionId", transactionNo);
            result.put("status",
                    "00".equals(responseCode) ? "SUCCESS" : "FAILED");
            result.put("message",
                    "00".equals(responseCode)
                            ? "Thanh toán thành công!"
                            : "Thanh toán thất bại! Mã lỗi: " + responseCode);

        } catch (Exception e) {
            result.put("status", "ERROR");
            result.put("message", e.getMessage());
        }
        return result;
    }
}
