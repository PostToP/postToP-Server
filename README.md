# postToP-server

**postToP-server** is the core component of the postToP ecosystem, designed to capture and manage currently playing music from YouTube. It allows users to display the music they are listening to across various platforms (like Discord via [postToP-Discord](https://github.com/GitDevla/postToP-Discord)) or save and analyze it for later statistics, such as weekly top songs.

## Overview

The postToP ecosystem allows seamless tracking of music played on YouTube, offering features such as:

- **Real-time "currently playing" data**: The server retrieves and distributes the currently playing track.
- **Data analysis**: Tracks can be saved and later analyzed for generating statistics like top artists, top tracks, or listening habits over time.

## Features

- **Live Music Tracking**: Captures music currently being played on YouTube.
- **Extensible**: Easily integrates with plugins (e.g., Discord, websites) via its API.
- **Statistics**: Provides the ability to save, retrieve, and analyze listening data.

## Future Features

- GraphQL API

## Prerequisites

- Node.js (version 14 or higher)
- YouTube API key

## Installation

### Docker

1. Clone this repository:

   ```bash
   git clone https://github.com/your-username/postToP-server.git
   cd postToP-server
   ```

2. Build the Docker image:

   ```bash
    docker build -t posttop-server .
   ```

3. Run the Docker container:

   ```bash
   docker run --env TOKEN=supersecrettoken --env YT_API_KEY=123456789 --env DB_PATH=/app/db.sqlite -v local/db.sqlite:/app/db.sqlite -p 8000:8000 -t posttop-server
   ```

### Native

1. Clone this repository:

   ```bash
   git clone https://github.com/your-username/postToP-server.git
   cd postToP-server
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up the environment variables in a `.env` file:

   ```bash
   touch .env
   ```

   Example `.env`:

   ```ini
   DB_PATH="./db.sqlite"
   YT_API_KEY="1234567890"
   TOKEN="supersecrettoken"
   ```

4. Start the server:
   ```bash
   npm build && npm start
   ```

## License

This project is licensed under the [MIT License](LICENSE).
