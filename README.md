# AUTODARTS-EXTERN

Autodarts-extern automates mulitple dart-platforms. 
By the time only "lidarts.org" is supported.

Tested on Windows 11 Pro x64, Nodejs v16.13.1


## INSTALL INSTRUCTION


### Setup nodejs

- Download and install nodejs 16.x.x for your specific os.


### Get the project

    git clone https://github.com/lbormann/autodarts-extern.git

Go to download-directory and type:

    npm install


## RUN IT

Note: You need to have a running caller-application (latest version) with configured 'WTT'-Argument (http://localhost:8080/throw)

### General instruction to configure and run the application

    node . --autodarts_user=<your-autodarts-email> -autodarts_password=<your-autodarts-password> --autodarts_board_id=<your-autodarts-board-id> --extern_platform=<lidarts> --lidarts_user=<your-lidarts-email> --lidarts_password=<your-lidarts-password>

Arguments:
- --autodarts_user [Required]
- --autodarts_password [Required]
- --autodarts_board_id [Required]
- --extern_platform [Required] [Possible values: lidarts]
- --time_before_exit [Optional] [Default: 10000] [Possible values: 0..Inf]
- --lidarts_user [Required]
- --lidarts_password [Required]
- --lidarts_skip_dart_modals [Optional] [Default: false] [Possible values: true|false]


### Test for working throw-receiver

To test if the app can receive throw-information, start the app, open a new tab in a browser and type "http://localhost:8080/throw/mustermann/1/50/400/false/x01"
if everything works properly you should see a message 'Throw received - ...'


## BUGS

It may be buggy. I've just coded it for fast fun with https://autodarts.io. You can give me feedback in Discord > wusaaa
The app crashes when you enter wrong password or more generel when your login data are not correct.


## TODOs
- Support other games modes (currently only X01 support)
- prevent dark-/light-mode switch
- support projection from lidarts to autodarts (multiple players)
- make port configurable
- add Readme-section for app-updates
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


## LAST WORDS
Thanks to Timo for awesome https://autodarts.io. It will be huge!
Thanks to Reepa86 for the idea!

