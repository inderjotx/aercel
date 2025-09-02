
export const appConfig = {
    "gitBranch": "main",
    "gitFolder": ".",
    "startCommand": {
        "nextjs-app": "npm run start",
        "discord-bot": "python3 main.py",
        "server": "npm run start",
    },
    "installCommand": {
        "nextjs-app": "npm run install",
        "discord-bot": "pip install -r requirements.txt",
        "server": "npm run install",
    },
    "buildCommand": {
        "nextjs-app": "npm run build",
        "discord-bot": "pip install -r requirements.txt",
        "server": "npm run build",
    }
}