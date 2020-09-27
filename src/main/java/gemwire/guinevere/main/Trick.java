package gemwire.guinevere.main;

import discord4j.core.DiscordClient;
import discord4j.core.object.data.stored.AttachmentBean;
import discord4j.core.object.entity.Attachment;

import java.util.ArrayList;
import java.util.List;

import static gemwire.guinevere.main.Commands.log;
import static gemwire.guinevere.main.Tricks.tricks;

public class Trick {


	public String invocation = "";
	public List<String> content = new ArrayList<>();
	public List<Attachment> attachments = new ArrayList<>();

	public Trick(String invoke, List<String> content) {
		log("Creating trick", "trick");
		if(!invoke.equals("")) {
			this.invocation = invoke;
			this.content = content;
			tricks.add(this);
			log("New trick added to internal storage.", "trick");
		}
	}

	public Trick write() {
		Tricks.saveTrick(this);
		return this;
	}

	public void setContent(List<String> content) {
		this.content = content;
	}

	public List<String> getAttachmentURLs() {
		List<String> urls = new ArrayList<>();
		for(Attachment attach : attachments) {
			urls.add(attach.getUrl());
		}
		return urls;
	}

	public Trick addAttachment(AttachmentBean attachment, DiscordClient client) {
		Attachment fullAttachment = new Attachment(client.getServiceMediator(), attachment);
		this.attachments.add(fullAttachment);
		return this;
	}


	public Trick edit(List<String> content) {
		this.setContent(content);
		return this;
	}


}
