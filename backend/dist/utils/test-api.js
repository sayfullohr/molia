"use strict";
const BASE_URL = 'http://localhost:5000/api';
async function runTests() {
    console.log('--- 🧪 STARTING BACKEND COMPREHENSIVE SUITE ---');
    // Test 1: Health
    const healthRes = await fetch(`${BASE_URL}/health`);
    const healthData = await healthRes.json();
    console.log('✓ Test 1: Health Check ->', healthData.status === 'ok' ? 'PASS' : 'FAIL');
    // Test 2: Reserved Username rejection
    const resUsername = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: 'admin',
            password: 'StrongPass123!',
            confirmPassword: 'StrongPass123!',
        }),
    });
    console.log('✓ Test 2: Reserved username blocked ->', resUsername.status === 400 ? 'PASS' : 'FAIL');
    // Test 3: Weak password rejection
    const weakPass = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: 'TestUser1',
            password: 'weak',
            confirmPassword: 'weak',
        }),
    });
    console.log('✓ Test 3: Weak password rejected ->', weakPass.status === 400 ? 'PASS' : 'FAIL');
    const rand = Math.floor(Math.random() * 100000);
    const testUsername = `Jasur_${rand}`;
    const aliUsername = `Ali_${rand}`;
    // Test 4: Register Jasur
    const regRes = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: testUsername,
            password: 'JasurDev2026!',
            confirmPassword: 'JasurDev2026!',
        }),
    });
    const regData = await regRes.json();
    console.log('✓ Test 4: Register user ->', regRes.status === 201 ? 'PASS' : 'FAIL');
    const jasurToken = regData.data?.token;
    // Test 5: Case-insensitive duplicate rejection
    const dupRes = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: testUsername.toUpperCase(),
            password: 'AnotherPass123!',
            confirmPassword: 'AnotherPass123!',
        }),
    });
    console.log('✓ Test 5: Case-insensitive unique check ->', dupRes.status === 409 ? 'PASS' : 'FAIL');
    // Test 6: Login with wrong password
    const wrongLogin = await fetch(`${BASE_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: 'JasurDev',
            password: 'WrongPassword!',
        }),
    });
    console.log('✓ Test 6: Wrong password login fails ->', wrongLogin.status === 400 ? 'PASS' : 'FAIL');
    // Test 7: Get Profile / Me
    const meRes = await fetch(`${BASE_URL}/auth/me`, {
        headers: { Authorization: `Bearer ${jasurToken}` },
    });
    const meData = await meRes.json();
    console.log('✓ Test 7: Get Me / Profile ->', meData.data?.username === testUsername.toLowerCase() ? 'PASS' : 'FAIL', `(Level: ${meData.data?.stats?.level}, Streak: ${meData.data?.stats?.streak})`);
    // Test 8: Add Expense
    const expRes = await fetch(`${BASE_URL}/transactions`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jasurToken}`,
        },
        body: JSON.stringify({
            type: 'EXPENSE',
            amount: 35000,
            title: 'Burger',
            description: 'Mazali tushlik',
        }),
    });
    const expData = await expRes.json();
    console.log('✓ Test 8: Add Expense Transaction ->', expRes.status === 201 ? 'PASS' : 'FAIL', `(ID: ${expData.data?.id})`);
    // Test 9: Smart Text Parser
    const smartRes = await fetch(`${BASE_URL}/transactions/smart-parse`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jasurToken}`,
        },
        body: JSON.stringify({
            text: 'taksi 25 ming',
        }),
    });
    const smartData = await smartRes.json();
    console.log('✓ Test 9: Smart Text Parser ("taksi 25 ming") ->', smartData.data?.parsed?.amount === 25000 && smartData.data?.parsed?.categoryName === 'Transport' ? 'PASS' : 'FAIL', `(Amount: ${smartData.data?.parsed?.amount}, Cat: ${smartData.data?.parsed?.categoryName})`);
    // Test 10: Set Budget
    const now = new Date();
    const budRes = await fetch(`${BASE_URL}/budget`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jasurToken}`,
        },
        body: JSON.stringify({
            amount: 2000000,
            month: now.getMonth() + 1,
            year: now.getFullYear(),
        }),
    });
    console.log('✓ Test 10: Set Monthly Budget ->', budRes.status === 200 ? 'PASS' : 'FAIL');
    // Test 11: Get Dashboard Summary
    const dashRes = await fetch(`${BASE_URL}/transactions/dashboard`, {
        headers: { Authorization: `Bearer ${jasurToken}` },
    });
    const dashData = await dashRes.json();
    console.log('✓ Test 11: Dashboard Summary ->', dashData.data?.budget?.smartDailyLimit > 0 ? 'PASS' : 'FAIL', `(Balans: ${dashData.data?.balance}, Spent: ${dashData.data?.monthExpense}, DailyLimit: ${dashData.data?.budget?.smartDailyLimit})`);
    // Test 12: Register AliDev & Social
    const regAli = await fetch(`${BASE_URL}/auth/register`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
            username: aliUsername,
            password: 'AliDev2026!',
            confirmPassword: 'AliDev2026!',
        }),
    });
    const aliData = await regAli.json();
    const aliToken = aliData.data?.token;
    // Jasur sends friend request to AliDev
    const reqRes = await fetch(`${BASE_URL}/friends/request`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jasurToken}`,
        },
        body: JSON.stringify({ username: aliUsername }),
    });
    const reqData = await reqRes.json();
    // Ali accepts friend request
    const acceptRes = await fetch(`${BASE_URL}/friends/request/${reqData.data?.id}`, {
        method: 'PATCH',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${aliToken}`,
        },
        body: JSON.stringify({ action: 'ACCEPT' }),
    });
    console.log('✓ Test 12: Friend Request & Acceptance ->', acceptRes.status === 200 ? 'PASS' : 'FAIL');
    // Test 13: Chat message from AliDev to JasurDev
    const chatRes = await fetch(`${BASE_URL}/messages`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${aliToken}`,
        },
        body: JSON.stringify({
            receiverId: meData.data?.id,
            message: 'Salom Jasurbek! Bugun shashka o‘ynaymizmi?',
        }),
    });
    console.log('✓ Test 13: Real User-to-User Chat ->', chatRes.status === 201 ? 'PASS' : 'FAIL');
    // Test 14: Tic Tac Toe Game
    const gameRes = await fetch(`${BASE_URL}/games`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jasurToken}`,
        },
        body: JSON.stringify({
            gameType: 'TIC_TAC_TOE',
            opponentId: aliData.data?.user?.id,
        }),
    });
    const gameData = await gameRes.json();
    console.log('✓ Test 14: Create Tic Tac Toe Game ->', gameRes.status === 201 ? 'PASS' : 'FAIL');
    // AliDev joins game
    await fetch(`${BASE_URL}/games/${gameData.data?.id}/join`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${aliToken}`,
        },
    });
    // Make move (JasurDev plays center cell 4)
    const moveRes = await fetch(`${BASE_URL}/games/${gameData.data?.id}/move`, {
        method: 'POST',
        headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${jasurToken}`,
        },
        body: JSON.stringify({
            moveData: { cellIndex: 4 },
        }),
    });
    const moveData = await moveRes.json();
    const board = JSON.parse(moveData.data?.gameState).board;
    console.log('✓ Test 15: Valid Move Validation ->', board[4] === 'X' ? 'PASS' : 'FAIL');
    // Test 16: Security Audit Log
    const secRes = await fetch(`${BASE_URL}/security/login-history`, {
        headers: { Authorization: `Bearer ${jasurToken}` },
    });
    const secData = await secRes.json();
    const hasNoPassword = secData.data?.every((item) => !item.password && !item.passwordHash);
    console.log('✓ Test 16: Security Monitoring (Strictly NO Passwords Exposed) ->', hasNoPassword ? 'PASS' : 'FAIL', `(${secData.data?.length} attempts logged)`);
    console.log('--- 🚀 ALL 16 BACKEND SUITE TESTS COMPLETED ---');
}
runTests().catch(console.error);
