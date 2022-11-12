<br>
<p align="center"><img src="https://user-images.githubusercontent.com/59822256/187733633-1fea1bf4-1b0a-4a1d-a10a-1af4ff0525cc.png" width="200"></p>
<h3 align="center">BUG TRACKER</h3>
<p align="center">A bug tracking bot created to assist developers.</p>


![image](https://user-images.githubusercontent.com/59822256/187736036-09c4672f-aa4d-4e9c-859e-76305c413b54.png)

<br>

<img src="https://user-images.githubusercontent.com/59822256/187736846-4f1d5512-2c3e-4dcd-a261-6451ac2c6c1e.png" width="120">

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

Follow the instructions in [`example.env`](example.env), once you've added values to the environmental variables, rename `example.env` to `.env`.
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
npm run start
```
