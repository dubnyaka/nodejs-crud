/** @jest-environment node */
import { jest } from '@jest/globals';

//
// Mocks for Pub/Sub
//
const subscriptionOnMock = jest.fn();
jest.mock('@google-cloud/pubsub', () => ({
    PubSub: jest.fn().mockImplementation(() => ({
        subscription: jest.fn().mockReturnValue({
            on: subscriptionOnMock,
        }),
    })),
}));

//
// Mocks for MikroORM and EntityManager
//
const findOneMock = jest
    .fn<() => Promise<{ messageId: string } | null>>()
    .mockResolvedValue(null);

const createMock = jest.fn().mockImplementation((entity, data) => data);

const persistAndFlushMock = jest.fn<() => Promise<void>>().mockResolvedValue(undefined);

const emMock = {
    findOne: findOneMock,
    create: createMock,
    persistAndFlush: persistAndFlushMock,
    fork: () => emMock,
};

const mikroORMInitMock = jest
    .fn<() => Promise<MikroORM>>()
    .mockResolvedValue({
        em: emMock,
    } as unknown as MikroORM);

jest.mock('@mikro-orm/postgresql', () => ({
    MikroORM: {
        init: mikroORMInitMock,
    },
}));

//
// Моки для логгера
//
const loggerMock = {
    info: jest.fn(),
    warn: jest.fn(),
    error: jest.fn(),
};
jest.mock('../../src/utils/logger', () => loggerMock);

//
// Import modules (db and logger are already mocked)
//
import { startSubscriber } from '../../src/subscribers/authorSubscriber';
import {MikroORM} from "@mikro-orm/postgresql";

interface MockMessage {
    ack: jest.Mock;
    id: string;
    data: Buffer;
    toString: () => string;
}

let messageHandler: (msg: any) => Promise<void>;

describe('Pub/Sub Subscriber', () => {
    beforeAll(async () => {
        await startSubscriber();

        const messageRegistration = subscriptionOnMock.mock.calls.find(
            (call) => call[0] === 'message'
        );
        if (!messageRegistration) {
            throw new Error('Message handler not registered');
        }
        messageHandler = messageRegistration[1] as (msg: any) => Promise<void>;
    });

    beforeEach(() => {
        jest.clearAllMocks();
    });

    // Function to create a mock message
    const createMockMessage = (
        id: string = 'test-message-id',
        payload: object = { authorId: 42 }
    ): MockMessage => ({
        ack: jest.fn(),
        id,
        data: Buffer.from(JSON.stringify(payload)),
        toString() {
            return this.data.toString();
        },
    });

    it('processes a new message correctly', async () => {
        const mockMessage = createMockMessage();

        await messageHandler(mockMessage);

        // Verify findOne is called with the correct parameters
        expect(findOneMock).toHaveBeenCalledWith(expect.anything(), { messageId: mockMessage.id });
        // A new record should be created for a new message
        expect(createMock).toHaveBeenCalledWith(expect.anything(), {
            messageId: mockMessage.id,
            processedAt: expect.any(Date),
        });
        expect(persistAndFlushMock).toHaveBeenCalled();
        expect(mockMessage.ack).toHaveBeenCalled();
        expect(loggerMock.info).toHaveBeenCalledWith(expect.stringContaining('Processing AUTHOR_CREATED event'));
    });

    it('if the message is already processed, only ack is called without insertion', async () => {
        findOneMock.mockResolvedValueOnce({ messageId: 'test-message-id' });
        const mockMessage = createMockMessage();

        await messageHandler(mockMessage);

        expect(findOneMock).toHaveBeenCalledWith(expect.anything(), { messageId: mockMessage.id });
        expect(createMock).not.toHaveBeenCalled();
        expect(persistAndFlushMock).not.toHaveBeenCalled();
        expect(mockMessage.ack).toHaveBeenCalled();
    });
});
