'use server';
/**
 * @fileOverview Suggests optimal resource configurations (CPU, memory) based on the application type.
 *
 * - suggestResourceConfiguration - A function that suggests resource configurations.
 * - SuggestResourceConfigurationInput - The input type for the suggestResourceConfiguration function.
 * - SuggestResourceConfigurationOutput - The return type for the suggestResourceConfiguration function.
 */

import {ai} from '@/ai/ai-instance';
import {z} from 'genkit';

const SuggestResourceConfigurationInputSchema = z.object({
  applicationType: z
    .string()
    .describe('The type of application (e.g., web, database, cache).'),
});
export type SuggestResourceConfigurationInput = z.infer<
  typeof SuggestResourceConfigurationInputSchema
>;

const SuggestResourceConfigurationOutputSchema = z.object({
  cpu: z.string().describe('The suggested CPU configuration (e.g., 100m, 1).'),
  memory: z
    .string()
    .describe('The suggested memory configuration (e.g., 128Mi, 1Gi).'),
  reason: z.string().describe('Reasoning for the suggested CPU and Memory.'),
});
export type SuggestResourceConfigurationOutput = z.infer<
  typeof SuggestResourceConfigurationOutputSchema
>;

export async function suggestResourceConfiguration(
  input: SuggestResourceConfigurationInput
): Promise<SuggestResourceConfigurationOutput> {
  return suggestResourceConfigurationFlow(input);
}

const suggestResourceConfigurationPrompt = ai.definePrompt({
  name: 'suggestResourceConfigurationPrompt',
  input: {
    schema: z.object({
      applicationType: z
        .string()
        .describe('The type of application (e.g., web, database, cache).'),
    }),
  },
  output: {
    schema: z.object({
      cpu: z.string().describe('The suggested CPU configuration (e.g., 100m, 1).'),
      memory: z
        .string()
        .describe('The suggested memory configuration (e.g., 128Mi, 1Gi).'),
      reason: z.string().describe('Reasoning for the suggested CPU and Memory.'),
    }),
  },
  prompt: `You are a Kubernetes resource configuration expert. Based on the application type provided, suggest optimal CPU and memory configurations.

Application Type: {{{applicationType}}}

Consider the typical resource requirements for the given application type. Provide a CPU and memory configuration suitable for a standard deployment.
Also explain the reason for the CPU and Memory suggestions.

Response:`,
});

const suggestResourceConfigurationFlow = ai.defineFlow<
  typeof SuggestResourceConfigurationInputSchema,
  typeof SuggestResourceConfigurationOutputSchema
>(
  {
    name: 'suggestResourceConfigurationFlow',
    inputSchema: SuggestResourceConfigurationInputSchema,
    outputSchema: SuggestResourceConfigurationOutputSchema,
  },
  async input => {
    const {output} = await suggestResourceConfigurationPrompt(input);
    return output!;
  }
);
