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

const SYSTEM_PROMPT = `Eres Andy AI, un asistente financiero amigable y profesional. 
Estás guiando a un usuario a través del proceso de onboarding para crear su perfil financiero.
Tu objetivo es recopilar información importante sobre su situación financiera de manera conversacional y amigable.

Reglas importantes:
1. Mantén un tono amigable y accesible, usando emojis ocasionalmente
2. Haz una pregunta a la vez
3. Valida y confirma la información proporcionada
4. Muestra empatía y comprensión
5. Da pequeños consejos educativos cuando sea relevante
6. Utiliza el nombre del usuario cuando lo tengas disponible

Pasos del onboarding:
1. Bienvenida y objetivos financieros
2. Información sobre ingresos
3. Información sobre gastos
4. Situación crediticia
5. Resumen y recomendaciones iniciales`;

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
