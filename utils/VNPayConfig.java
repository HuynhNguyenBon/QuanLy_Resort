package com.BBTT.BBTTResort.utils;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Configuration;

import javax.crypto.Mac;
import javax.crypto.spec.SecretKeySpec;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.*;

@Configuration
public class VNPayConfig {

    @Value("${vnpay.tmnCode}")
    public String tmnCode;

    @Value("${vnpay.secretKey}")
    public String secretKey;

    @Value("${vnpay.vnpayUrl}")
    public String vnpayUrl;

    @Value("${vnpay.returnUrl}")
    public String returnUrl;

    public String hmacSHA512(String data)
            throws Exception {

        Mac hmac512 =
                Mac.getInstance("HmacSHA512");

        SecretKeySpec secretKeySpec =
                new SecretKeySpec(
                        secretKey.getBytes(
                                StandardCharsets.UTF_8
                        ),
                        "HmacSHA512"
                );

        hmac512.init(secretKeySpec);

        byte[] bytes =
                hmac512.doFinal(
                        data.getBytes(
                                StandardCharsets.UTF_8
                        )
                );

        StringBuilder hash =
                new StringBuilder();

        for (byte b : bytes) {

            String hex =
                    Integer.toHexString(0xff & b);

            if (hex.length() == 1) {
                hash.append('0');
            }

            hash.append(hex);
        }

        return hash.toString();
    }

    public String buildQueryString(
            Map<String, String> params,
            boolean encode
    ) throws Exception {

        List<String> fieldNames =
                new ArrayList<>(params.keySet());

        Collections.sort(fieldNames);

        StringBuilder sb =
                new StringBuilder();

        Iterator<String> itr =
                fieldNames.iterator();

        while (itr.hasNext()) {

            String fieldName = itr.next();

            String fieldValue =
                    params.get(fieldName);

            if (fieldValue != null
                    && !fieldValue.isEmpty()) {

                sb.append(fieldName);
                sb.append("=");

                if (encode) {

                    sb.append(
                            URLEncoder.encode(
                                    fieldValue,
                                    StandardCharsets.US_ASCII
                            )
                    );

                } else {

                    sb.append(fieldValue);
                }

                if (itr.hasNext()) {
                    sb.append("&");
                }
            }
        }

        return sb.toString();
    }
}