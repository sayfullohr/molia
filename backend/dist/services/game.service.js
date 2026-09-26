"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.gameService = exports.GameService = void 0;
const prisma_1 = require("../config/prisma");
const errors_1 = require("../utils/errors");
const gamification_service_1 = require("./gamification.service");
// 5 Uzbek Financial & Logic Questions
const DEFAULT_QUIZ_QUESTIONS = [
    {
        id: 1,
        question: 'Inflyatsiya deganda nimani tushunasiz?',
        options: [
            'Tovar va xizmatlar narxining umumiy oshishi va pul qadrining pasayishi',
            'Valyuta kursining keskin ko‘tarilishi',
            'Banklardagi omonat foizlarining kamayishi',
            'Oylik maoshlarning ikki baravar ko‘payishi',
        ],
        correctIndex: 0,
    },
    {
        id: 2,
        question: 'Daromadning qancha qismini favqulodda jamg‘armaga ajratish tavsiya etiladi?',
        options: ['Kamida 10-20%', '0%', '80%', '95%'],
        correctIndex: 0,
    },
    {
        id: 3,
        question: 'Murakkab foiz (Compound interest) ning asosiy ustunligi nimada?',
        options: [
            'Foizlar faqat boshlang‘ich summaga emas, yig‘ilgan foizlarga ham hisoblanadi',
            'Kreditni tezroq yopishga yordam beradi',
            'Bankka soliq to‘lanmaydi',
            'Valyuta tebranishidan to‘liq himoya qiladi',
        ],
        correctIndex: 0,
    },
    {
        id: 4,
        question: 'Aktiv va passiv o‘rtasidagi asosiy farq nima?',
        options: [
            'Aktiv cho‘ntagingizga pul olib keladi, passiv esa pulni olib ketadi',
            'Aktiv bu faqat ko‘chmas mulk, passiv bu mashina',
            'Ikkalasi ham bir xil tushuncha',
            'Passiv bu faqat bankdagi omonat',
        ],
        correctIndex: 0,
    },
    {
        id: 5,
        question: 'Diversifikatsiya qilish nima degani?',
        options: [
            'Mablag‘larni turli yo‘nalishlar va aktivlarga taqsimlab, xavfni kamaytirish',
            'Barcha pulni bitta biznesga tikish',
            'Faqat naqd pul saqlash',
            'Kredit hisobiga yashash',
        ],
        correctIndex: 0,
    },
];
class GameService {
    static gamePresence = new Map();
    static recordHeartbeat(userId) {
        this.gamePresence.set(userId, Date.now());
    }
    static isUserInGame(userId) {
        const lastPing = this.gamePresence.get(userId);
        if (!lastPing)
            return false;
        return (Date.now() - lastPing) < 30000;
    }
    static getActiveGameUserIds() {
        const now = Date.now();
        const activeIds = [];
        for (const [uid, timestamp] of this.gamePresence.entries()) {
            if (now - timestamp < 30000) {
                activeIds.push(uid);
            }
            else {
                this.gamePresence.delete(uid);
            }
        }
        return activeIds;
    }
    /**
     * Create a new game session
     */
    async createGame(userId, gameType, opponentId) {
        let initialState;
        if (gameType === 'TIC_TAC_TOE') {
            const state = {
                board: Array(9).fill(null),
                player1Symbol: 'X',
                player2Symbol: 'O',
            };
            initialState = state;
        }
        else if (gameType === 'QUIZ') {
            const state = {
                questions: DEFAULT_QUIZ_QUESTIONS,
                currentQuestionIndex: 0,
                player1Score: 0,
                player2Score: 0,
                player1Answered: false,
                player2Answered: false,
            };
            initialState = state;
        }
        else if (gameType === 'CHECKERS') {
            initialState = this.getInitialCheckersBoard();
        }
        if (opponentId) {
            // 1. If opponent already created a game waiting for this user, pair them immediately!
            const existingWaitingGame = await prisma_1.prisma.gameSession.findFirst({
                where: {
                    player1Id: opponentId,
                    player2Id: userId,
                    gameType,
                    status: 'WAITING',
                },
                orderBy: { createdAt: 'desc' },
            });
            if (existingWaitingGame) {
                const joinedGame = await prisma_1.prisma.gameSession.update({
                    where: { id: existingWaitingGame.id },
                    data: {
                        status: 'IN_PROGRESS',
                    },
                    include: {
                        player1: { select: { id: true, username: true } },
                        player2: { select: { id: true, username: true } },
                    },
                });
                return joinedGame;
            }
            // 2. If this user already created a waiting game with this opponent, reuse it!
            const myWaitingGame = await prisma_1.prisma.gameSession.findFirst({
                where: {
                    player1Id: userId,
                    player2Id: opponentId,
                    gameType,
                    status: 'WAITING',
                },
                orderBy: { createdAt: 'desc' },
                include: {
                    player1: { select: { id: true, username: true } },
                    player2: { select: { id: true, username: true } },
                },
            });
            if (myWaitingGame) {
                return myWaitingGame;
            }
        }
        const game = await prisma_1.prisma.gameSession.create({
            data: {
                gameType,
                player1Id: userId,
                player2Id: opponentId || null,
                status: opponentId ? 'WAITING' : 'IN_PROGRESS', // Solo against self or waiting for invite
                currentTurn: userId,
                gameState: JSON.stringify(initialState),
            },
            include: {
                player1: { select: { id: true, username: true } },
                player2: { select: { id: true, username: true } },
            },
        });
        if (opponentId) {
            const sender = await prisma_1.prisma.user.findUnique({
                where: { id: userId },
                select: { username: true },
            });
            await prisma_1.prisma.notification.create({
                data: {
                    userId: opponentId,
                    type: 'GAME_INVITE',
                    title: '🎮 O‘yinga taklif!',
                    message: `${sender?.username} sizni ${gameType} o‘ynashga taklif qildi.`,
                },
            });
        }
        return game;
    }
    /**
     * Check if there is an active game invite waiting for this user
     */
    async getPendingInvite(userId) {
        const invite = await prisma_1.prisma.gameSession.findFirst({
            where: {
                player2Id: userId,
                status: 'WAITING',
            },
            include: {
                player1: { select: { id: true, username: true } },
            },
            orderBy: { createdAt: 'desc' },
        });
        return invite;
    }
    /**
     * Join an open or invited game
     */
    async joinGame(gameId, userId) {
        const game = await prisma_1.prisma.gameSession.findUnique({
            where: { id: gameId },
        });
        if (!game)
            throw new errors_1.NotFoundError('O‘yin topilmadi');
        if (game.player1Id === userId)
            throw new errors_1.BadRequestError('Siz allaqachon bu o‘yindasiz');
        if (game.player2Id && game.player2Id !== userId) {
            throw new errors_1.BadRequestError('Bu o‘yinga boshqa o‘yinchi biriktirilgan');
        }
        const updated = await prisma_1.prisma.gameSession.update({
            where: { id: gameId },
            data: {
                player2Id: userId,
                status: 'IN_PROGRESS',
            },
            include: {
                player1: { select: { id: true, username: true } },
                player2: { select: { id: true, username: true } },
            },
        });
        return updated;
    }
    /**
     * Get game session details
     */
    async getGame(gameId) {
        const game = await prisma_1.prisma.gameSession.findUnique({
            where: { id: gameId },
            include: {
                player1: { select: { id: true, username: true } },
                player2: { select: { id: true, username: true } },
                winner: { select: { id: true, username: true } },
                moves: { orderBy: { moveIndex: 'asc' } },
            },
        });
        if (!game)
            throw new errors_1.NotFoundError('O‘yin topilmadi');
        return game;
    }
    /**
     * Process a move with server-side validation
     */
    async makeMove(gameId, userId, moveData) {
        const game = await prisma_1.prisma.gameSession.findUnique({
            where: { id: gameId },
        });
        if (!game)
            throw new errors_1.NotFoundError('O‘yin topilmadi');
        if (game.status !== 'IN_PROGRESS') {
            throw new errors_1.BadRequestError('O‘yin tugagan yoki kutilmoqda');
        }
        if (game.player1Id !== userId && game.player2Id !== userId) {
            throw new errors_1.ForbiddenError('Siz ushbu o‘yin ishtirokchisi emassiz');
        }
        if (game.gameType !== 'QUIZ' && game.currentTurn !== userId) {
            throw new errors_1.BadRequestError('Hozir sizning navbatingiz emas');
        }
        let nextState;
        let nextTurn = game.currentTurn;
        let status = game.status;
        let winnerId = null;
        if (game.gameType === 'TIC_TAC_TOE') {
            const result = this.processTicTacToeMove(game, userId, moveData);
            nextState = result.state;
            nextTurn = result.nextTurn;
            status = result.status;
            winnerId = result.winnerId;
        }
        else if (game.gameType === 'QUIZ') {
            const result = this.processQuizMove(game, userId, moveData);
            nextState = result.state;
            nextTurn = result.nextTurn;
            status = result.status;
            winnerId = result.winnerId;
        }
        else if (game.gameType === 'CHECKERS') {
            const result = this.processCheckersMove(game, userId, moveData);
            nextState = result.state;
            nextTurn = result.nextTurn;
            status = result.status;
            winnerId = result.winnerId;
        }
        // Save move and update session
        const moveCount = await prisma_1.prisma.gameMove.count({ where: { gameId } });
        await prisma_1.prisma.$transaction([
            prisma_1.prisma.gameMove.create({
                data: {
                    gameId,
                    playerId: userId,
                    moveData: JSON.stringify(moveData),
                    moveIndex: moveCount + 1,
                },
            }),
            prisma_1.prisma.gameSession.update({
                where: { id: gameId },
                data: {
                    gameState: JSON.stringify(nextState),
                    currentTurn: nextTurn,
                    status,
                    winnerId,
                },
            }),
        ]);
        // Handle end of game rewards
        if (status === 'COMPLETED' || status === 'DRAW') {
            // Award participants +10 XP
            await gamification_service_1.gamificationService.addXP(game.player1Id, 10, 'O‘yin yakunlandi (+10 XP)');
            if (game.player2Id) {
                await gamification_service_1.gamificationService.addXP(game.player2Id, 10, 'O‘yin yakunlandi (+10 XP)');
            }
            if (winnerId) {
                // Winner gets +20 XP
                await gamification_service_1.gamificationService.addXP(winnerId, 20, 'O‘yinda g‘alaba (+20 XP)');
                await gamification_service_1.gamificationService.checkAndUnlockAchievement(winnerId, 'FIRST_GAME_WIN');
                if (game.gameType === 'QUIZ') {
                    await gamification_service_1.gamificationService.checkAndUnlockAchievement(winnerId, 'QUIZ_MASTER');
                }
            }
        }
        return this.getGame(gameId);
    }
    /**
     * Rematch: resets the board while keeping same players
     */
    async rematch(gameId, userId) {
        const game = await prisma_1.prisma.gameSession.findUnique({ where: { id: gameId } });
        if (!game)
            throw new errors_1.NotFoundError('O‘yin topilmadi');
        return this.createGame(userId, game.gameType, game.player1Id === userId ? game.player2Id : game.player1Id);
    }
    // --- GAME ENGINES ---
    processTicTacToeMove(game, userId, moveData) {
        const state = JSON.parse(game.gameState);
        const { cellIndex } = moveData;
        if (cellIndex < 0 || cellIndex > 8 || state.board[cellIndex] !== null) {
            throw new errors_1.BadRequestError('Ushbu katak bo‘sh emas yoki yaroqsiz');
        }
        const symbol = userId === game.player1Id ? state.player1Symbol : state.player2Symbol;
        state.board[cellIndex] = symbol;
        // Check winner
        const winningLines = [
            [0, 1, 2], [3, 4, 5], [6, 7, 8], // Rows
            [0, 3, 6], [1, 4, 7], [2, 5, 8], // Columns
            [0, 4, 8], [2, 4, 6], // Diagonals
        ];
        let hasWinner = false;
        for (const [a, b, c] of winningLines) {
            if (state.board[a] && state.board[a] === state.board[b] && state.board[a] === state.board[c]) {
                hasWinner = true;
                break;
            }
        }
        const isDraw = !hasWinner && state.board.every((cell) => cell !== null);
        const nextTurn = game.player2Id
            ? userId === game.player1Id
                ? game.player2Id
                : game.player1Id
            : game.player1Id;
        return {
            state,
            nextTurn: hasWinner || isDraw ? null : nextTurn,
            status: hasWinner ? 'COMPLETED' : isDraw ? 'DRAW' : 'IN_PROGRESS',
            winnerId: hasWinner ? userId : null,
        };
    }
    processQuizMove(game, userId, moveData) {
        const state = JSON.parse(game.gameState);
        const currentQ = state.questions[state.currentQuestionIndex];
        const isP1 = userId === game.player1Id;
        const isCorrect = moveData.optionIndex === currentQ.correctIndex;
        if (isP1) {
            if (isCorrect)
                state.player1Score += 1;
            state.player1Answered = true;
        }
        else {
            if (isCorrect)
                state.player2Score += 1;
            state.player2Answered = true;
        }
        // If both answered or single player
        const bothAnswered = !game.player2Id || (state.player1Answered && state.player2Answered);
        if (bothAnswered) {
            if (state.currentQuestionIndex < state.questions.length - 1) {
                state.currentQuestionIndex += 1;
                state.player1Answered = false;
                state.player2Answered = false;
            }
            else {
                // Quiz completed
                let winnerId = null;
                let status = 'COMPLETED';
                if (state.player1Score > state.player2Score) {
                    winnerId = game.player1Id;
                }
                else if (state.player2Score > state.player1Score && game.player2Id) {
                    winnerId = game.player2Id;
                }
                else {
                    status = 'DRAW';
                }
                return {
                    state,
                    nextTurn: null,
                    status,
                    winnerId,
                };
            }
        }
        return {
            state,
            nextTurn: game.currentTurn,
            status: 'IN_PROGRESS',
            winnerId: null,
        };
    }
    getInitialCheckersBoard() {
        const board = Array(8).fill(null).map(() => Array(8).fill(null));
        // Player 1 (White) rows 0, 1, 2
        for (let r = 0; r < 3; r++) {
            for (let c = 0; c < 8; c++) {
                if ((r + c) % 2 === 1) {
                    board[r][c] = { id: `p1_${r}_${c}`, player: 1, isKing: false };
                }
            }
        }
        // Player 2 (Black) rows 5, 6, 7
        for (let r = 5; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                if ((r + c) % 2 === 1) {
                    board[r][c] = { id: `p2_${r}_${c}`, player: 2, isKing: false };
                }
            }
        }
        return { board };
    }
    processCheckersMove(game, userId, moveData) {
        const state = JSON.parse(game.gameState);
        const { from, to } = moveData;
        const piece = state.board[from.r]?.[from.c];
        if (!piece)
            throw new errors_1.BadRequestError('Ushbu joyda tosh yo‘q');
        const playerNum = userId === game.player1Id ? 1 : 2;
        if (piece.player !== playerNum)
            throw new errors_1.BadRequestError('O‘zingizning toshingizni suring');
        if (state.board[to.r]?.[to.c] !== null) {
            throw new errors_1.BadRequestError('Belgilangan katak bo‘sh emas');
        }
        const rowDiff = to.r - from.r;
        const colDiff = Math.abs(to.c - from.c);
        // Normal move (1 diagonal step)
        const validDir = piece.isKing || (playerNum === 1 ? rowDiff === 1 : rowDiff === -1);
        const isStep = Math.abs(rowDiff) === 1 && colDiff === 1 && validDir;
        // Capture move (2 diagonal steps over opponent)
        const isJump = Math.abs(rowDiff) === 2 && colDiff === 2;
        if (!isStep && !isJump) {
            throw new errors_1.BadRequestError('Noto‘g‘ri shashka harakati');
        }
        if (isJump) {
            const midR = (from.r + to.r) / 2;
            const midC = (from.c + to.c) / 2;
            const captured = state.board[midR]?.[midC];
            if (!captured || captured.player === playerNum) {
                throw new errors_1.BadRequestError('Raqib toshini urish sharti bajarilmadi');
            }
            state.board[midR][midC] = null; // Remove captured piece
        }
        // Move piece
        state.board[from.r][from.c] = null;
        if ((playerNum === 1 && to.r === 7) || (playerNum === 2 && to.r === 0)) {
            piece.isKing = true;
        }
        state.board[to.r][to.c] = piece;
        // Check remaining pieces for game end
        let p1Count = 0;
        let p2Count = 0;
        for (let r = 0; r < 8; r++) {
            for (let c = 0; c < 8; c++) {
                const p = state.board[r][c];
                if (p?.player === 1)
                    p1Count++;
                if (p?.player === 2)
                    p2Count++;
            }
        }
        let winnerId = null;
        let status = 'IN_PROGRESS';
        if (p1Count === 0) {
            winnerId = game.player2Id;
            status = 'COMPLETED';
        }
        else if (p2Count === 0) {
            winnerId = game.player1Id;
            status = 'COMPLETED';
        }
        const nextTurn = game.player2Id
            ? userId === game.player1Id
                ? game.player2Id
                : game.player1Id
            : game.player1Id;
        return {
            state,
            nextTurn: status === 'COMPLETED' ? null : nextTurn,
            status,
            winnerId,
        };
    }
}
exports.GameService = GameService;
exports.gameService = new GameService();
