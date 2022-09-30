# AUTODARTS-EXTERN

Autodarts-extern automates multiple dart-web-platforms accordingly to the state of an https://autodarts.io match. 

Supported dart-web-platforms:
- https://lidarts.org
- https://nakka.com/n01/online
- https://dartboards.online


A running instance of https://github.com/lbormann/autodarts-caller is needed that sends the thrown points from https://autodarts.io to this application.


Tested on Windows 11 Pro x64, Nodejs v16.13.1


## COMPATIBILITY

x = supported
o = not (yet) supported

| Platform | Bulling | X01 Single-In, Double-Out | Cricket Standard |
| ------------- | ------------- | ------------- | ------------- |
| [Lidarts](https://lidarts.org) | x | x | x |
| [Nakka01-Online](https://nakka.com/n01/online) | x | x | o |
| [Dartboards](https://dartboards.online) | o | x | o |
| [webcamdarts](webcamdarts.com) | o | o | o |
| [Pro-Darter](http://www.pro-darter.com/) | o | o | o |


## INSTALL INSTRUCTION

### Windows

- Download the executable in the release section.

### Linux / Others

#### Setup nodejs

- Download and install nodejs 16.x.x for your specific os.


#### Get the project

    git clone https://github.com/lbormann/autodarts-extern.git

Go to download-directory and type:

    npm install


## RUN IT

### Prerequisite

You need to have a running caller - https://github.com/lbormann/autodarts-caller - (latest version) with configured 'WTT'-Argument (http://localhost:TODO/throw)


### Run by executable (Windows)

Create a shortcut of the executable; right click on the shortcut -> select properties -> add arguments in the target input at the end of the text field.

Example: C:\Downloads\autodarts-extern.exe --autodarts_user="your-autodarts-email" -autodarts_password="your-autodarts-password" --autodarts_board_id="your-autodarts-board-id" --extern_platform="lidarts" --lidarts_user="your-lidarts-email>" --lidarts_password="your-lidarts-password"

Save changes.
Click on the shortcut to start the program.


### Run by source

    node . --browser_path="path-to-your-browser-executable" --autodarts_user="your-autodarts-email" -autodarts_password="your-autodarts-password" --autodarts_board_id="your-autodarts-board-id" --extern_platform="lidarts | nakka | dartboards" --lidarts_user="your-lidarts-email>" --lidarts_password="your-lidarts-password" ... see full list of arguments below


### Arguments

- --browser_path [Required]
- --host_port [optional] [Default: 8080]
- --autodarts_user [Required]
- --autodarts_password [Required]
- --autodarts_board_id [Required]
- --extern_platform [Required] [Possible values: lidarts | nakka | dartboards]
- --time_before_exit [Optional] [Default: 10000] [Possible values: 0..Inf]
- --lidarts_user [Required for extern_platform=lidarts]
- --lidarts_password [Required for extern_platform=lidarts]
- --lidarts_skip_dart_modals [Optional] [Default: false] [Possible values: true|false]
- --lidarts_chat_message_start [Optional]
- --lidarts_chat_message_end [Optional]
- --nakka_skip_dart_modals [Optional] [Default: false] [Possible values: true|false]
- --dartboards_user [Required for extern_platform=dartboards]
- --dartboards_password [Required for extern_platform=dartboards]
- --dartboards_skip_dart_modals [Optional] [Default: false] [Possible values: true|false]


### Test for working throw-receiver

To test if the app can receive throw-information, start the app, open a new browser tab and type "http://localhost:TODO/throw/mustermann/1/50/400/false/x01". Replace "TODO" with your configured Port.
if everything works properly you should see a message 'Throw received - ...'


## BUGS

It may be buggy. I've just coded it for fast fun with https://autodarts.io. You can give me feedback in Discord > wusaaa


## TODOs
- auto-correction of AD-game when there is difference to extern-game
- improve logic for choosing correct extern-missed/finish-darts
- support other games modes (currently only X01 support)
- support projection from extern-platforms to autodarts (multiple players)
- improve main automation code-structure
- loop throw-input while it was not successful
- support https://www.webcamdarts.com/
- support automatic bulling



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
- support https://nakka.com/n01/online/
- support https://dartboards.online
- add small delay when choosing board in AD
- add cricket-support lidarts


## LAST WORDS
Thanks to Timo for awesome https://autodarts.io. It will be huge!
Thanks to Reepa86 for the idea!

