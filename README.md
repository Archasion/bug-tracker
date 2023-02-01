<br>
<p align="center"><img src="https://user-images.githubusercontent.com/59822256/203636654-05f07e3d-7a97-45a3-aebe-66073fe19c61.png" width="200"></p>
<h3 align="center">BUG TRACKER</h3>
<p align="center">A bug tracking bot created to assist developers.</p>

![image](https://user-images.githubusercontent.com/59822256/203636819-59f960c4-23aa-4121-92eb-f0edce567086.png)

<br>

<img src="https://user-images.githubusercontent.com/59822256/203636876-1b08e854-ebdb-4bb5-b849-403193bd078e.png" width="120">

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

Follow the instructions in [`.env.example`](.env.example), once you've added values to the environmental variables, rename `.env.example` to `.env`.

```shell
# DATABASE (MongoDB)

# You can retrieve your Mongo URI by clicking "Connect" on your cluster followed by clicking
# "Connect your Application" and copying the displayed Mongo URI

MONGO_URI='Your Mongo URI goes here'

# TOKENS

# The token of bot can be found at https://discord.com/developers/applications/[CLIENT_ID]/bot
# Replace [CLIENT_ID] with your bot's user ID

PRODUCTION_BOT_TOKEN='Your production bot's token goes here'
DEVELOPMENT_BOT_TOKEN='Your development bot's token goes here'

# ENVIRONMENT
NODE_ENV='PRODUCTION or DEVELOPMENT (determines which token will be used)'
```

Finally, build and run the code:
```shell
npm run build; npm run start
```
