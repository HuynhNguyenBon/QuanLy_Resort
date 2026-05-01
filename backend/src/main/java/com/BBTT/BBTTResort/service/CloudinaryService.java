package com.BBTT.BBTTResort.service;

import com.cloudinary.Cloudinary;
import com.cloudinary.utils.ObjectUtils;
import com.BBTT.BBTTResort.exception.OurException;

import com.BBTT.BBTTResort.entity.Room;
import com.BBTT.BBTTResort.repo.RoomRepository;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.event.ContextRefreshedEvent;
import org.springframework.context.event.EventListener;
import org.springframework.core.io.ClassPathResource;
import org.springframework.stereotype.Service;
import org.springframework.web.multipart.MultipartFile;

import java.io.BufferedReader;
import java.io.InputStreamReader;
import java.math.BigDecimal;
import java.nio.charset.StandardCharsets;
import java.util.Map;

@Service
public class CloudinaryService {

    private final Cloudinary cloudinary;
    private final RoomRepository roomRepository;

    public CloudinaryService(@Value("${cloudinary.cloud-name}") String cloudName,
                             @Value("${cloudinary.api-key}") String apiKey,
                             @Value("${cloudinary.api-secret}") String apiSecret,
                             RoomRepository roomRepository) {
        this.roomRepository = roomRepository;
        this.cloudinary = new Cloudinary(ObjectUtils.asMap(
                "cloud_name", cloudName,
                "api_key", apiKey,
                "api_secret", apiSecret,
                "secure", true));
    }

    @EventListener(ContextRefreshedEvent.class)
    public void initDataFromCSV() {
        try {

            if (roomRepository.count() == 0) {
                System.out.println(">>> [Hệ thống] Đang khởi tạo dữ liệu từ file room.csv...");

                ClassPathResource resource = new ClassPathResource("room.csv");
                BufferedReader reader = new BufferedReader(new InputStreamReader(resource.getInputStream(), StandardCharsets.UTF_8));

                String line;
                boolean isHeader = true;

                while ((line = reader.readLine()) != null) {
                    if (isHeader) { isHeader = false; continue; }

                    String[] data = line.split(",(?=(?:[^\"]*\"[^\"]*\")*[^\"]*$)");

                    if (data.length >= 5) {
                        Room room = new Room();
                        room.setRoomDescription(data[1].replace("\"", ""));
                        room.setRoomPhotoUrl(data[2].trim());
                        room.setRoomPrice(new BigDecimal(data[3].trim()));
                        room.setRoomType(data[4].trim());

                        roomRepository.save(room);
                    }
                }
                reader.close();
                System.out.println(">>> [Thành công] Đã nạp dữ liệu phòng xong!");
            }
        } catch (Exception e) {
            System.err.println(">>> Lỗi đọc file CSV: " + e.getMessage());
        }
    }

    public String saveImageToCloudinary(MultipartFile photo) {
        try {
            Map uploadResult = cloudinary.uploader().upload(photo.getBytes(), ObjectUtils.emptyMap());
            return uploadResult.get("secure_url").toString();
        } catch (Exception e) {
            throw new OurException("Error upload Cloudinary: " + e.getMessage());
        }
    }
}
