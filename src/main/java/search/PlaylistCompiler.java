package main.java.search;
import java.util.Map;
import main.java.utils.RequestHandler;

public class PlaylistCompiler {
    public void compilePlaylist(String token, String mood) {
        try {
            String getEndpoint = "search?q="+ mood +"&type=playlist";
            String accessToken = token;
            String authorizationHeader = "Bearer " + accessToken;
            Map<String, String> getHeaders = Map.of("Authorization", authorizationHeader);
            String getResponse = RequestHandler.sendGetRequest(getEndpoint, getHeaders);
            System.out.println(getResponse);
        } catch (Exception e) {
             e.printStackTrace();
        }
    }
}
