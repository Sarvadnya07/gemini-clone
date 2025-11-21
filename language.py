import google.generativeai as genai
import os

def translate_text(text, target_language):
    """
    Translates text into the specified target language using the Gemini API.
    :param text: The text to translate.
    :param target_language: The target language (e.g., 'hi' for Hindi, 'ta' for Tamil).
    :return: Translated text.
    """
    API_KEY = os.getenv('GEMINI_API_KEY', 'AIzaSyArCVvy-R7FXbiIGue8Pygu5ek1Gh3QiZs')
    genai.configure(api_key=API_KEY)
    
    model = genai.GenerativeModel("gemini-1.5-pro")  # Use an available model
    prompt = f"Translate the following text to {target_language}: {text}"
    response = model.generate_content(prompt)
    
    return response.text if response else "Translation failed."

# Supported Indian languages
INDIAN_LANGUAGES = {
    "1": ("Hindi", "hi"),
    "2": ("Bengali", "bn"),
    "3": ("Tamil", "ta"),
    "4": ("Telugu", "te"),
    "5": ("Marathi", "mr"),
    "6": ("Gujarati", "gu"),
    "7": ("Kannada", "kn"),
    "8": ("Malayalam", "ml"),
    "9": ("Punjabi", "pa"),
    "10": ("Odia", "or"),
}

if __name__ == "__main__":
    print("Choose a language to translate from English:")
    for key, (lang_name, _) in INDIAN_LANGUAGES.items():
        print(f"{key}. {lang_name}")
    
    choice = input("Enter the number corresponding to your choice: ")
    
    if choice in INDIAN_LANGUAGES:
        lang_name, lang_code = INDIAN_LANGUAGES[choice]
        text_to_translate = input("Enter the text to translate: ")
        translated_text = translate_text(text_to_translate, lang_code)
        print(f"Translated Text in {lang_name}:", translated_text)
    else:
        print("Invalid choice. Please restart and select a valid option.")