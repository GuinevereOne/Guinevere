package gemwire.guinevere.main;

import java.io.IOException;
import java.net.InetAddress;
import java.net.UnknownHostException;

public class ControlUnit {

    public static boolean error;
    public static String errorString;
    private static String message;

    public static String initialize() {
        try {
            if (InetAddress.getByName("192.168.0.50").isReachable(4)) {
                message = "Ready";
                error = false;
                return message;
            } else {
                errorString = "Unknown Host!";
                message = " Error: " + errorString;
                error = true;
                return message;
            }
        } catch (UnknownHostException exception) {
            errorString = "Unknown Host!";
            message = " Error: " + errorString;
            error = true;
            return message;
        } catch (IOException e) {
            errorString = "IO Exception!";
            message = " Error: " + errorString;
            error = true;
            return message;
        }
    }
}
