package com.lodha.EcoSaathi.Dto;

import lombok.Data;

@Data
public class ReplyRequest {
    private String role;
    private Long senderId;
    private String message;
}