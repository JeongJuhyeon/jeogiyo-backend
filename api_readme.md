POST /api/ask

Description
This endpoint processes user questions related to navigation and provides appropriate responses based on the question type.

# Request Body

The request body should conform to the following schema:

```typescript
{
spokenText: string,
coordinates: {
    latitude: number,
    longitude: number
    }
}
```

spokenText: The user's question or command in their native language.
coordinates: The current geographical location of the user.

# Response

The response follows the AskResponse schema, which includes:

```typescript
{
success: boolean,
questionType: QuestionType,
data: ResponseData
}
```

success: Indicates whether the request was processed successfully.
questionType: The classified type of the user's question.
data: Contains type-specific response data based on the questionType.

## Question Types and Response Data

### TO_DESTINATION

```typescript
{
questionType: QuestionType.TO_DESTINATION,
data: {
    directionNextStation: string,
    instructions: string[]
  }
}
```

예: 서울역 어떻게 가나요?

```typescript
{
	"questionType": "TO_DESTINATION",
	"data": {
		"directionNextStation": "서울역",
		"instructions": ["제기동으로 가는 열차를 타세요."]
	}
}
```

### REPEAT_LAST_RESPONSE

```typescript
{
    questionType: QuestionType.REPEAT_LAST_RESPONSE,
    data: {}
}
```

예: 뭐라고?

```typescript
{
    questionType: "REPEAT_LAST_RESPONSE",
    data: {}
}
```

### CONFIRM_DIRECTION

```typescript
{
questionType: QuestionType.CONFIRM_DIRECTION,
data: {
    result: ConfirmDirectionResult,
    instruction: string
  }
}

enum ConfirmDirectionResult {
    UNKNOWN = 'UNKNOWN',
    RIGHT_DIRECTION = 'RIGHT_DIRECTION',
    WRONG_DIRECTION = 'WRONG_DIRECTION',
}
```

예: 잘 가고 있나요?

```typescript
{
questionType: "CONFIRM_DIRECTION",
    data: {
    result: "RIGHT_DIRECTION",
    instruction: "잘 가고 계십니다."
  }
}
```

### UNKNOWN

```typescript
{
    questionType: QuestionType.UNKNOWN,
    data: {}
}
```

예: 오늘 날씨 어때요?

```typescript
{
    questionType: "UNKNOWN",
    data: {}
}
```
