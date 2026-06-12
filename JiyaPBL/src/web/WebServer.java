package web;

import com.sun.net.httpserver.HttpExchange;
import com.sun.net.httpserver.HttpServer;
import java.io.*;
import java.net.InetSocketAddress;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;
import java.nio.file.Files;
import java.nio.file.Paths;
import java.util.*;
import model.Place;
import storage.PlaceStore;

public class WebServer {

    public static void start(PlaceStore store) throws Exception {

        HttpServer server = HttpServer.create(new InetSocketAddress(6050), 0);

        // ---------------- HOME PAGE ----------------
        server.createContext("/", exchange -> {
            try {
                byte[] html = Files.readAllBytes(Paths.get("web/index.html"));
                sendResponse(exchange, 200, "text/html; charset=UTF-8", html);
            } catch (Exception e) {
                sendJsonError(exchange, 500, "Could not load page");
            }
        });

        // ---------------- LIST ALL PLACES ----------------
        server.createContext("/places", exchange -> {
            try {
                sendPlacesJson(exchange, store.all());
            } catch (Exception e) {
                sendJsonError(exchange, 500, "Failed to fetch places");
            }
        });

        // ---------------- SEARCH ----------------
        server.createContext("/search", exchange -> {
            try {
                String q = getParam(exchange, "q");
                sendPlacesJson(exchange, store.search(q));
            } catch (Exception e) {
                sendJsonError(exchange, 500, "Search failed");
            }
        });

        // ---------------- CATEGORIES ----------------
        server.createContext("/categories", exchange -> {
            try {
                List<String> cats = store.allCategories();
                StringBuilder sb = new StringBuilder("[");
                for (int i = 0; i < cats.size(); i++) {
                    sb.append("\"").append(jsonEscape(cats.get(i))).append("\"");
                    if (i < cats.size() - 1) sb.append(",");
                }
                sb.append("]");
                addCorsHeaders(exchange);
                byte[] b = sb.toString().getBytes(StandardCharsets.UTF_8);
                sendResponse(exchange, 200, "application/json; charset=UTF-8", b);
            } catch (Exception e) {
                sendJsonError(exchange, 500, "Failed to load categories");
            }
        });

        // ---------------- ADD PLACE ----------------
        server.createContext("/add", exchange -> {
            try {
                Map<String, String> data = readPostData(exchange);

                String name = data.getOrDefault("name", "").trim();
                String category = data.getOrDefault("category", "General").trim();
                String address = data.getOrDefault("address", "").trim();

                if (name.isEmpty()) {
                    sendJsonError(exchange, 400, "Name is required");
                    return;
                }

                double rating = parseDouble(data.get("rating"), 0.0);
                double lat = parseDouble(data.get("latitude"), 0.0);
                double lng = parseDouble(data.get("longitude"), 0.0);

                if (rating < 0) rating = 0;
                if (rating > 5) rating = 5;

                Place p = store.add(name, category, address, rating, lat, lng);

                if (p != null) {
                    addCorsHeaders(exchange);
                    byte[] json = p.toJsonBasic().getBytes(StandardCharsets.UTF_8);
                    sendResponse(exchange, 200, "application/json; charset=UTF-8", json);
                } else {
                    sendJsonError(exchange, 500, "Failed to add place");
                }
            } catch (Exception e) {
                sendJsonError(exchange, 500, "Add failed: " + e.getMessage());
            }
        });

        // ---------------- UPDATE PLACE ----------------
        server.createContext("/update", exchange -> {
            try {
                Map<String, String> data = readPostData(exchange);

                int id = parseInt(data.get("id"), -1);
                if (id <= 0) {
                    sendJsonError(exchange, 400, "Valid ID is required");
                    return;
                }

                String name = data.getOrDefault("name", "").trim();
                String category = data.getOrDefault("category", "General").trim();
                String address = data.getOrDefault("address", "").trim();
                double rating = parseDouble(data.get("rating"), 0.0);
                double lat = parseDouble(data.get("latitude"), 0.0);
                double lng = parseDouble(data.get("longitude"), 0.0);

                if (rating < 0) rating = 0;
                if (rating > 5) rating = 5;

                boolean ok = store.update(id, name, category, address, rating, lat, lng);
                sendJsonMessage(exchange, ok ? "Place updated" : "Place not found");
            } catch (Exception e) {
                sendJsonError(exchange, 500, "Update failed: " + e.getMessage());
            }
        });

        // ---------------- DELETE PLACE ----------------
        server.createContext("/delete", exchange -> {
            try {
                int id = parseInt(getParam(exchange, "id"), -1);
                if (id <= 0) {
                    sendJsonError(exchange, 400, "Valid ID is required");
                    return;
                }
                boolean ok = store.delete(id);
                sendJsonMessage(exchange, ok ? "Deleted" : "ID not found");
            } catch (Exception e) {
                sendJsonError(exchange, 500, "Delete failed: " + e.getMessage());
            }
        });

        // ---------------- PLACE DETAILS (HISTORY ETC.) ----------------
        server.createContext("/place/details", exchange -> {
            try {
                String method = exchange.getRequestMethod();

                // GET = fetch details, POST = save details
                if ("POST".equalsIgnoreCase(method)) {
                    // Save details
                    Map<String, String> data = readPostData(exchange);

                    int placeId = parseInt(data.get("place_id"), -1);
                    if (placeId <= 0) {
                        sendJsonError(exchange, 400, "Valid place_id is required");
                        return;
                    }

                    String history = data.getOrDefault("history", "");
                    String description = data.getOrDefault("description", "");
                    String facts = data.getOrDefault("interesting_facts", "");
                    int year = parseInt(data.get("year_established"), 0);

                    boolean ok = store.addOrUpdateDetails(placeId, history, description, facts, year);
                    sendJsonMessage(exchange, ok ? "Details saved" : "Failed to save details");

                } else {
                    // GET details
                    int id = parseInt(getParam(exchange, "id"), -1);
                    if (id <= 0) {
                        sendJsonError(exchange, 400, "Valid ID is required");
                        return;
                    }

                    Place p = store.getPlaceDetails(id);
                    if (p == null) {
                        sendJsonError(exchange, 404, "Place not found");
                        return;
                    }

                    addCorsHeaders(exchange);
                    byte[] json = p.toJsonFull().getBytes(StandardCharsets.UTF_8);
                    sendResponse(exchange, 200, "application/json; charset=UTF-8", json);
                }
            } catch (Exception e) {
                sendJsonError(exchange, 500, "Details request failed: " + e.getMessage());
            }
        });

        server.start();
        System.out.println("Web server running at http://localhost:6050");
    }

