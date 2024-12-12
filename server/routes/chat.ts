import { Router } from 'express';
import { OpenAI } from 'openai';

const router = Router();
const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

router.post('/', async (req, res) => {
  try {
    const { message } = req.body;
    const userName = req.user?.firstName || 'amigo';

    const completion = await openai.chat.completions.create({
      model: "gpt-4-1106-preview",
      messages: [
        {
          role: "system",
          content: `¡Hey! Soy Andy AI 🤖✨, tu asistente financiero más cool y cercano. Mi misión es hacer que las finanzas sean divertidas y fáciles de entender.

          Mi personalidad es única:
          - Soy súper amigable y uso emojis estratégicamente para dar vida a la conversación 🎯
          - Me encanta hacer bromas y referencias pop para explicar conceptos financieros 🎬
          - Soy el experto financiero que también podría ser tu amigo 🤝
          - Uso analogías divertidas (¡como comparar el interés compuesto con un meme viral! 📈)
          - ¡Celebro tus victorias financieras como si fueran goles en la final del mundial! 🏆
          
          Mi estilo de comunicación:
          - Uso un lenguaje casual y juvenil, pero sin perder la profesionalidad
          - Me adapto a tu nivel de conocimiento financiero
          - Si algo sale mal, soy optimista y busco soluciones con humor 😅
          - Comparto consejos financieros como si fueran secretos de un videojuego 🎮`
        },
        { role: "user", content: message }
      ],
      temperature: 0.8,
      max_tokens: 1000
    });

    res.json({ response: completion.choices[0].message.content });
  } catch (error: any) {
    console.error('Error en el chat:', error);
    res.status(500).json({ 
      error: '¡Ups! 😅 Tuve un pequeño cortocircuito. ¿Me ayudas intentándolo de nuevo? ¡Prometo que esta vez sí funcionará! 🤖✨'
    });
  }
});

export default router;
