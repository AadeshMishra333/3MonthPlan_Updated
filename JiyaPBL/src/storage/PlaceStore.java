package storage;

import java.sql.*;
import java.util.*;
import model.Place;

public class PlaceStore {

    // ---------- RELATIVE DB PATH (works on any machine) ----------
    private static final String DB_URL =
        "jdbc:sqlite:data/scity.db";

    // ---------- CONSTRUCTOR ----------
    public PlaceStore() {
        init();
    }

    // ---------- DB CONNECTION ----------
    private Connection connect() throws SQLException {
        return DriverManager.getConnection(DB_URL);
    }

    // ---------- CREATE TABLES ----------
    private void init() {

        String placesTable = """
            CREATE TABLE IF NOT EXISTS places (
                id INTEGER PRIMARY KEY AUTOINCREMENT,
                name TEXT NOT NULL,
                category TEXT NOT NULL,
                address TEXT NOT NULL,
                rating REAL,
                latitude REAL,
                longitude REAL
            );
        """;

        String detailsTable = """
            CREATE TABLE IF NOT EXISTS place_details (
                place_id INTEGER PRIMARY KEY,
                history TEXT,
                description TEXT,
                interesting_facts TEXT,
                year_established INTEGER,
                FOREIGN KEY (place_id) REFERENCES places(id) ON DELETE CASCADE
            );
        """;

        try (Connection con = connect();
             Statement st = con.createStatement()) {

            st.execute(placesTable);
            st.execute(detailsTable);

        } catch (Exception e) {
            System.out.println("DB init failed: " + e.getMessage());
        }
    }

    // ---------- ADD PLACE ----------
    public synchronized Place add(
            String name,
            String category,
            String address,
            double rating,
            double latitude,
            double longitude
    ) {

        String sql = """
            INSERT INTO places(name, category, address, rating, latitude, longitude)
            VALUES(?,?,?,?,?,?)
        """;

        try (Connection con = connect();
             PreparedStatement ps =
                     con.prepareStatement(sql, Statement.RETURN_GENERATED_KEYS)) {

            ps.setString(1, name);
            ps.setString(2, category);
            ps.setString(3, address);
            ps.setDouble(4, rating);
            ps.setDouble(5, latitude);
            ps.setDouble(6, longitude);
            ps.executeUpdate();

            ResultSet rs = ps.getGeneratedKeys();
            if (rs.next()) {
                return new Place(
                        rs.getInt(1),
                        name,
                        category,
                        address,
                        rating,
                        latitude,
                        longitude
                );
            }

        } catch (Exception e) {
            System.out.println("Add failed: " + e.getMessage());
        }

        return null;
    }

    // ---------- UPDATE PLACE ----------
    public synchronized boolean update(
            int id,
            String name,
            String category,
            String address,
            double rating,
            double latitude,
            double longitude
    ) {

        String sql = """
            UPDATE places
            SET name=?, category=?, address=?, rating=?, latitude=?, longitude=?
            WHERE id=?
        """;

        try (Connection con = connect();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1, name);
            ps.setString(2, category);
            ps.setString(3, address);
            ps.setDouble(4, rating);
            ps.setDouble(5, latitude);
            ps.setDouble(6, longitude);
            ps.setInt(7, id);
            return ps.executeUpdate() > 0;

        } catch (Exception e) {
            System.out.println("Update failed: " + e.getMessage());
        }

