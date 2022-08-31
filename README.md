# AUTODARTS-EXTERN

Autodarts-extern automates multiple dart-platforms accordingly to the state of an https://autodarts.io. 
By the time only https://lidarts.org is supported.
A running instance of https://github.com/lbormann/autodarts-caller is needed that sends the thrown points to autodarts-extern.

Tested on Windows 11 Pro x64, Nodejs v16.13.1


## INSTALL INSTRUCTION


### Setup nodejs

- Download and install nodejs 16.x.x for your specific os.


### Get the project

    git clone https://github.com/lbormann/autodarts-extern.git

Go to download-directory and type:

    npm install

### Updates

- Navigate to app-directory and type "git pull". After that you need install required packages "npm install". You are good to go.


## RUN IT

- You need to have a running caller - https://github.com/lbormann/autodarts-caller - (latest version) with configured 'WTT'-Argument (http://localhost:TODO/throw)

### General instruction to configure and run the application

    node . --autodarts_user=<your-autodarts-email> -autodarts_password=<your-autodarts-password> --autodarts_board_id=<your-autodarts-board-id> --extern_platform=<lidarts> --lidarts_user=<your-lidarts-email> --lidarts_password=<your-lidarts-password>

Arguments:
- --host_port [optional] [Default: 8080]
- --autodarts_user [Required]
- --autodarts_password [Required]
- --autodarts_board_id [Required]
- --extern_platform [Required] [Possible values: lidarts]
- --time_before_exit [Optional] [Default: 10000] [Possible values: 0..Inf]
- --lidarts_user [Required]
- --lidarts_password [Required]
- --lidarts_skip_dart_modals [Optional] [Default: false] [Possible values: true|false]
- --lidarts_chat_message_start [Optional]
- --lidarts_chat_message_end [Optional]

### Shortcut for Windows

There is a file "win-start.bat". Copy this file and name it "win-start-custom.bat". Open it and configure the app with your custom requirements. Start it to run the app.
For Linux-Desktop you could create a script similar to "win-start.bat".

### Test for working throw-receiver

To test if the app can receive throw-information, start the app, open a new browser tab and type "http://localhost:TODO/throw/mustermann/1/50/400/false/x01". Replace "TODO" with your configured Port.
if everything works properly you should see a message 'Throw received - ...'


## BUGS

It may be buggy. I've just coded it for fast fun with https://autodarts.io. You can give me feedback in Discord > wusaaa
The app crashes when you enter wrong password or more generel when your login data are not correct.


## TODOs
- improve logic for choosing correct lidarts missed/finish-darts
- support other games modes (currently only X01 support)
- support projection from lidarts to autodarts (multiple players)
- add platform 'webcamdarts'
- improve main automation code-structure


### Done
- maximize windows
- disable chromium restore pages function
- handle throws after busted
- kill AD-match when lidarts-match finished
- handle how many darts used in lidarts
- on new AD-game, choose board automatically
- stop about-tab
- support bulling and other game-config stuff
- prevent dark-/light-mode switch
- make port configurable
- add start-script for windows usage
- add Readme-section for app-updates
- chat-message start- and end


## LAST WORDS
Thanks to Timo for awesome https://autodarts.io. It will be huge!
Thanks to Reepa86 for the idea!

