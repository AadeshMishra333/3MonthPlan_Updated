package util;

import java.util.Scanner;

public class InputUtil {
    private static final Scanner sc = new Scanner(System.in);

    public static String line(String prompt) {
        System.out.print(prompt);
        return sc.nextLine().trim();
    }

    public static int intLine(String prompt, int def) {
        String s = line(prompt);
        try { return s.isEmpty() ? def : Integer.parseInt(s); } catch (Exception e) { return def; }
    }

    public static double doubleLine(String prompt, double def) {
        String s = line(prompt);
        try { return s.isEmpty() ? def : Double.parseDouble(s); } catch (Exception e) { return def; }
    }
}
