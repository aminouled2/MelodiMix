package main.java;

import main.java.search.PlaylistCompiler;

public class Main {
    public static void main(String[] args) {
        if (args.length > 0) {
            String token = args[0];
            String mood = args[1];

            PlaylistCompiler compiler = new PlaylistCompiler();
            compiler.compilePlaylist(token, mood);
        } else {
            System.out.println("Hello World");
        }
    }
}