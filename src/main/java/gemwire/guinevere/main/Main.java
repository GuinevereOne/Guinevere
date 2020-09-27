package gemwire.guinevere.main;

import discord4j.core.DiscordClient;
import discord4j.core.DiscordClientBuilder;
import discord4j.core.event.domain.lifecycle.ReadyEvent;
import discord4j.core.event.domain.message.MessageCreateEvent;
import discord4j.core.object.entity.Message;
import discord4j.rest.http.client.ClientException;

import static gemwire.guinevere.main.Commands.handleMessage;

public class Main {

    public static DiscordClient botClient;

    public static void main(String[] args) {
        botClient = new DiscordClientBuilder(Constants.token).build();

        botClient.getEventDispatcher().on(ReadyEvent.class)
                .subscribe(event -> {
                    System.out.println("Ready!");
                    //client.getChannelById(Snowflake.of(Constants.homeChannel)).subscribe(channel -> ((MessageChannel)channel).createMessage("It's Guinevere Time!").subscribe());
                    //MessageChannel homeChannel = (MessageChannel) client.getChannelById(Snowflake.of(Constants.homeChannel)).block();


                });

        botClient.getEventDispatcher().on(MessageCreateEvent.class)
                .subscribe(event -> {
                            Message mess = event.getMessage();
                            handleMessage(mess);
                });

        botClient.login().block();
    }


}


// TODO:
/*
static void UpdatePresence()
{
    DiscordRichPresence discordPresence;
    memset(&discordPresence, 0, sizeof(discordPresence));
    discordPresence.state = "Going Solo";
    discordPresence.details = "Developing";
    discordPresence.largeImageKey = "logo";
    discordPresence.largeImageText = "Logo";
    discordPresence.partyId = "ae488379-351d-4a4f-ad32-2b9b01c91657";
    discordPresence.partySize = 1;
    discordPresence.partyMax = 5;
    discordPresence.spectateSecret = "MTIzNDV8MTIzNDV8MTMyNDU0";
    discordPresence.joinSecret = "MTI4NzM0OjFpMmhuZToxMjMxMjM= ";
    Discord_UpdatePresence(&discordPresence);
}
 */