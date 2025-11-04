package com.lodha.EcoSaathi.Service;

import org.springframework.mail.SimpleMailMessage;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.stereotype.Service;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Sends the OTP to the user's email address.
     */
    public void sendOtpEmail(String toEmail, String otp) {
        SimpleMailMessage message = new SimpleMailMessage();

        // setFrom को आपके कॉन्फ़िगर किए गए Gmail username पर सेट करें।
        message.setFrom("bablulodha37@gmail.com");
        message.setTo(toEmail);

        // Subject and Body
        message.setSubject("EcoSaathi: Your Verification Code (OTP)");
        message.setText("Dear User,\n\n"
                + "Thank you for registering with EcoSaathi. Please use the following code to verify your account:\n\n"
                + "Your OTP: " + otp + "\n\n"
                + "This code is valid for 5 minutes.\n"
                + "If you did not request this, please ignore this email.\n\n"
                + "Thanks,\n"
                + "EcoSaathi Team");

        try {
            mailSender.send(message);
            //  success message for clarity
            System.out.println("✅ OTP Mail sent successfully from Gmail to " + toEmail);
        } catch (Exception e) {
            System.err.println("❌ Critical Error sending email: " + e.getMessage());
        }
    }
}