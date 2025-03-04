I'll add a comprehensive Puzzles section to the readme_backend.md file. Here's the updated version:

# ReMe Backend Documentation

This documentation provides an overview of the ReMe backend service, including API endpoints, data models, message formats, setup instructions, and puzzle functionality.

## Getting Started

### Installation and Setup

1. Install the required dependencies
2. Initialize the database
   ```
   python manage.py init_db
   python manage.py seed_db
   ```
3. Configure environment variables in `.env` file
4. Run flask app for ReMe backend
   ```
   python app/run.py
   ```
5. Test the API
   ```
   python test/api_test.py
   ```

logs are stored in `api_logs/` directory and chat records are stored in `app/static/chat_sessions` directory.


## API Overview

The ReMe backend provides several API endpoints organized into three main blueprints:

1. **User Blueprint**: User registration, authentication, and survey management
2. **Chat Blueprint**: Chat session management and messaging
3. **Lifelog Blueprint**: User lifelog entry management

## Data Models

### User Models

```
User
- id: int (primary key)
- phone: str
- password: str
- name: str
- gender: str
- birthdate_year: int
- birthdate_month: int
- created_at: datetime
- updated_at: datetime

Survey
- id: int (primary key)
- user_id: int
- survey: str (JSON)
- created_at: datetime
- updated_at: datetime
```

### Chat Models

```
ChatSession
- id: int (primary key)
- user_id: int
- puzzle_name: string
- language: string
- timestamp: int
- chat_history: str (JSON)
- created_at: datetime
- updated_at: datetime
```

### Lifelog Models

```
Lifelog
- id: int (primary key)
- user_id: int
- timestamp_ms: int
- title: string
- tags: array of strings
- content: array of objects
  {
    "type": "text"|"image"|"audio",
    "data": string
  }
- created_at: datetime
- updated_at: datetime
```

## Puzzles System

The ReMe backend includes a puzzle system that creates interactive experiences for users. Each puzzle provides a structured conversation flow with the assistant.

### Puzzle Structure

Each puzzle is created through a `make_puzzle(user_id, chat_session_id)` function that returns a puzzle instance with the following components:

1. **name**: String identifier for the puzzle
2. **model_history**: Initial chat history that serves as the model's prompt/context
3. **instruction_message**: First message from the assistant to display to the user
4. **additional_parser_rule** (optional): Special tokens/tags that will be replaced with extra information during processing

### Puzzle Implementation

Puzzles are implemented as modular components that can be added to the system. When a user requests a chat session with a specific puzzle, the system:

1. Calls the appropriate `make_puzzle()` function
2. Initializes the chat session with the puzzle's model history
3. Sends the instruction message to the user
4. Applies any additional parsing rules during the conversation

### Custom Parser Rules

The optional `additional_parser_rule` allows puzzles to customize the conversation with dynamic content. These rules define how special tokens in the model's responses should be replaced with user-specific information. For example:
- "<end>" : to end a puzzle caht
- "<hint>" : to provide a hint

### Puzzle Selection and Management

Available puzzles can be retrieved via the `/api/v1/chat/puzzle` endpoint. To create and customize a puzzle, add puzzle in `utils/cognitive_puzzle/{puzzlename}_{langage}.py`.

## Chat Message Formats

The system handles multiple message formats for different purposes:

### 1. Model Input/Output Format

Used when communicating with chat models like GPT-4o:

```json
[
    {
        "role": "system", 
        "content": "You are a helpful assistant."
    },
    {
        "role": "user", 
        "content": [  
            { 
                "type": "text", 
                "text": "Describe this picture:" 
            },
            { 
                "type": "image_url",
                "image_url": {
                    "url": "<image URL or base64 data URI>"
                }
            }
        ]
    }
]
```

Key points:
- Each message has a `role` (system, user, or assistant)
- Content can be a string (for text-only messages) or an array of content objects
- For multimodal content, each object has a `type` field
- Images can be passed via URL or base64-encoded data

### 2. Display/Storage Format

Used for storing messages in the database and for client-side display:

```json
{
    "role": "user"|"assistant",
    "content": [
        {
            "type": "text"|"image"|"audio"|"interactive_card",
            "data": "string" 
        },
        ...
    ],
    "extra_info": {}
}
```

Key points:
- `type` defines the content type (text, image, audio, or interactive_card)
- `data` contains the actual content
- `extra_info` may contain additional metadata or control information

