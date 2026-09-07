package com.example.demo;

import jakarta.persistence.Embeddable;

@Embeddable
public class Phone {
    private String mobile;
    private String home;

    public Phone() {
    }

    public Phone(String mobile, String home) {
        this.mobile = mobile;
        this.home = home;
    }

    public String getMobile() {
        return mobile;
    }

    public void setMobile(String mobile) {
        this.mobile = mobile;
    }

    public String getHome() {
        return home;
    }

    public void setHome(String home) {
        this.home = home;
    }
}
