package com.lodha.EcoSaathi.Service;

import jakarta.mail.MessagingException;
import jakarta.mail.internet.MimeMessage;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.mail.javamail.JavaMailSender;
import org.springframework.mail.javamail.MimeMessageHelper;
import org.springframework.scheduling.annotation.Async;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;

@Service
public class EmailService {

    private final JavaMailSender mailSender;

    @Value("${app.mail.sender}")
    private String senderEmail;

    @Value("${app.mail.sender-name}")
    private String senderName;

    public EmailService(JavaMailSender mailSender) {
        this.mailSender = mailSender;
    }

    /**
     * Send HTML email asynchronously
     */
    @Async
    public void sendHtmlEmail(String to, String subject, String htmlContent) {
        try {
            MimeMessage message = mailSender.createMimeMessage();
            MimeMessageHelper helper = new MimeMessageHelper(message, true, "UTF-8");

            helper.setFrom(senderEmail, senderName);
            helper.setTo(to);
            helper.setSubject(subject);
            helper.setText(htmlContent, true);

            mailSender.send(message);
            System.out.println("✅ Email sent successfully to: " + to);
        } catch (MessagingException e) {
            System.err.println("❌ Failed to send email to: " + to);
            e.printStackTrace();
        } catch (Exception e) {
            System.err.println("❌ Unexpected error sending email to: " + to);
            e.printStackTrace();
        }
    }

    /**
     * Send welcome email to newly registered user
     */
    public void sendUserWelcomeEmail(String to, String firstName, String lastName) {
        String subject = "🌱 Welcome to EcoSaathi - Let's Build a Greener Planet!";
        String htmlContent = buildUserWelcomeEmail(firstName, lastName);
        sendHtmlEmail(to, subject, htmlContent);
    }

    /**
     * Send welcome email to newly created pickup person with credentials
     */
    public void sendPickupPersonWelcomeEmail(String to, String name, String email, String password) {
        String subject = "🚛 Welcome to EcoSaathi - Pickup Person Account Created";
        String htmlContent = buildPickupPersonWelcomeEmail(name, email, password);
        sendHtmlEmail(to, subject, htmlContent);
    }

    /**
     * Send request status update email to user
     */
    public void sendRequestStatusUpdateEmail(String to, String userName, Long requestId, String oldStatus, String newStatus) {
        String subject = "📦 EcoSaathi - Request #" + requestId + " Status Updated";
        String htmlContent = buildRequestStatusUpdateEmail(userName, requestId, oldStatus, newStatus);
        sendHtmlEmail(to, subject, htmlContent);
    }

    /**
     * Send pickup assignment notification to pickup person
     */
    public void sendPickupAssignmentEmail(String to, String pickupPersonName, Long requestId,
                                          String userAddress, String userName, String userPhone,
                                          LocalDateTime scheduledTime) {
        String subject = "🚛 New Pickup Assignment - Request #" + requestId;
        String htmlContent = buildPickupAssignmentEmail(pickupPersonName, requestId, userAddress,
                userName, userPhone, scheduledTime);
        sendHtmlEmail(to, subject, htmlContent);
    }

    /**
     * Send gmail new request submit
     */
    public void sendRequestSubmitEmail(String to, String userName, Long requestId) {
        String subject = "📨 EcoSaathi - Request Submitted Successfully!";

        String htmlContent = buildRequestSubmitEmail(userName, requestId);

        sendHtmlEmail(to, subject, htmlContent);
    }


    // ==================== HTML Email Templates ====================


