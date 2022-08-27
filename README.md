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

    node . --autodarts_user=<your-autodarts-email> -autodarts_password=<your-autodarts-password> --extern_platform=<lidarts> --lidarts_user=<your-lidarts-email> --lidarts_password=<your-lidarts-password>

Arguments:
- --autodarts_user [Required]
- --autodarts_password [Required]
- --extern_platform [Required] [Possible values: lidarts]
- --lidarts_user [Required]
- --lidarts_password [Required]


## BUGS

It may be buggy. I've just coded it for fast fun with https://autodarts.io. You can give me feedback in Discord > wusaaa
The app crashes when you enter wrong password or more generel when your login data are not correct.


## TODOs
- support bulling and other game-config stuff

### Done
- Maximize windows
- disable chromium restore pages function

### In queue
- Support other games modes (currently only X01 support)


## LAST WORDS
Thanks to Timo for awesome https://autodarts.io. It will be huge!
Thanks to Reepa86 for the idea!

