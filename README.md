# AUTODARTS-EXTERN
[![Downloads](https://img.shields.io/github/downloads/lbormann/autodarts-extern/total.svg)](https://github.com/lbormann/autodarts-extern/releases/latest)

Autodarts-extern automates multiple dart-web-platforms accordingly to the state of an https://autodarts.io match. 
A running instance of https://github.com/lbormann/autodarts-caller is needed that sends thrown points from https://autodarts.io to this application.

You will be able to play 1vs1 on supported dart-web-platforms with your autodarts-setup.

Functional principle (Using Lidarts as an example):

1) Automatic opening of the browser.
2) Automatic login to Lidarts.
3) You initiate a game on Lidarts.
4) Once the bulling is finished on Lidarts (if set) and the game starts, another browser tab with autodarts.io will automatically open.
5) In this tab, you will be logged in automatically, and a game that matches the settings of the Lidarts game will be opened automatically.
6) You throw, and the scores are normally recognized by autodarts.
7) As soon as you pull the darts, the score is automatically transferred to the Lidarts game. As long as you don’t pull the darts, you can of course make corrections in autodarts (if necessary).
8) As soon as a leg is won on Lidarts by you or your opponent, the open game on autodarts.io is aborted (As a result, no thrown darts are recorded in the autodarts.io statistics)


## COMPATIBILITY

| Platform | Bulling | X01 Single-In, Double-Out | Cricket Standard |
| ------------- | ------------- | ------------- | ------------- |
| [Lidarts](https://lidarts.org) | :heavy_check_mark: | :heavy_check_mark: | :heavy_check_mark: |
| [Nakka01-Online](https://nakka.com/n01/online) | :heavy_check_mark: | :heavy_check_mark: | |
| [Dartboards](https://dartboards.online) | | :heavy_check_mark: | |
| [Webcamdarts](https://www.webcamdarts.com/) | | | |

Bulling supported does NOT mean it is automated; it only means that it is working properly without crashing the app.


### Desktop-OS:

- If you're running a desktop-driven OS it's recommended to use [autodarts-desktop](https://github.com/lbormann/autodarts-desktop) as it takes care of starting, updating, configurating and managing multiple apps.


### Standalone:

- Download the appropriate executable in the release section.


### By Source:

#### Setup nodejs

- Download and install nodejs 16.x.x for your specific os.


#### Get the project

    git clone https://github.com/lbormann/autodarts-extern.git

Go to download-directory and type:

    npm install


## RUN IT

### Prerequisite

* You need to have an installed caller - https://github.com/lbormann/autodarts-caller - (latest version)
* You need to have an installed google chrome browser


### Run by executable (Windows)

Create a shortcut of the executable; right click on the shortcut -> select properties -> add arguments in the target input at the end of the text field.

Example: C:\Downloads\autodarts-extern.exe --autodarts_user="your-autodarts-email" -autodarts_password="your-autodarts-password" --autodarts_board_id="your-autodarts-board-id" --extern_platform="lidarts" --lidarts_user="your-lidarts-email>" --lidarts_password="your-lidarts-password"

Save changes.
Click on the shortcut to start the program.


### Run by source

    node . --browser_path="path-to-your-chrome-browser-executable" --autodarts_user="your-autodarts-email" -autodarts_password="your-autodarts-password" --autodarts_board_id="your-autodarts-board-id" --extern_platform="lidarts | nakka | dartboards" --lidarts_user="your-lidarts-email>" --lidarts_password="your-lidarts-password" ... see full list of arguments below


### Arguments

- --connection [Optional] [Default: 127.0.0.1:8079]
- --browser_path [Required]
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
- --lidarts_cam_fullscreen [Optional]
- --nakka_skip_dart_modals [Optional] [Default: false] [Possible values: true|false]
- --dartboards_user [Required for extern_platform=dartboards]
- --dartboards_password [Required for extern_platform=dartboards]
- --dartboards_skip_dart_modals [Optional] [Default: false] [Possible values: true|false]


*`--connection`*

Host address to data-feeder (autodarts-caller). By Default this is 127.0.0.1:8079 (means your local ip-address / usually you do NOT need to change this)

*`--browser_path`*

Absolute path to chrome or chromium executable. 
On Linux-os you can type "whereis chromium" to display installation-path in terminal. Replace "chromium" depending on which browser-package is installed, e.g. "google-chrome", "google-chrome-stable", "chromium-browser". You can also use "which" as an alternative to "whereis".
On macos the path to google chrome is: /Applications/Google Chrome.app/Contents/MacOS/Google Chrome

*`--autodarts_user`*

autodarts.io user-email-adress

*`--autodarts_password`*

autodarts.io user-password

*`--autodarts_board_id`*

autodarts.io board-id

*`--extern_platform`*

Setup which platform is your target. Choose between lidarts, nakka, dartboards

*`--time_before_exit`*

How long the app wait before it exits after a match on target platform ended

*`--lidarts_user`*

lidarts user-email-adress

*`--lidarts_password`*

lidarts user-password

*`--lidarts_skip_dart_modals`*

Automates lidarts-dialogs (how many darts did you use)

*`--lidarts_chat_message_start`*

Chat text to send on match start

*`--lidarts_chat_message_end`*

Chat Text to send on match end

*`--lidarts_cam_fullscreen`*

Fullscreens opponent`s camera

*`--nakka_skip_dart_modals`*

Automates nakka-dialogs (how many darts did you use)

*`--dartboards_username`*

dartboards user-name

*`--dartboards_password`*

dartboards user-password

*`--dartboards_skip_dart_modals`*

Automates dartboards-dialogs (how many darts did you use)



## !!! IMPORTANT !!!

This application requires a running instance of autodarts-caller https://github.com/lbormann/autodarts-caller



## LAST WORDS

Thanks to Timo for awesome https://autodarts.io. It will be huge!
Thanks to Reepa86 for the idea!

