import csv
from telethon import TelegramClient
 
api_id = '########'  #hidden
api_hash = '################################'  


session_name = 'telegram_session'
chat_name = 'username' #name of the chat that we want to retrieve data from 
client = TelegramClient(session_name, api_id, api_hash)


async def save_chat_to_csv():
    await client.start()

    chat_data = []

    async for message in client.iter_messages(chat_name):
        message_data = {
            'Message ID': message.id,
            'Date': message.date,
            'Sender ID': message.sender_id,
            'Sender Username': message.sender.username,
            'Text': message.text,
            'Media Type': message.media,
            'Reply To': message.reply_to_msg_id,
            'Forwarded From': message.fwd_from,
        }
        chat_data.append(message_data)

    csv_file_name = f'{chat_name}_chat.csv'

    with open(csv_file_name, 'w', newline='', encoding='utf-8') as csv_file:
        fieldnames = chat_data[0].keys()
        writer = csv.DictWriter(csv_file, fieldnames=fieldnames)

        writer.writeheader()
        writer.writerows(chat_data)

    print(f'Chat data saved to {csv_file_name}')


with client:
    client.loop.run_until_complete(save_chat_to_csv())