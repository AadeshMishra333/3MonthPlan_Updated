package ui;

import storage.PlaceStore;
import util.InputUtil;
import model.Place;
import java.util.List;

public class Menu {
    private final PlaceStore store;

    public Menu(PlaceStore store) {
        this.store = store;
    }

    public void start() {
        System.out.println("Smart City Guide (console)");
        while (true) {
            System.out.println("\n1) List all places");
            System.out.println("2) Search");
            System.out.println("3) Add place");
            System.out.println("4) Delete by id");
            System.out.println("5) Save now");
            System.out.println("0) Save & Exit");

            String c = InputUtil.line("Choose: ");
            switch (c) {
                case "1":
                    listAll();
                    break;
                case "2":
                    search();
                    break;
                case "3":
                    add();
                    break;
                case "4":
                    delete();
                    break;
                case "5":
                    store.save();
                    System.out.println("Saved.");
                    break;
                case "0":
                    store.save();
                    System.out.println("Saved. Bye.");
                    return;
                default:
                    System.out.println("Invalid.");
            }
        }
    }

    private void listAll() {
        List<Place> all = store.all();
        if (all.isEmpty()) System.out.println("[no places]");
        else all.forEach(System.out::println);
    }

    private void search() {
        String q = InputUtil.line("Search term: ");
        List<Place> res = store.search(q);
        if (res.isEmpty()) System.out.println("[no results]");
        else res.forEach(System.out::println);
    }

    private void add() {
        String name = InputUtil.line("Name: ");
        if (name.isEmpty()) { System.out.println("Name required."); return; }
        String cat = InputUtil.line("Category: ");
        String addr = InputUtil.line("Address: ");
        double r = InputUtil.doubleLine("Rating (0-5): ", 0.0);
        if (r < 0) r = 0; if (r > 5) r = 5;
        double lat = InputUtil.doubleLine("Latitude: ", 0.0);
        double lng = InputUtil.doubleLine("Longitude: ", 0.0);
        Place p = store.add(name, cat.isEmpty() ? "General" : cat, addr, r, lat, lng);
        System.out.println("Added: " + p);
    }

    private void delete() {
        int id = InputUtil.intLine("ID to delete: ", -1);
        if (id <= 0) { System.out.println("Invalid id"); return; }
        boolean ok = store.delete(id);
        System.out.println(ok ? "Deleted." : "Not found.");
    }
}