### 3. Format Conversion

The system handles conversion between these formats:
- User input → Model input
- Model output → Display format

### 4. Processing Flow

1. Create a new model history array
2. Initialize with puzzle-specific prompt
3. Optionally get an initial model response
4. Parse to display format for the client
5. For each user input:
   - Convert to model input format
   - Get model response
   - Convert response to display format
   - Update history

## API Endpoints

### User Blueprint

#### POST /api/v1/user/register

Register a new user

**Request Parameters:**
- phone*: string
- password*: string
- name: string
- gender: string
- birthdate_year: integer
- birthdate_month: integer

**Response:**
```json
{
    "code": 200,
    "message": "success",
    "data": {
        "user_id": integer,
        "phone": string
    }
}
```

#### POST /api/v1/user/login

User login

**Request Parameters:**
- phone*: string
- password*: string

**Response:**
```json
{
    "code": 200,
    "message": "success",
    "data": {
        "user_id": integer,
        "phone": string
    }
}
```

#### POST /api/v1/user/logout

User logout

**Prerequisites:** User must be logged in

**Request Parameters:** None

**Response:**
```json
{
    "code": 200,
    "message": "success"
}
```

#### POST /api/v1/user/survey

Submit or update user survey

**Prerequisites:** User must be logged in

**Request Parameters:**
- survey*: JSON object

**Response:**
```json
{
    "code": 200,
    "message": "Survey updated successfully"
}
```

#### GET /api/v1/user/survey

Get user survey data

**Prerequisites:** User must be logged in

**Request Parameters:** None

**Response:**
```json
{
    "code": 200,
    "message": "Survey retrieved successfully",
    "data": JSON Object
}
```

### Chat Blueprint

#### GET /api/v1/chat/puzzle

Get list of available puzzles

**Prerequisites:** User must be logged in

**Request Parameters:** None

**Response:**
```json
{
    "code": 200,
    "message": "success",
    "data": {
        "puzzle_list": array
    }
}
```

#### POST /api/v1/chat

Create a new chat session with a specified puzzle

**Prerequisites:** User must be logged in

**Request Parameters:**
- puzzle_name*: string
- language: string

**Response:**
```json
{
    "code": 200,
    "message": "success",
    "data": {
        "session_id": integer,
        "user_id": integer,
        "timestamp": integer,
        "puzzle_name": string,
        "language": string,
        "message": string or null
    }
}
```

#### POST /api/v1/chat/{session_id}

Send a user message to a specific chat session and get the assistant's response

**Prerequisites:** User must be logged in

**Request Parameters:**
- data*: JSON object containing user message

**Response:**
```json
{
    "code": 200,
    "message": "success",
    "data": JSON response object
}
```

#### POST /api/v1/chat/util/asr

Convert speech audio to text

**Prerequisites:** User must be logged in

**Request Parameters:**
- audio*: base64 encoded audio data

**Response:**
```json
{
    "code": 200,
    "message": "success",
    "data": string (transcribed text)
}
```

### Lifelog Blueprint

#### POST /api/v1/lifelog

Create a new lifelog entry

**Prerequisites:** User must be logged in

**Request Parameters:**
- data*: JSON object containing:
  - timestamp: integer (milliseconds)
  - title: string
  - tags: array of strings
  - content*: array of content objects

**Response:**
```json
{
    "code": 200,
    "message": "success",
    "data": {
        "id": integer
    }
}
```

#### GET /api/v1/lifelog

Get user's lifelog entries with pagination

**Prerequisites:** User must be logged in

**Request Parameters:**
- page: integer (default: 1)
- page_size: integer (default: 10)
- year: integer (optional filter by year)

**Response:**
```json
{
    "code": 200,
    "message": "success",
    "data": {
        "page": integer,
        "page_size": integer,
        "total_pages": integer,
        "total_items": integer,
        "lifelog": array of lifelog entries [title, timestamp, content]
    }
}
```

#### GET /api/v1/lifelog/{id}

Get details of a specific lifelog entry

**Prerequisites:** User must be logged in

**Request Parameters:** None (id in URL path)

**Response:**
```json
{
    "code": 200,
    "message": "success",
    "data": lifelog object
}
```

## Error Responses

The API may return the following error codes:
- 400: Bad Request (missing or invalid parameters)
- 401: Unauthorized (invalid credentials)
- 404: Not Found (resource doesn't exist)
- 500: Internal Server Error