    private String buildRequestSubmitEmail(String userName, Long requestId) {

        return "<!DOCTYPE html>" +
                "<html>" +
                "<head><meta charset='UTF-8'></head>" +
                "<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;'>" +

                "<div style='background: linear-gradient(135deg, #0b8457 0%, #1ea571 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;'>" +
                "<h1 style='color: white; margin: 0; font-size: 28px;'>📨 Request Submitted!</h1>" +
                "</div>" +

                "<div style='background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;'>" +
                "<h2 style='color: #0b8457;'>Hello " + userName + "! 👋</h2>" +
                "<p>Thank you for submitting your e-waste pickup request.</p>" +
                "<p>Our EcoSaathi team has received your request and will review it shortly.</p>" +

                "<div style='background: white; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 5px solid #0b8457;'>" +
                "<h3 style='color: #0b8457; margin-top: 0;'>📋 Request Details</h3>" +
                "<table style='width: 100%; border-collapse: collapse;'>" +
                "<tr><td style='padding: 10px 0; font-weight: bold; width: 150px;'>Request ID:</td><td style='padding: 10px 0;'>#" + requestId + "</td></tr>" +
                "<tr><td style='padding: 10px 0; font-weight: bold;'>Status:</td><td style='padding: 10px 0; color: #0b8457; font-weight: bold;'>PENDING</td></tr>" +
                "</table>" +
                "</div>" +

                "<div style='background: #e0f2fe; padding: 20px; border-left: 4px solid #0b8457; margin: 20px 0;'>" +
                "<p style='margin: 0;'><strong>⏳ What happens next?</strong><br>" +
                "Our team will review your request. You will receive an update once the request is approved or scheduled.</p>" +
                "</div>" +

                "<p>You can track your request status anytime from your EcoSaathi dashboard.</p>" +
                "<p style='margin-top: 30px;'>Thank you for choosing responsible recycling! 🌍</p>" +
                "<p style='color: #0b8457; font-weight: bold;'>Team EcoSaathi</p>" +
                "</div>" +

                "<div style='text-align: center; padding: 20px; color: #999; font-size: 12px;'>" +
                "<p>&copy; 2025 EcoSaathi. All rights reserved.</p>" +
                "</div>" +
                "</body>" +
                "</html>";
    }


