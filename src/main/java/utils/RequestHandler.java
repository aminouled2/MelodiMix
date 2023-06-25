package main.java.utils;

import java.io.BufferedReader;
import java.io.IOException;
import java.io.InputStreamReader;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.Map;

public class RequestHandler {
    private static final String API_BASE_URL = "https://api.spotify.com/v1/";

    public static String sendGetRequest(String endpoint, Map<String, String> headers) throws IOException {
        URL url = new URL(API_BASE_URL + endpoint);
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        connection.setRequestMethod("GET");
        setHeaders(connection, headers);

        int responseCode = connection.getResponseCode();
        if (responseCode == HttpURLConnection.HTTP_OK) {
            return readResponse(connection);
        } else {
            throw new IOException("GET request failed with response code: " + responseCode);
        }
    }

    public static String sendPostRequest(String endpoint, String data, Map<String, String> headers) throws IOException {
        URL url = new URL(API_BASE_URL + endpoint);
        HttpURLConnection connection = (HttpURLConnection) url.openConnection();
        connection.setRequestMethod("POST");
        setHeaders(connection, headers);
        connection.setDoOutput(true);
        connection.getOutputStream().write(data.getBytes());

        int responseCode = connection.getResponseCode();
        if (responseCode == HttpURLConnection.HTTP_OK) {
            return readResponse(connection);
        } else {
            String errorMessage = readErrorResponse(connection);
            throw new IOException("POST request failed with response code: " + responseCode + "; Error Message: " + errorMessage);
        }
    }

    private static String readErrorResponse(HttpURLConnection connection) throws IOException {
        BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getErrorStream()));
        StringBuilder response = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            response.append(line);
        }
        reader.close();
        return response.toString();
    }

    private static void setHeaders(HttpURLConnection connection, Map<String, String> headers) {
        if (headers != null) {
            for (Map.Entry<String, String> entry : headers.entrySet()) {
                connection.setRequestProperty(entry.getKey(), entry.getValue());
            }
        }
    }

    private static String readResponse(HttpURLConnection connection) throws IOException {
        BufferedReader reader = new BufferedReader(new InputStreamReader(connection.getInputStream()));
        StringBuilder response = new StringBuilder();
        String line;
        while ((line = reader.readLine()) != null) {
            response.append(line);
        }
        reader.close();
        return response.toString();
    }
}
