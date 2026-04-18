import requests
import json

api_key = "AIzaSyAnvlyDjPydwLGnV8M8erM6-VuYTAreRc0"
url = f"https://generativelanguage.googleapis.com/v1beta/models?key={api_key}"

try:
    response = requests.get(url)
    print(f"Status: {response.status_code}")
    if response.status_code == 200:
        data = response.json()
        models = data.get('models', [])
        print(f"Total models: {len(models)}")
        # Check for newer models first
        target_models = ["gemini-2.5-flash", "gemini-2.0-flash", "gemini-1.5-pro", "gemini-1.5-flash"]
        found_model = None
        
        for tm in target_models:
            if any(tm in m['name'] for m in models):
                found_model = tm
                break
        
        if found_model:
            print(f"FOUND: {found_model}")
        else:
            print("WARNING: Specific target models not found, but other 'gemini' models might exist.")

        # List all gemini models fully
        print("All Gemini Models:")
        for m in models:
            if "gemini" in m['name']:
                print(m['name'])
    else:
        print(response.text)
except Exception as e:
    print(e)