        return false;
    }

    // ---------- DELETE PLACE ----------
    public synchronized boolean delete(int id) {

        // Also delete from place_details
        String detailSql = "DELETE FROM place_details WHERE place_id=?";
        String placeSql = "DELETE FROM places WHERE id=?";

        try (Connection con = connect()) {

            try (PreparedStatement ps = con.prepareStatement(detailSql)) {
                ps.setInt(1, id);
                ps.executeUpdate();
            }

            try (PreparedStatement ps = con.prepareStatement(placeSql)) {
                ps.setInt(1, id);
                return ps.executeUpdate() > 0;
            }

        } catch (Exception e) {
            System.out.println("Delete failed: " + e.getMessage());
        }

        return false;
    }

    // ---------- ADD OR UPDATE PLACE DETAILS ----------
    public synchronized boolean addOrUpdateDetails(
            int placeId,
            String history,
            String description,
            String interestingFacts,
            int yearEstablished
    ) {

        String sql = """
            INSERT INTO place_details(place_id, history, description, interesting_facts, year_established)
            VALUES(?,?,?,?,?)
            ON CONFLICT(place_id) DO UPDATE SET
                history=excluded.history,
                description=excluded.description,
                interesting_facts=excluded.interesting_facts,
                year_established=excluded.year_established
        """;

        try (Connection con = connect();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setInt(1, placeId);
            ps.setString(2, history);
            ps.setString(3, description);
            ps.setString(4, interestingFacts);
            ps.setInt(5, yearEstablished);
            return ps.executeUpdate() > 0;

        } catch (Exception e) {
            System.out.println("Details save failed: " + e.getMessage());
        }

        return false;
    }

    // ---------- SEARCH PLACES ----------
    public synchronized List<Place> search(String q) {

        List<Place> out = new ArrayList<>();

        String sql = """
            SELECT * FROM places
            WHERE LOWER(name) LIKE ?
               OR LOWER(category) LIKE ?
               OR LOWER(address) LIKE ?
        """;

        String like = "%" + q.toLowerCase() + "%";

        try (Connection con = connect();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setString(1, like);
            ps.setString(2, like);
            ps.setString(3, like);

            ResultSet rs = ps.executeQuery();
            while (rs.next()) {
                out.add(new Place(
                        rs.getInt("id"),
                        rs.getString("name"),
                        rs.getString("category"),
                        rs.getString("address"),
                        rs.getDouble("rating"),
                        rs.getDouble("latitude"),
                        rs.getDouble("longitude")
                ));
            }

        } catch (Exception e) {
            System.out.println("Search failed: " + e.getMessage());
        }

        return out;
    }

    // ---------- GET PLACE WITH DETAILS ----------
    public Place getPlaceDetails(int placeId) {

        String sql = """
            SELECT p.id, p.name, p.category, p.address, p.rating,
                   p.latitude, p.longitude,
                   d.history, d.description,
                   d.interesting_facts, d.year_established
            FROM places p
            LEFT JOIN place_details d
            ON p.id = d.place_id
            WHERE p.id = ?
        """;

        try (Connection con = connect();
             PreparedStatement ps = con.prepareStatement(sql)) {

            ps.setInt(1, placeId);
            ResultSet rs = ps.executeQuery();

            if (rs.next()) {
                Place p = new Place();

                p.id = rs.getInt("id");
                p.name = rs.getString("name");
                p.category = rs.getString("category");
                p.address = rs.getString("address");
                p.rating = rs.getDouble("rating");
                p.latitude = rs.getDouble("latitude");
                p.longitude = rs.getDouble("longitude");

                p.history = rs.getString("history");
                p.description = rs.getString("description");
                p.interestingFacts = rs.getString("interesting_facts");
                p.yearEstablished = rs.getInt("year_established");

                return p;
            }

        } catch (Exception e) {
            e.printStackTrace();
        }

        return null;
    }

    // ---------- GET ALL PLACES ----------
    public synchronized List<Place> all() {

        List<Place> out = new ArrayList<>();

        String sql = "SELECT * FROM places";

        try (Connection con = connect();
             Statement st = con.createStatement();
             ResultSet rs = st.executeQuery(sql)) {

            while (rs.next()) {
                out.add(new Place(
                        rs.getInt("id"),
                        rs.getString("name"),
                        rs.getString("category"),
                        rs.getString("address"),
                        rs.getDouble("rating"),
                        rs.getDouble("latitude"),
                        rs.getDouble("longitude")
                ));
            }

        } catch (Exception e) {
            System.out.println("Fetch failed: " + e.getMessage());
        }

        return out;
    }

    // ---------- GET ALL CATEGORIES ----------
    public synchronized List<String> allCategories() {

        List<String> out = new ArrayList<>();

        String sql = "SELECT DISTINCT category FROM places ORDER BY category";

        try (Connection con = connect();
             Statement st = con.createStatement();
             ResultSet rs = st.executeQuery(sql)) {

            while (rs.next()) {
                out.add(rs.getString("category"));
            }

        } catch (Exception e) {
            System.out.println("Categories failed: " + e.getMessage());
        }

        return out;
    }

    // ---------- SAVE (no-op for SQLite auto-commit) ----------
    public void save() {
        // SQLite auto-commits; this exists for Menu.java compatibility
    }
}
