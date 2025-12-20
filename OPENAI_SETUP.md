# 🤖 OpenAI API Integration Guide

## Setup Instructions

### 1. Get OpenAI API Key

1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Copy the key (starts with `sk-`)

### 2. Configure for Development

Create `.dev.vars` file in project root:

```env
OPENAI_API_KEY=sk-your-api-key-here
```

### 3. Configure for Production

```bash
# Set as Cloudflare secret
npx wrangler pages secret put OPENAI_API_KEY --project-name passionbots-lms
# When prompted, paste your API key
```

### 4. Update Backend Code

In `src/index.tsx`, update the AI chat route:

```typescript
app.post('/api/ai/chat', async (c) => {
  try {
    const { studentId, messageType, messageText, context } = await c.req.json()
    
    // Save to database
    await c.env.DB.prepare(`
      INSERT INTO ai_chat_history (student_id, message_type, message_text, context)
      VALUES (?, ?, ?, ?)
    `).bind(studentId, messageType, messageText, context || null).run()
    
    // Call OpenAI API
    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${c.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        model: 'gpt-4',
        messages: [
          {
            role: 'system',
            content: `You are an expert IoT & Robotics tutor for PassionBots LMS. 
                     Help students learn ESP32, sensors, actuators, and IoT concepts.
                     Be encouraging, clear, and provide step-by-step explanations.`
          },
          {
            role: 'user',
            content: messageText
          }
        ],
        temperature: 0.7,
        max_tokens: 500
      })
    })
    
    const data = await openaiResponse.json()
    const response = data.choices[0].message.content
    
    // Save AI response
    await c.env.DB.prepare(`
      INSERT INTO ai_chat_history (student_id, message_type, message_text, context)
      VALUES (?, 'assistant', ?, ?)
    `).bind(studentId, response, context || null).run()
    
    return c.json({ response })
  } catch (error) {
    console.error('AI Chat Error:', error)
    return c.json({ 
      error: 'Failed to process chat',
      response: "I'm having trouble connecting right now. Please try again."
    }, 500)
  }
})
```

### 5. Update Type Definitions

In `src/index.tsx`, update Bindings:

```typescript
type Bindings = {
  DB: D1Database;
  OPENAI_API_KEY: string;  // Add this
}
```

### 6. Test Locally

```bash
# Start with .dev.vars
npm run dev:sandbox

# Test AI chat
curl -X POST http://localhost:3000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "studentId": 1,
    "messageType": "user",
    "messageText": "Explain how ESP32 WiFi works"
  }'
```

### 7. Deploy

```bash
npm run build
npm run deploy:prod
```

## Advanced Features

### Auto-Grading

```typescript
app.post('/api/ai/grade-assignment', async (c) => {
  const { code, assignmentId } = await c.req.json()
  
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${c.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'You are a code reviewer. Analyze the code and provide: score (0-100), feedback, strengths, areas for improvement.'
        },
        {
          role: 'user',
          content: `Review this code:\n\n${code}`
        }
      ],
      temperature: 0.3
    })
  })
  
  const data = await response.json()
  return c.json({ review: data.choices[0].message.content })
})
```

### Smart Recommendations

```typescript
app.get('/api/ai/recommendations/:studentId', async (c) => {
  const studentId = c.req.param('studentId')
  
  // Get student progress
  const progress = await c.env.DB.prepare(`
    SELECT * FROM student_progress WHERE student_id = ?
  `).bind(studentId).all()
  
  // Ask AI for recommendations
  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${c.env.OPENAI_API_KEY}`,
      'Content-Type': 'application/json'
    },
    body: JSON.stringify({
      model: 'gpt-4',
      messages: [
        {
          role: 'system',
          content: 'Analyze student progress and recommend next learning steps.'
        },
        {
          role: 'user',
          content: `Student progress: ${JSON.stringify(progress.results)}\n\nWhat should they learn next?`
        }
      ]
    })
  })
  
  return c.json(await response.json())
})
```

## Cost Optimization

### 1. Use GPT-3.5-Turbo for Simple Queries
```typescript
model: 'gpt-3.5-turbo'  // Cheaper, faster
```

### 2. Cache Common Responses
```typescript
const cacheKey = `ai:${messageText}`
let response = await c.env.KV.get(cacheKey)

if (!response) {
  response = await callOpenAI()
  await c.env.KV.put(cacheKey, response, { expirationTtl: 3600 })
}
```

### 3. Set Token Limits
```typescript
max_tokens: 300  // Limit response length
```

### 4. Rate Limiting
```typescript
const rateLimitKey = `ratelimit:${studentId}`
const count = await c.env.KV.get(rateLimitKey)

if (parseInt(count || '0') > 50) {
  return c.json({ error: 'Rate limit exceeded' }, 429)
}

await c.env.KV.put(rateLimitKey, (parseInt(count || '0') + 1).toString(), {
  expirationTtl: 3600
})
```

## Pricing Estimate

### GPT-4
- Input: $0.03 per 1K tokens
- Output: $0.06 per 1K tokens
- Average chat: ~500 tokens = $0.045

### GPT-3.5-Turbo
- Input: $0.001 per 1K tokens
- Output: $0.002 per 1K tokens
- Average chat: ~500 tokens = $0.0015

### Monthly Estimate (1000 students, 5 chats/day)
- GPT-4: $6,750/month
- GPT-3.5-Turbo: $225/month

**Recommendation**: Use GPT-3.5-Turbo for 90% of queries, GPT-4 for complex problems.

## Security Best Practices

1. ✅ Never expose API key in frontend
2. ✅ Always use server-side API calls
3. ✅ Implement rate limiting
4. ✅ Validate all inputs
5. ✅ Log all AI interactions
6. ✅ Monitor usage and costs
7. ✅ Set spending limits in OpenAI dashboard

## Troubleshooting

### Issue: "Invalid API Key"
**Solution**: Check that `OPENAI_API_KEY` is set correctly in `.dev.vars` or Cloudflare secrets

### Issue: "Rate limit exceeded"
**Solution**: Upgrade OpenAI plan or implement better caching

### Issue: "Timeout"
**Solution**: Increase timeout or use streaming responses

### Issue: "High costs"
**Solution**: Switch to GPT-3.5-Turbo, implement caching, set token limits

## Resources

- OpenAI API Docs: https://platform.openai.com/docs
- Pricing: https://openai.com/pricing
- Best Practices: https://platform.openai.com/docs/guides/production-best-practices
- Cloudflare Workers AI: https://developers.cloudflare.com/workers-ai/

---

**Status**: Integration ready, waiting for API key configuration
**Priority**: High for production deployment
**Estimated Setup Time**: 15 minutes
