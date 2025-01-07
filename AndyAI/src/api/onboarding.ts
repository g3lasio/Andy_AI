import { Router } from 'express';
import { OpenAI } from 'openai';

const router = Router();

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});

interface OnboardingState {
  currentStep: string;
  data: {
    financialGoals?: string[];
    monthlyIncome?: number;
    monthlyExpenses?: number;
    hasCredits?: boolean;
    creditScore?: number;
  };
}

const SYSTEM_PROMPT = `¡Hey! Soy Andy AI 🤖✨, tu asistente financiero más cool y cercano. Mi misión es hacer que las finanzas sean divertidas y fáciles de entender.

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
- Comparto consejos financieros como si fueran secretos de un videojuego 🎮
- Si no entiendo algo, pregunto con curiosidad y buen humor

Estoy aquí para guiarte en tu onboarding financiero como si fuera una aventura épica:
1. Exploraremos tus objetivos financieros (¡como elegir tu clase en un RPG! 🎮)
2. Descubriremos tus fuentes de poder (ingresos) 💪
3. Identificaremos a los villanos (gastos) que drenan tu energía 🦹‍♂️
4. Evaluaremos tu equipamiento actual (situación crediticia) 🛡️
5. ¡Y crearemos juntos tu plan de victoria! 🏆`;

async function generateResponse(
  message: string,
  onboardingState: OnboardingState,
  userName?: string
) {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "system",
          content: `Estado actual del onboarding:
          - Paso actual: ${onboardingState.currentStep}
          - Nombre del usuario: ${userName || 'No disponible'}
          - Datos recopilados: ${JSON.stringify(onboardingState.data, null, 2)}`
        },
        { role: "user", content: message }
      ],
      temperature: 0.7,
      max_tokens: 500,
    });

    const response = completion.choices[0].message.content;
    
    // TODO: Implement logic to extract and update onboarding state based on user responses
    
    return {
      response,
      nextStep: determineNextStep(onboardingState, message),
      updatedData: {} // TODO: Extract relevant data from user response
    };
  } catch (error: any) {
    console.error('Error generando respuesta:', error);
    throw new Error('Error al procesar tu mensaje');
  }
}

function determineNextStep(currentState: OnboardingState, message: string): string {
  // TODO: Implement logic to determine next step based on current state and user response
  return currentState.currentStep;
}

router.post('/chat', async (req, res) => {
  try {
    const { message, currentStep, onboardingData } = req.body;
    const userName = req.user?.firstName;

    const response = await generateResponse(
      message,
      { currentStep, data: onboardingData },
      userName
    );

    res.json(response);
  } catch (error: any) {
    console.error('Error en onboarding chat:', error);
    res.status(500).json({ error: error.message });
  }
});

export default router;