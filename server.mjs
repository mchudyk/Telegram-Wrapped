import express from 'express';
import fetch from 'node-fetch';
import fs from 'fs';
import { exec } from 'child_process';

const app = express();
const port = 3000;
const emojiRegex = /[\p{Emoji_Presentation}\p{Extended_Pictographic}]/gu;

app.use(express.json());
app.use(express.static('public'));

const apiKey = 'sk-api_key'; // hidden


//Generating the summary image
app.get('/generate-summary-image', async (req, res) => {
    try {
        const summaryText = req.query.summaryof || "Default summary text is not provided !!!";

        exec(`python3 generate_image.py "${summaryText}"`, (error, stdout, stderr) => {
            if (error) {
                console.error(`Error: ${error.message}`);
                return res.status(500).send("Error generating summary image");
            }
            if (stderr) {
                console.error(`Stderr: ${stderr}`);
                return res.status(500).send("Error generating summary image");
            }

            res.json({ imageUrl: stdout.trim() });
        });
    } catch (error) {
        console.error("Error in /generate-summary-image:", error);
        res.status(500).send("Error generating summary image");
    }
});


//Calculating the total number of video/audio/photo messages
app.get('/video-messages', (req, res) => {
    try {
        const jsonData = JSON.parse(fs.readFileSync('sample_conversation.json', 'utf8'));

        const videoMessageCount = jsonData.filter(message => 
            message['Media Type'] && (
                message['Media Type'].includes('video/mp4') || 
                message['Media Type'].includes('audio/ogg') || 
                message['Media Type'].includes('photo')
            )
        ).length;

        res.json({ count: videoMessageCount });
    } catch (error) {
        console.error("Error in /video-message-count:", error);
        res.status(500).send("Error calculating video message count");
    }
});


//Loading chat data after pressing "Start" button
app.get('/load-chat-data', (req, res) => {
    const chatData = JSON.parse(fs.readFileSync('sample_conversation.json', 'utf-8'));

    const processedChatData = chatData.map(message => {
        const formattedMessage = `[${message['Date']} - ${message['Sender Username']}] ${message['Text']}`;
        return {
            role: 'system',
            content: formattedMessage
        };
    });

    res.json({ chatData: processedChatData });
});


//Calculating the average number of messages per day (unique number of days!)
app.get('/average-messages-per-day', (req, res) => {
    try {
        const jsonData = JSON.parse(fs.readFileSync('sample_conversation.json', 'utf8'));
        
        if (jsonData.length === 0) {
            res.json({ average: 0 });
            return;
        }

        const dateStrings = jsonData.map(message => message.Date.split(' ')[0]);
        const uniqueDates = [...new Set(dateStrings)];
        const totalDays = uniqueDates.length;

        const averageMessagesPerDay = jsonData.length / totalDays;
        
        res.json({ average: averageMessagesPerDay });
    } catch (error) {
        console.error("Error in /average-messages-per-day:", error);
        res.status(500).send("Error calculating average messages per day");
    }
});


//Finding the most frequently used emojis
app.get('/emoji-stats', (req, res) => {
    try {
        const jsonData = JSON.parse(fs.readFileSync('sample_conversation.json', 'utf8'));

        const emojiCount = {};
        jsonData.forEach(item => {
            const emojis = item.Text.match(emojiRegex) || [];
            emojis.forEach(emoji => {
                emojiCount[emoji] = (emojiCount[emoji] || 0) + 1;
            });
        });

        const topEmojis = Object.entries(emojiCount)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5);

        res.json(topEmojis);

    } catch (error) {
        console.error("Error in /emoji-stats:", error);
        res.status(500).send("Error processing emoji stats");
    }
});


//Displaying ChatGPT response for user's question
app.post('/get-response', async (req, res) => {
    const messages = req.body.messages;

    if (!messages.every(msg => typeof msg.content === 'string' && msg.content.trim() !== '')) {
        return res.status(400).json({ error: "All messages must have a non-empty content string." });
    }

    try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Authorization': `Bearer ${apiKey}`
            },
            body: JSON.stringify({
                model: "gpt-4", 
                messages: messages
            })
        });

        const data = await response.json();

        if (data.choices && data.choices.length > 0) {
            res.json({ answer: data.choices[0].message.content });
        } else {
            res.status(500).json({ error: "Invalid response from OpenAI API", details: data });
        }

    } catch (error) {
        console.error("Error:", error);
        res.status(500).json({ error: "Error fetching response from OpenAI API" });
    }
});



app.listen(port, () => {
    console.log(`Server running at http://localhost:${port}`);
});