    // ---------- SEND PLACES JSON (using Place.toJsonBasic) ----------
    private static void sendPlacesJson(
            HttpExchange ex,
            List<Place> places
    ) throws IOException {

        StringBuilder sb = new StringBuilder("[");
        for (int i = 0; i < places.size(); i++) {
            sb.append(places.get(i).toJsonBasic());
            if (i < places.size() - 1) sb.append(",");
        }
        sb.append("]");

        addCorsHeaders(ex);
        byte[] b = sb.toString().getBytes(StandardCharsets.UTF_8);
        sendResponse(ex, 200, "application/json; charset=UTF-8", b);
    }

    // ---------- SEND RESPONSE ----------
    private static void sendResponse(
            HttpExchange ex,
            int code,
            String contentType,
            byte[] body
    ) throws IOException {
        ex.getResponseHeaders().set("Content-Type", contentType);
        ex.sendResponseHeaders(code, body.length);
        ex.getResponseBody().write(body);
        ex.close();
    }

    // ---------- SEND JSON MESSAGE ----------
    private static void sendJsonMessage(
            HttpExchange ex,
            String message
    ) throws IOException {
        String json = "{\"message\":\"" + jsonEscape(message) + "\"}";
        addCorsHeaders(ex);
        byte[] b = json.getBytes(StandardCharsets.UTF_8);
        sendResponse(ex, 200, "application/json; charset=UTF-8", b);
    }

    // ---------- SEND JSON ERROR ----------
    private static void sendJsonError(
            HttpExchange ex,
            int code,
            String error
    ) throws IOException {
        String json = "{\"error\":\"" + jsonEscape(error) + "\"}";
        addCorsHeaders(ex);
        byte[] b = json.getBytes(StandardCharsets.UTF_8);
        sendResponse(ex, code, "application/json; charset=UTF-8", b);
    }

    // ---------- ADD CORS HEADERS ----------
    private static void addCorsHeaders(HttpExchange ex) {
        ex.getResponseHeaders().set("Access-Control-Allow-Origin", "*");
        ex.getResponseHeaders().set("Access-Control-Allow-Methods", "GET, POST, OPTIONS");
        ex.getResponseHeaders().set("Access-Control-Allow-Headers", "Content-Type");
    }

    // ---------- GET QUERY PARAM ----------
    private static String getParam(
            HttpExchange ex,
            String key
    ) {

        String q = ex.getRequestURI().getQuery();
        if (q == null) return "";

        for (String s : q.split("&")) {
            String[] p = s.split("=", 2);
            if (p[0].equals(key) && p.length > 1) {
                return URLDecoder.decode(p[1], StandardCharsets.UTF_8);
            }
        }
        return "";
    }

    // ---------- READ POST DATA ----------
    private static Map<String, String> readPostData(
            HttpExchange ex
    ) throws IOException {

        BufferedReader br =
            new BufferedReader(new InputStreamReader(ex.getRequestBody(), StandardCharsets.UTF_8));

        String line = br.readLine();
        Map<String, String> map = new HashMap<>();

        if (line != null && !line.isEmpty()) {
            for (String s : line.split("&")) {
                String[] p = s.split("=", 2);
                if (p.length == 2) {
                    map.put(p[0], URLDecoder.decode(p[1], StandardCharsets.UTF_8));
                } else {
                    map.put(p[0], "");
                }
            }
        }
        return map;
    }

    // ---------- SAFE PARSE HELPERS ----------
    private static double parseDouble(String s, double def) {
        if (s == null || s.isEmpty()) return def;
        try { return Double.parseDouble(s.trim()); }
        catch (NumberFormatException e) { return def; }
    }

    private static int parseInt(String s, int def) {
        if (s == null || s.isEmpty()) return def;
        try { return Integer.parseInt(s.trim()); }
        catch (NumberFormatException e) { return def; }
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
}
