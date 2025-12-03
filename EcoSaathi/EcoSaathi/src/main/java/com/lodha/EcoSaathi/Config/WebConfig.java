// src/com/lodha/EcoSaathi/Config/WebConfig.java

package com.lodha.EcoSaathi.Config;

import org.springframework.context.annotation.Configuration;
import org.springframework.web.servlet.config.annotation.ResourceHandlerRegistry;
import org.springframework.web.servlet.config.annotation.WebMvcConfigurer;

@Configuration
public class WebConfig implements WebMvcConfigurer {

    private final FileStorageProperties fileStorageProperties;

    public WebConfig(FileStorageProperties fileStorageProperties) {
        this.fileStorageProperties = fileStorageProperties;
    }

    @Override
    public void addResourceHandlers(ResourceHandlerRegistry registry) {
        String uploadPath = "file:" + fileStorageProperties.getUploadDir() + "/";

        registry.addResourceHandler("/images/**")
                .addResourceLocations(uploadPath);
    }
}