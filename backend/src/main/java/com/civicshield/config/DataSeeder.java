package com.civicshield.config;

import com.civicshield.model.Complaint;
import com.civicshield.repository.ComplaintRepository;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.boot.CommandLineRunner;
import org.springframework.stereotype.Component;

@Component
public class DataSeeder implements CommandLineRunner {

    private static final Logger log = LoggerFactory.getLogger(DataSeeder.class);
    private final ComplaintRepository complaintRepository;

    public DataSeeder(ComplaintRepository complaintRepository) {
        this.complaintRepository = complaintRepository;
    }

    @Override
    public void run(String... args) {
        if (complaintRepository.count() == 0) {
            log.info("Seeding initial sample complaints into database...");

            Complaint c1 = new Complaint(
                    "Sarah Jenkins",
                    "Main St & 5th Avenue",
                    "Roads",
                    "Hazardous deep pothole in the middle lane causing vehicle damage and sudden braking risks.",
                    null,
                    "PENDING"
            );

            Complaint c2 = new Complaint(
                    "Michael Chen",
                    "Central Park West, Gate 3",
                    "Water",
                    "Clean water pipe rupture causing continuous flooding on pedestrian walkway since early morning.",
                    null,
                    "IN_PROGRESS"
            );

            Complaint c3 = new Complaint(
                    "Elena Rostova",
                    "Elm Street Block 4",
                    "Streetlights",
                    "Multiple streetlight poles are completely dark, creating safety concerns for evening commuters.",
                    null,
                    "RESOLVED"
            );

            Complaint c4 = new Complaint(
                    "David Miller",
                    "Market Square Plaza",
                    "Sanitation",
                    "Overflowing commercial waste container attracting pests near food stalls. Requires urgent clearing.",
                    null,
                    "PENDING"
            );

            complaintRepository.save(c1);
            complaintRepository.save(c2);
            complaintRepository.save(c3);
            complaintRepository.save(c4);

            log.info("Successfully seeded 4 sample complaints.");
        }
    }
}
