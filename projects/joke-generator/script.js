// API Configuration
const API_URL = 'https://official-joke-api.appspot.com/random_joke';
const MAX_HISTORY = 10;
const STORAGE_KEY = 'jokeHistory';

// DOM Elements
const getJokeBtn = document.getElementById('getJokeBtn');
const copyBtn = document.getElementById('copyBtn');
const clearHistoryBtn = document.getElementById('clearHistoryBtn');
const jokeSetup = document.getElementById('jokeSetup');
const jokePunchline = document.getElementById('jokePunchline');
const loading = document.getElementById('loading');
const errorMessage = document.getElementById('errorMessage');
const successMessage = document.getElementById('successMessage');
const historyList = document.getElementById('historyList');

let currentJoke = null;

// Initialize
document.addEventListener('DOMContentLoaded', () => {
    getJokeBtn.addEventListener('click', fetchJoke);
    copyBtn.addEventListener('click', copyToClipboard);
    clearHistoryBtn.addEventListener('click', clearHistory);
    loadHistory();
});

// Fetch Joke from API
async function fetchJoke() {
    try {
        // Show loading state
        loading.style.display = 'block';
        errorMessage.style.display = 'none';
        getJokeBtn.disabled = true;
        copyBtn.style.display = 'none';
        jokeSetup.textContent = '';
        jokePunchline.style.display = 'none';

        // Fetch from API
        const response = await fetch(API_URL);

        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        currentJoke = {
            setup: data.setup,
            punchline: data.punchline,
            timestamp: new Date()
        };

        // Display joke
        displayJoke(currentJoke);

        // Save to history
        saveToHistory(currentJoke);

    } catch (error) {
        console.error('Error fetching joke:', error);
        showError('Failed to fetch joke. Please check your internet connection and try again.');
    } finally {
        loading.style.display = 'none';
        getJokeBtn.disabled = false;
    }
}

// Display Joke
function displayJoke(joke) {
    jokeSetup.textContent = joke.setup;
    jokeSetup.style.animation = 'none';
    setTimeout(() => {
        jokeSetup.style.animation = 'slideUp 0.5s ease-out';
    }, 10);

    setTimeout(() => {
        jokePunchline.textContent = joke.punchline;
        jokePunchline.style.display = 'block';
        copyBtn.style.display = 'inline-flex';
    }, 500);
}

// Copy to Clipboard
async function copyToClipboard() {
    if (!currentJoke) return;

    const jokeText = `${currentJoke.setup}\n\n${currentJoke.punchline}`;

    try {
        await navigator.clipboard.writeText(jokeText);
        showSuccess();
    } catch (err) {
        console.error('Failed to copy:', err);
        showError('Failed to copy joke to clipboard');
    }
}

// Show Success Message
function showSuccess() {
    successMessage.style.display = 'flex';
    setTimeout(() => {
        successMessage.style.display = 'none';
    }, 2500);
}

// Show Error Message
function showError(message) {
    errorMessage.textContent = message;
    errorMessage.style.display = 'block';
    setTimeout(() => {
        errorMessage.style.display = 'none';
    }, 4000);
}

// Save to History (localStorage)
function saveToHistory(joke) {
    let history = getHistory();
    
    const jokeEntry = {
        setup: joke.setup,
        punchline: joke.punchline,
        timestamp: new Date().toLocaleTimeString()
    };

    history.unshift(jokeEntry);
    history = history.slice(0, MAX_HISTORY);
    
    localStorage.setItem(STORAGE_KEY, JSON.stringify(history));
    loadHistory();
}

// Load History from localStorage
function loadHistory() {
    const history = getHistory();
    
    if (history.length === 0) {
        historyList.innerHTML = '<p class="empty-message">No jokes yet. Start by clicking "Get Joke"!</p>';
        clearHistoryBtn.style.display = 'none';
        return;
    }

    clearHistoryBtn.style.display = 'block';
    historyList.innerHTML = '';

    history.forEach((joke, index) => {
        const jokeText = `${joke.setup} ${joke.punchline}`;
        const historyItem = document.createElement('div');
        historyItem.className = 'history-item';
        historyItem.innerHTML = `
            <div class="history-item-text">${jokeText}</div>
            <div class="history-item-time">${joke.timestamp}</div>
        `;
        historyItem.addEventListener('click', () => {
            currentJoke = {
                setup: joke.setup,
                punchline: joke.punchline,
                timestamp: new Date()
            };
            displayJoke(currentJoke);
        });
        historyList.appendChild(historyItem);
    });
}

// Get History from localStorage
function getHistory() {
    const stored = localStorage.getItem(STORAGE_KEY);
    return stored ? JSON.parse(stored) : [];
}

// Clear History
function clearHistory() {
    if (confirm('Are you sure you want to clear all joke history?')) {
        localStorage.removeItem(STORAGE_KEY);
        loadHistory();
        showSuccess();
    }
}

// Add keyboard support
document.addEventListener('keydown', (e) => {
    if (e.code === 'Space' && !getJokeBtn.disabled) {
        e.preventDefault();
        fetchJoke();
    }
});