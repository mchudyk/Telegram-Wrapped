import openai
from openai import OpenAI

def generate_image(prompt):
    client = OpenAI(api_key="sk-api_key") #hidden
    prompt = "Generate a photo that shows the lives of both companions based on the descriptions of their lives and the current context. Split the image into two equal parts showing the life of each of them independently based on the following description. " + prompt

    response = client.images.generate(
        model="dall-e-3",
        prompt=prompt,
        size="1792x1024",
        quality="standard",
        n=1,
    )

    return response.data[0].url

if __name__ == "__main__":
    import sys
    prompt = sys.argv[1]
    print(generate_image(prompt))