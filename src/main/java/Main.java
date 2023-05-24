package src.main.java;
import java.io.IOException;

import src.main.java.utils.RequestHandler;

public class Main {
    public static void main(String[] args) throws IOException {
        String resData = RequestHandler.makeGetRequest("https://example.com");
        System.out.println(resData);
    }
}