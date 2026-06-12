package model;

public class Place {

    // ---------- BASIC PLACE INFO ----------
    public int id;
    public String name;
    public String category;
    public String address;
    public double rating;

    // ---------- MAP COORDINATES ----------
    public double latitude;
    public double longitude;

    // ---------- PLACE DETAILS ----------
    public String history;
    public String description;
    public String interestingFacts;
    public int yearEstablished;

    // ---------- DEFAULT CONSTRUCTOR ----------
    // REQUIRED for JDBC / JSON / DB mapping
    public Place() {
    }

    // ---------- PARAMETERIZED CONSTRUCTOR ----------
    public Place(
            int id,
            String name,
            String category,
            String address,
            double rating,
            double latitude,
            double longitude
    ) {
        this.id = id;
        this.name = name;
        this.category = category;
        this.address = address;
        this.rating = rating;
        this.latitude = latitude;
        this.longitude = longitude;
    }

    // ---------- JSON (basic fields) ----------
    public String toJsonBasic() {
        return """
            {
              "id": %d,
              "name": "%s",
              "category": "%s",
              "address": "%s",
              "rating": %.1f,
              "latitude": %.6f,
              "longitude": %.6f
            }""".formatted(
                id,
                jsonEscape(name),
                jsonEscape(category),
                jsonEscape(address),
                rating,
                latitude,
                longitude
        );
    }

    // ---------- JSON (full, with details) ----------
    public String toJsonFull() {
        return """
            {
              "id": %d,
              "name": "%s",
              "category": "%s",
              "address": "%s",
              "rating": %.1f,
              "latitude": %.6f,
              "longitude": %.6f,
              "history": "%s",
              "description": "%s",
              "interestingFacts": "%s",
              "yearEstablished": %d
            }""".formatted(
                id,
                jsonEscape(name),
                jsonEscape(category),
                jsonEscape(address),
                rating,
                latitude,
                longitude,
                jsonEscape(history),
                jsonEscape(description),
                jsonEscape(interestingFacts),
                yearEstablished
        );
    }

    // ---------- JSON ESCAPE ----------
    private static String jsonEscape(String s) {
        if (s == null) return "";
        return s.replace("\\", "\\\\")
                .replace("\"", "\\\"")
                .replace("\n", "\\n")
                .replace("\r", "\\r")
                .replace("\t", "\\t");
    }

    // ---------- TO STRING ----------
    @Override
    public String toString() {
        return id + " | " + name + " (" + category + ") - "
                + rating + " | " + address;
    }
}
