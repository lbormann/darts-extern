PUSHD .
node . --host_port="8080" ^
       --autodarts_user="TODO" ^
       --autodarts_password="TODO" ^
       --autodarts_board_id="TODO" ^
       --extern_platform="lidarts" ^
       --time_before_exit="15000" ^
       --lidarts_user="TODO" ^
       --lidarts_password="TODO" ^
       --lidarts_skip_dart_modals="true" ^
       --lidarts_chat_message_start="Hi, GD! This is an automated darts-match, powered by autodarts.io Enter the community: https://discord.gg/bY5JYKbmvM" ^
       --lidarts_chat_message_end="Thanks GG, WP!"

pause