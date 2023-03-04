PUSHD .
node . --connection="127.0.0.1:8079" ^
       --browser_path="C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe" ^
       --autodarts_user="TODO" ^
       --autodarts_password="TODO" ^
       --autodarts_board_id="TODO" ^
       --extern_platform="lidarts" ^
       --time_before_exit="15000" ^
       --lidarts_user="TODO" ^
       --lidarts_password="TODO" ^
       --lidarts_skip_dart_modals="true" ^
       --lidarts_chat_message_start="Hi, GD! Automated darts-scoring - powered by autodarts.io - Enter the community: https://discord.gg/bY5JYKbmvM" ^
       --lidarts_chat_message_end="Thanks GG, WP!" ^
       --nakka_skip_dart_modals="true" ^
       --dartboards_user="TODO" ^
       --dartboards_password="TODO" ^
       --dartboards_skip_dart_modals="true"

timeout 10