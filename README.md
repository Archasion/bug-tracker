# Self-hosting

Create a local copy of the project
```git
git clone https://github.com/Archasion/bug-tracker.git
```

Navigate to the local project folder
```shell
cd bug-tracker
```

Install the dependencies
```shell
npm i
```

Follow the instructions in `example.env`, once you've added values to the environmental variables, rename `example.env` to `.env`.
```shell
# DATABASE (MongoDB)

# You can retrieve your Mongo URI by clicking "Connect" on your cluster followed by clicking
# "Connect your Application" and copying the displayed Mongo URI

MONGO_URI='Your Mongo URI goes here'

# TOKENS

# The token of bot can be found at https://discord.com/developers/applications/[CLIENT_ID]/bot
# Replace [CLIENT_ID] with your bot's user ID

BOT_TOKEN='Your bot token goes here'
```

Finally, build and run the code:
```shell
npm run build
node dist/Bot.ts
```
