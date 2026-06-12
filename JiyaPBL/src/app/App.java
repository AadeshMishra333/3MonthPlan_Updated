package app;

import storage.PlaceStore;
import web.WebServer;

public class App {

    public static void main(String[] args) throws Exception {

        PlaceStore store = new PlaceStore();

        // Start web server
        WebServer.start(store);

        System.out.println("Open browser and go to:");
        System.out.println("http://localhost:6050");
    }
}
