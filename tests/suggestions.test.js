// tests/suggestions.test.js

/*
 * NOTA: Este archivo de prueba es un esquema.
 * Debido a que el entorno actual no puede simular un cliente de Discord completo
 * ni interactuar con la API de Discord, estas pruebas no se pueden ejecutar aquí.
 * Sirven como una plantilla y un ejemplo de cómo se estructurarían
 * las pruebas unitarias y de integración para esta funcionalidad usando Jest.
 *
 * Para ejecutar estas pruebas, se necesitaría:
 * 1. Un entorno de prueba completo con Jest configurado.
 * 2. Mocking (simulaciones) para las clases y métodos de `discord.js`
 *    (como `Interaction`, `User`, `Guild`, `Channel`, etc.).
 * 3. Potencialmente, un bot de prueba en un servidor de Discord de prueba.
 */

// Mock de `discord.js` (ejemplo básico)
// En un escenario real, esto sería más complejo, usando jest.mock()
const mockInteraction = {
    deferReply: jest.fn(),
    editReply: jest.fn(),
    reply: jest.fn(),
    followUp: jest.fn(),
    user: { id: 'user123', username: 'TestUser' },
    member: { permissions: { has: () => true } }, // Asumir que tiene permisos por defecto
    customId: '',
    message: {
        edit: jest.fn(),
        components: []
    },
    client: {
        users: {
            fetch: jest.fn().mockResolvedValue({ send: jest.fn() })
        },
        channels: {
            cache: {
                get: jest.fn().mockReturnValue({
                    messages: {
                        fetch: jest.fn().mockResolvedValue({
                            embeds: [{ title: 'Test Embed' }],
                            components: []
                        })
                    }
                })
            }
        }
    }
};

// Mock de `jsonHandler`
jest.mock('../utils/jsonHandler', () => ({
    readJSON: jest.fn(),
    writeJSON: jest.fn(),
}));
const { readJSON, writeJSON } = require('../utils/jsonHandler');

// Importar las funciones a probar
const { handleSuggestionVote, handleSuggestionAction } = require('../handlers/suggestionHandler');

describe('Sistema de Sugerencias', () => {

    beforeEach(() => {
        // Limpiar mocks antes de cada prueba
        jest.clearAllMocks();

        // Proporcionar datos simulados para las pruebas
        const mockSuggestions = {
            counter: 1,
            suggestions: {
                '1': {
                    authorId: 'author456',
                    title: 'Mi gran idea',
                    description: 'Más unicornios en el servidor.',
                    status: 'pending',
                    messageId: 'msg789',
                    channelId: 'channel123',
                    votes: { up: [], down: [] }
                }
            }
        };
        const mockUserSuggestions = {
            'author456': { active: 1, lastSuggestion: 0 }
        };
        readJSON.mockImplementation((fileName) => {
            if (fileName === 'suggestions.json') return mockSuggestions;
            if (fileName === 'user_suggestions.json') return mockUserSuggestions;
            return {};
        });
    });

    describe('handleSuggestionVote', () => {
        it('debería registrar un voto a favor correctamente', async () => {
            mockInteraction.customId = 'suggestion_upvote_1';
            mockInteraction.user.id = 'voter1';

            await handleSuggestionVote(mockInteraction);

            // Verificar que se escribió el archivo JSON
            expect(writeJSON).toHaveBeenCalledTimes(1);
            const writtenData = writeJSON.mock.calls[0][1]; // Obtener los datos que se escribieron

            // Verificar que el voto fue añadido
            expect(writtenData.suggestions['1'].votes.up).toContain('voter1');
            
            // Verificar la respuesta al usuario
            expect(mockInteraction.editReply).toHaveBeenCalledWith({ content: '✅ ¡Gracias por tu voto a favor!' });
        });

        it('debería retirar un voto a favor si el usuario ya había votado', async () => {
            // Modificar el mock para que el usuario ya haya votado
            const mockSuggestions = readJSON('suggestions.json');
            mockSuggestions.suggestions['1'].votes.up.push('voter1');

            mockInteraction.customId = 'suggestion_upvote_1';
            mockInteraction.user.id = 'voter1';

            await handleSuggestionVote(mockInteraction);

            const writtenData = writeJSON.mock.calls[0][1];
            expect(writtenData.suggestions['1'].votes.up).not.toContain('voter1');
            expect(mockInteraction.editReply).toHaveBeenCalledWith({ content: '✅ Tu voto a favor ha sido retirado.' });
        });
    });

    describe('handleSuggestionAction (Aprobar/Rechazar)', () => {
        it('debería aprobar una sugerencia correctamente', async () => {
            mockInteraction.customId = 'suggestion_approve_1';
            mockInteraction.user.username = 'StaffMember';

            await handleSuggestionAction(mockInteraction);

            // Verificar que el estado de la sugerencia se actualizó
            const writtenSuggestions = writeJSON.mock.calls.find(call => call[0] === 'suggestions.json')[1];
            expect(writtenSuggestions.suggestions['1'].status).toBe('aprobada');
            expect(writtenSuggestions.suggestions['1'].reviewedBy).toBe('user123');

            // Verificar que el contador de sugerencias activas del usuario se redujo
            const writtenUserSuggestions = writeJSON.mock.calls.find(call => call[0] === 'user_suggestions.json')[1];
            expect(writtenUserSuggestions['author456'].active).toBe(0);

            // Verificar que se intentó notificar al autor
            expect(mockInteraction.client.users.fetch).toHaveBeenCalledWith('author456');

            // Verificar la respuesta al staff
            expect(mockInteraction.editReply).toHaveBeenCalledWith(expect.stringContaining('Sugerencia #1 ha sido **aprobada**'));
        });

        it('debería rechazar una sugerencia correctamente', async () => {
            mockInteraction.customId = 'suggestion_reject_1';
            mockInteraction.user.username = 'StaffMember';

            await handleSuggestionAction(mockInteraction);

            const writtenSuggestions = writeJSON.mock.calls.find(call => call[0] === 'suggestions.json')[1];
            expect(writtenSuggestions.suggestions['1'].status).toBe('rechazada');
            
            expect(mockInteraction.editReply).toHaveBeenCalledWith(expect.stringContaining('Sugerencia #1 ha sido **rechazada**'));
        });
    });
});
