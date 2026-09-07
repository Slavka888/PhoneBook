package com.example.demo;

import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@CrossOrigin("*")
@RestController
@RequestMapping("/api/contacts")
public class ContactController {
    private final Repository repository;

    @Autowired
    public ContactController(Repository repository) {
        this.repository = repository;
    }

    @GetMapping
    public ResponseEntity<List<Contact>> getContacts() {
        return ResponseEntity.ok(repository.findAll());
    }

    @GetMapping("/{id}")
    public ResponseEntity<Contact> getContactById(@PathVariable int id) {
        Contact contact = repository.findById(id).orElse(null);
        if  (contact == null) {
            return ResponseEntity.notFound().build();
        }
        return ResponseEntity.ok(contact);
    }

    @PostMapping
    public ResponseEntity<Contact> createContact(@RequestBody Contact contact) {
        Contact createdContact = repository.save(contact);
        return ResponseEntity.status(HttpStatus.CREATED).body(createdContact);
    }

    @PutMapping("/{id}")
    public ResponseEntity<Contact> updateContact(@PathVariable int id, @RequestBody Contact contact) {
        Contact updatedContact = repository.findById(id).orElse(null);
        if (updatedContact == null) {
            return ResponseEntity.notFound().build();
        }
        updatedContact.setUsername(contact.getUsername());
        updatedContact.setEmail(contact.getEmail());
        updatedContact.setPhone(contact.getPhone());
        repository.save(updatedContact);
        return ResponseEntity.ok(updatedContact);
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void>  deleteContact(@PathVariable int id) {
        if(repository.existsById(id)) {
            repository.deleteById(id);
            return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
        }
        else{
            return ResponseEntity.notFound().build();
        }
    }

    @DeleteMapping
    public ResponseEntity<Void>  deleteAllContacts() {
        repository.deleteAll();
        return ResponseEntity.status(HttpStatus.NO_CONTENT).build();
    }
}
