package gemwire.guinevere.main;

import java.io.FileWriter;
import java.io.IOException;
import java.nio.charset.Charset;
import java.nio.file.Files;
import java.nio.file.Path;
import java.nio.file.Paths;
import java.util.ArrayList;
import java.util.Arrays;
import java.util.Iterator;
import java.util.List;


import static gemwire.guinevere.main.Commands.log;


public class Tricks {
	public static boolean error = false;

	public static Path dbPath = Paths.get("tricks.db");

	public static List<Trick> tricks = new ArrayList<>();


	public static boolean saveTrick(Trick trick) {
		String line;
		try {
			FileWriter writer = new FileWriter(dbPath.toString());
			// Needs to be improved - multiple annotations!
			line = trick.invocation + "|" + trick.content + "|" + trick.attachments + "\n";
			log("Writing trick line " + line + " to file tricks.db", "trick");
			////////////////////////////////////////////////////////////
			writer.write(line);
			writer.flush();
			writer.close();
			log("Line written.", "trick");
			return true;
		} catch (IOException e) {
			System.out.println("[INFO] Trick database file does not exist for writing!");
			return false;
		}


	}

	public static Trick findTrick(String invocation) {
		for (Trick trick : tricks) {
			if(trick.invocation.equals(invocation)) {
				return trick;
			}
		}
		log("No trick found for invocation " + invocation, "trick");
		return new Trick("", new ArrayList<>());
	}

	public static List<Trick> loadTricks() {
		List<String> lines = new ArrayList<>();
		List<Trick> tricks = new ArrayList<>();

		try {
			lines = Files.readAllLines(dbPath, Charset.defaultCharset());
		} catch (IOException e) {
			log("Trick database file does not exist for reading!", "");

		}

		Iterator<String> lineIter = lines.iterator();

		while(lineIter.hasNext()) {
			List<String> curLine = Arrays.asList(lineIter.next().split("\\|"));
			Iterator<String> curLineIter = curLine.iterator();
			String invocation = curLineIter.next();
			List<String> content = Arrays.asList(curLineIter.next().replace("[", "").replace("]", ""));
			log("Trick content line: " + content, "trick");

			log("Found trick with invocation " + invocation + " and content " + content, "trick");

			Trick curTrick = new Trick(invocation, content);
			//AttachmentBean attach = (AttachmentBean) trickparts[2];
			//curTrick.addAttachment( trickparts[2], Main.botClient);
			tricks.add(curTrick);

		}
		return tricks;
	}

	public static String initialize() {
		tricks = loadTricks();

		return "Ready";
	}
	
}