    private String buildUserWelcomeEmail(String firstName, String lastName) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head><meta charset='UTF-8'></head>" +
                "<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;'>" +
                "<div style='background: linear-gradient(135deg, #0b8457 0%, #1ea571 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;'>" +
                "<h1 style='color: white; margin: 0; font-size: 28px;'>♻️ Welcome to EcoSaathi!</h1>" +
                "</div>" +
                "<div style='background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;'>" +
                "<h2 style='color: #0b8457;'>Hello " + firstName + " " + lastName + "! 🌱</h2>" +
                "<p>Thank you for joining <strong>EcoSaathi</strong> - your trusted partner in responsible e-waste management!</p>" +
                "<p>We're excited to have you on board as we work together towards a cleaner, greener planet.</p>" +
                "<h3 style='color: #0b8457;'>What's Next?</h3>" +
                "<ul>" +
                "<li>✅ <strong>Submit E-Waste Requests</strong> - Schedule pickups for your old electronics</li>" +
                "<li>📦 <strong>Track Your Requests</strong> - Monitor status updates in real-time</li>" +
                "<li>🏅 <strong>Earn Certificates</strong> - Get recognized for your environmental contributions</li>" +
                "<li>📊 <strong>View Impact Reports</strong> - See how you're making a difference</li>" +
                "</ul>" +
                "<div style='background: white; padding: 20px; border-left: 4px solid #0b8457; margin: 20px 0;'>" +
                "<p style='margin: 0; font-size: 14px; color: #666;'>" +
                "<strong>💡 Pro Tip:</strong> Complete your profile and add your pickup address for faster service!" +
                "</p>" +
                "</div>" +
                "<p>If you have any questions, feel free to reach out to us at <a href='mailto:bablulodha37@gmail.com' style='color: #0b8457;'>bablulodha37@gmail.com</a></p>" +
                "<p style='margin-top: 30px;'>Let's recycle today for a better tomorrow! 🌍</p>" +
                "<p style='color: #0b8457; font-weight: bold;'>Team EcoSaathi</p>" +
                "</div>" +
                "<div style='text-align: center; padding: 20px; color: #999; font-size: 12px;'>" +
                "<p>&copy; 2025 EcoSaathi. All rights reserved.</p>" +
                "</div>" +
                "</body>" +
                "</html>";
    }

    private String buildPickupPersonWelcomeEmail(String name, String email, String password) {
        return "<!DOCTYPE html>" +
                "<html>" +
                "<head><meta charset='UTF-8'></head>" +
                "<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;'>" +
                "<div style='background: linear-gradient(135deg, #2563eb 0%, #1d4ed8 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;'>" +
                "<h1 style='color: white; margin: 0; font-size: 28px;'>🚛 Welcome to EcoSaathi Team!</h1>" +
                "</div>" +
                "<div style='background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;'>" +
                "<h2 style='color: #2563eb;'>Hello " + name + "! 👋</h2>" +
                "<p>Your <strong>Pickup Person Account</strong> has been successfully created by the EcoSaathi Admin.</p>" +
                "<p>You are now part of our mission to build a cleaner, greener planet through responsible e-waste collection!</p>" +
                "<div style='background: white; padding: 25px; border-radius: 8px; margin: 25px 0; border: 2px solid #2563eb;'>" +
                "<h3 style='color: #2563eb; margin-top: 0;'>🔐 Your Login Credentials</h3>" +
                "<table style='width: 100%; border-collapse: collapse;'>" +
                "<tr><td style='padding: 10px 0; font-weight: bold; width: 120px;'>Email:</td><td style='padding: 10px 0; color: #2563eb;'>" + email + "</td></tr>" +
                "<tr><td style='padding: 10px 0; font-weight: bold;'>Password:</td><td style='padding: 10px 0; color: #2563eb; font-family: monospace; font-size: 16px;'>" + password + "</td></tr>" +
                "</table>" +
                "</div>" +
                "<div style='background: #fef3c7; padding: 15px; border-left: 4px solid #f59e0b; margin: 20px 0;'>" +
                "<p style='margin: 0; font-size: 14px; color: #92400e;'>" +
                "<strong>⚠️ Important:</strong> Please keep your credentials secure. We recommend changing your password after first login." +
                "</p>" +
                "</div>" +
                "<h3 style='color: #2563eb;'>Your Responsibilities:</h3>" +
                "<ul>" +
                "<li>🗓️ <strong>View Assigned Requests</strong> - Check your pickup dashboard regularly</li>" +
                "<li>📍 <strong>Collect E-Waste</strong> - Visit user addresses as scheduled</li>" +
                "<li>✅ <strong>Mark Completion</strong> - Update request status after successful pickup</li>" +
                "<li>📞 <strong>Stay Connected</strong> - Maintain communication with users and admin</li>" +
                "</ul>" +
                "<p style='margin-top: 30px;'>Thank you for being a vital part of the EcoSaathi team! Together, we're making a real difference.</p>" +
                "<p style='color: #2563eb; font-weight: bold;'>Team EcoSaathi</p>" +
                "</div>" +
                "<div style='text-align: center; padding: 20px; color: #999; font-size: 12px;'>" +
                "<p>&copy; 2025 EcoSaathi. All rights reserved.</p>" +
                "</div>" +
                "</body>" +
                "</html>";
    }

    private String buildRequestStatusUpdateEmail(String userName, Long requestId, String oldStatus, String newStatus) {
        String statusColor = getStatusColor(newStatus);
        String statusMessage = getStatusMessage(newStatus);
        String statusIcon = getStatusIcon(newStatus);

        return "<!DOCTYPE html>" +
                "<html>" +
                "<head><meta charset='UTF-8'></head>" +
                "<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;'>" +
                "<div style='background: linear-gradient(135deg, " + statusColor + " 0%, " + statusColor + " 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;'>" +
                "<h1 style='color: white; margin: 0; font-size: 28px;'>" + statusIcon + " Request Status Update</h1>" +
                "</div>" +
                "<div style='background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;'>" +
                "<h2 style='color: " + statusColor + ";'>Hello " + userName + "! 👋</h2>" +
                "<p>Your e-waste request has been updated:</p>" +
                "<div style='background: white; padding: 25px; border-radius: 8px; margin: 25px 0; border-left: 5px solid " + statusColor + ";'>" +
                "<table style='width: 100%;'>" +
                "<tr><td style='padding: 10px 0; font-weight: bold;'>Request ID:</td><td style='padding: 10px 0;'>#" + requestId + "</td></tr>" +
                "<tr><td style='padding: 10px 0; font-weight: bold;'>Previous Status:</td><td style='padding: 10px 0;'>" + oldStatus + "</td></tr>" +
                "<tr><td style='padding: 10px 0; font-weight: bold;'>New Status:</td><td style='padding: 10px 0; color: " + statusColor + "; font-weight: bold;'>" + newStatus + "</td></tr>" +
                "</table>" +
                "</div>" +
                "<div style='background: #e0f2fe; padding: 20px; border-left: 4px solid " + statusColor + "; margin: 20px 0;'>" +
                "<p style='margin: 0;'><strong>" + statusMessage + "</strong></p>" +
                "</div>" +
                "<p>You can view more details by logging into your EcoSaathi dashboard.</p>" +
                "<p style='margin-top: 30px;'>Thank you for contributing to a greener planet! 🌍</p>" +
                "<p style='color: #0b8457; font-weight: bold;'>Team EcoSaathi</p>" +
                "</div>" +
                "<div style='text-align: center; padding: 20px; color: #999; font-size: 12px;'>" +
                "<p>&copy; 2025 EcoSaathi. All rights reserved.</p>" +
                "</div>" +
                "</body>" +
                "</html>";
    }

    private String buildPickupAssignmentEmail(String pickupPersonName, Long requestId,
                                              String userAddress, String userName,
                                              String userPhone, LocalDateTime scheduledTime) {
        DateTimeFormatter formatter = DateTimeFormatter.ofPattern("dd MMM yyyy, hh:mm a");
        String formattedTime = scheduledTime != null ? scheduledTime.format(formatter) : "Not specified";

        return "<!DOCTYPE html>" +
                "<html>" +
                "<head><meta charset='UTF-8'></head>" +
                "<body style='font-family: Arial, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 0 auto; padding: 20px;'>" +
                "<div style='background: linear-gradient(135deg, #dc2626 0%, #b91c1c 100%); padding: 30px; text-align: center; border-radius: 10px 10px 0 0;'>" +
                "<h1 style='color: white; margin: 0; font-size: 28px;'>🚛 New Pickup Assignment!</h1>" +
                "</div>" +
                "<div style='background: #f9f9f9; padding: 30px; border-radius: 0 0 10px 10px;'>" +
                "<h2 style='color: #dc2626;'>Hello " + pickupPersonName + "! 👋</h2>" +
                "<p>You have been assigned a new e-waste pickup request. Please review the details below:</p>" +
                "<div style='background: white; padding: 25px; border-radius: 8px; margin: 25px 0; border: 2px solid #dc2626;'>" +
                "<h3 style='color: #dc2626; margin-top: 0;'>📋 Pickup Details</h3>" +
                "<table style='width: 100%; border-collapse: collapse;'>" +
                "<tr><td style='padding: 10px 0; font-weight: bold; width: 150px;'>Request ID:</td><td style='padding: 10px 0;'>#" + requestId + "</td></tr>" +
                "<tr><td style='padding: 10px 0; font-weight: bold;'>User Name:</td><td style='padding: 10px 0;'>" + userName + "</td></tr>" +
                "<tr><td style='padding: 10px 0; font-weight: bold;'>User Phone:</td><td style='padding: 10px 0;'>" + userPhone + "</td></tr>" +
                "<tr><td style='padding: 10px 0; font-weight: bold;'>Scheduled Time:</td><td style='padding: 10px 0; color: #dc2626; font-weight: bold;'>" + formattedTime + "</td></tr>" +
                "</table>" +
                "</div>" +
                "<div style='background: #fef3c7; padding: 20px; border-left: 4px solid #f59e0b; margin: 20px 0;'>" +
                "<h4 style='margin-top: 0; color: #92400e;'>📍 Pickup Address:</h4>" +
                "<p style='margin: 0; font-size: 16px; color: #92400e; line-height: 1.8;'>" + userAddress + "</p>" +
                "</div>" +
                "<div style='background: #dbeafe; padding: 15px; border-left: 4px solid #2563eb; margin: 20px 0;'>" +
                "<p style='margin: 0; font-size: 14px;'>" +
                "<strong>📝 Action Required:</strong> Please collect the e-waste at the scheduled time and mark the request as completed in your dashboard." +
                "</p>" +
                "</div>" +
                "<p style='margin-top: 30px;'>Thank you for your dedication to making our planet cleaner! 🌍</p>" +
                "<p style='color: #dc2626; font-weight: bold;'>Team EcoSaathi</p>" +
                "</div>" +
                "<div style='text-align: center; padding: 20px; color: #999; font-size: 12px;'>" +
                "<p>&copy; 2025 EcoSaathi. All rights reserved.</p>" +
                "</div>" +
                "</body>" +
                "</html>";
    }

    // Helper methods for status-specific content
    private String getStatusColor(String status) {
        return switch (status) {
            case "APPROVED" -> "#10b981";
            case "SCHEDULED" -> "#3b82f6";
            case "COMPLETED" -> "#0b8457";
            case "REJECTED" -> "#ef4444";
            default -> "#6b7280";
        };
    }

    private String getStatusIcon(String status) {
        return switch (status) {
            case "APPROVED" -> "✅";
            case "SCHEDULED" -> "📅";
            case "COMPLETED" -> "🎉";
            case "REJECTED" -> "❌";
            default -> "📦";
        };
    }

    private String getStatusMessage(String status) {
        return switch (status) {
            case "APPROVED" -> "Great news! Your request has been approved. We'll schedule a pickup soon.";
            case "SCHEDULED" -> "Your pickup has been scheduled! Our team will collect your e-waste at the specified time.";
            case "COMPLETED" -> "Success! Your e-waste has been collected. Thank you for contributing to a greener planet!";
            case "REJECTED" -> "Unfortunately, your request couldn't be processed. Please contact support for details.";
            default -> "Your request status has been updated.";
        };
    }
}
