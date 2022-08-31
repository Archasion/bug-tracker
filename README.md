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
<script src="https://gist.github.com/Archasion/cc39f51962b00c4e4d858cabed9328c8.js"></script>

Finally, build and run the code:
```shell
npm run build
node dist/Bot.ts
```
