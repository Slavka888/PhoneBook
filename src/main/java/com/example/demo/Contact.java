package com.example.demo;

import jakarta.persistence.*;

@Entity
public class Contact {
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private int id;

    @Column()
    private String username;

    @Column()
    private String email;

    @Embedded
    private Phone phone;

    public Contact() {
        this.phone = new Phone();
    }

    public Contact(String username, String email, String mobile, String home){
        this.username = username;
        this.email = email;
        this.phone = new Phone(mobile,home);
    }

    public int getId() {
        return id;
    }

    public void setId(int id) {
        this.id = id;
    }

    public String getUsername() {
        return username;
    }

    public void setUsername(String username) {
        this.username = username;
    }

    public String getEmail() {
        return email;
    }

    public void setEmail(String email) {
        this.email = email;
    }

    public Phone getPhone() {
        return phone;
    }

    public void setPhone(Phone phone) {
        this.phone = phone;
    }
}
