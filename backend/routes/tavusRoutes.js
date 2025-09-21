const express = require('express');
const router = express.Router();

// Tavus API proxy endpoint
router.post('/tavus/conversations', async (req, res) => {
    try {
        const TAVUS_API_KEY = '111725a842c5457887e134eac8bc41e5';
        
        console.log('Creating Tavus conversation...');
        
        const response = await fetch('https://tavusapi.com/v2/conversations', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'x-api-key': TAVUS_API_KEY,
            },
            body: JSON.stringify({
                replica_id: "r6ca16dbe104",
                conversation_name: "Copemate",
                persona_id: "p5447d939b60",
                custom_greeting: "Hi there, how can I help you today?",
                conversational_context: `You are a virtual talking psychiatrist designed to support college students facing anxiety, depression, burnout, sleep problems, academic stress, and social isolation. Speak in a warm, empathetic, stigma-free, and non-judgmental way. Start by welcoming the student, explaining confidentiality, and asking for consent to talk. Provide brief check-in questions to understand distress level, and if safe, guide them through coping strategies such as breathing exercises, grounding, or relaxation tips. When needed, offer psychoeducational resources like videos, relaxation audios, and wellness guides in regional languages. If the student wants further help, allow them to book confidential appointments with counsellors or join moderated peer support groups. Always keep answers short, supportive, and personalized. If the student expresses self-harm or harm to others, immediately activate the crisis response: calmly encourage them to contact emergency services or helplines and escalate to a human counsellor. Never judge, never give harmful instructions, and always reassure the student that reaching out is a brave step.`,
                audio_only: false,
                memory_stores: ["aditi_pfb078329b77", "aditi_p0f105b5b82e"],
                properties: {
                    participant_left_timeout: 0,
                    language: "hindi",
                },
            }),
        });

        if (!response.ok) {
            const errorText = await response.text();
            console.error('Tavus API error:', response.status, errorText);
            return res.status(response.status).json({
                error: 'Failed to create conversation',
                details: errorText
            });
        }

        const data = await response.json();
        console.log('Tavus conversation created:', data);
        
        res.json(data);
    } catch (error) {
        console.error('Error creating Tavus conversation:', error);
        res.status(500).json({
            error: 'Internal server error',
            details: error.message
        });
    }
});

module.exports = router;
