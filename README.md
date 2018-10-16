# VoteCheckBot

You may know that, as time passes, your voting power on the EOS platform decays and it is important to update it once in a while. This is a simple Telegram Bot that can help on this process by informing you when it is time to confirm your votes.

## Getting Started

These instructions will help you create and configure a Telegram Bot and also get you a copy of the project up and running on your machine.

### Prerequisites
#### Telegram Bot
First of all, you will need to create a Telegram Bot and get its token to access Telegram's HTTP API. This can be easily done by interacting with the [BotFather](https://telegram.me/BotFather)

Let's start by creating the bot.

```
/newbot
```

You will be asked to choose a name and username (username must end with bot).

After that, the BotFather will inform you the link and token for this bot. Make sure to save this information.

You should also register the commands this bot offers with:

```
/setcommands
```

And then:

```
register - Register EOS account
remove - Remove registerd account
```

You can also add some description using:

```
/setdescription
```

#### MongoDB
You also need a MongoDB Client runing. [Here](https://docs.mongodb.com/manual/installation/) you can find more information on how to install and run it on your machine.

#### Installing Dependecies

Just run the following command from inside the project folder. It will install all the dependecies needed.

```
npm install
```

### Configuration
Before you run the project you need to edit the config.js file and update token parameter using the one you received during the bot creation. Also, make sure that your MongoDB URL is right.

## Running
Now you just need to run the project.

```
node main.js
```

And that's all, just start a conversation with your bot and begin to use it.
